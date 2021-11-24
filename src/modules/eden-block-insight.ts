import { safeReadFromBucket, safeWriteToBucket } from './gcloud-cache';
import {
  getMinerTips,
  getMinerAlias,
  isFromEdenProducer,
  checkIfValidCache,
  getSlotDelegates,
  getStakersStake,
  getSlotGasCap,
  getEdenRPCTxs,
  isBlockSecure,
  getBundledTxs,
  getBlockInfo,
} from './getters';
import { makeArrayUnique } from './utils';

export const getBlockInsight = async (_blockNumber) => {
  const [bundledTxsWrapped, fromEdenProducer, slotDelegates, blockInfo] =
    await Promise.all([
      getBundledTxs(_blockNumber),
      isFromEdenProducer(_blockNumber),
      getSlotDelegates(_blockNumber - 1),
      getBlockInfo(_blockNumber),
    ]);
  const [, bundledTxs] = bundledTxsWrapped;
  const { transactions } = blockInfo;
  const uniqueSenders = makeArrayUnique(
    blockInfo.transactions.map((tx) => tx.from)
  );
  const txHashes = blockInfo.transactions.map((tx) => tx.hash);
  const [stakersStake, edenRPCTxs, minerTipToTx] = await Promise.all([
    getStakersStake(uniqueSenders, _blockNumber - 1),
    getEdenRPCTxs(txHashes),
    getMinerTips(_blockNumber, blockInfo.miner),
  ]);
  const edenRPCInfoForTx = Object.fromEntries(
    edenRPCTxs.result.map((tx) => [tx.hash, tx.blocknumber])
  );
  const orderedStake = Object.values(stakersStake).sort((a, b) => b - a);
  const isNextStake = (stake) => {
    const nextStakeMin = orderedStake[0];
    if (stake === nextStakeMin) {
      orderedStake.splice(0, 1);
      return true;
    }
    // In case there is a repeat (same sender in different txs)
    return stake > nextStakeMin;
  };
  // Dont trust tx-index of flashbots bundle txs
  const getHighestBundleTxIndex = () => {
    let highestIndex = 0;
    let bundledTxsCount = Object.keys(bundledTxs).length;
    if (bundledTxsCount > 0) {
      for (const tx of transactions) {
        if (bundledTxs[tx.hash]) {
          if (tx.index > highestIndex) {
            highestIndex = tx.index;
          }
          if (bundledTxsCount === 1) {
            return highestIndex;
          }
          bundledTxsCount--;
        }
      }
    }
    return null;
  };
  const highestBundleTxIndex = getHighestBundleTxIndex();
  const slotGasCap = getSlotGasCap();
  const slotAvlGas = Object.fromEntries([0, 1, 2].map((s) => [s, slotGasCap]));
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const toSlotDelegate = slotDelegates[tx.to.toLowerCase()];
    const bundledTx = bundledTxs[tx.hash.toLowerCase()];
    const fromLocalMiner =
      tx.from.toLowerCase() === blockInfo.miner.toLowerCase();
    const toLocalMiner = tx.to.toLowerCase() === blockInfo.miner.toLowerCase();
    const minerReward =
      bundledTx && bundledTx.minerReward
        ? bundledTx.minerReward
        : tx.txFee
        ? parseInt(tx.txFee, 16) + (minerTipToTx[tx.hash] * 1e18 || 0)
        : null;
    const labeledTx = {
      ...tx,
      fromLabel:
        getMinerAlias(tx.from) || (fromLocalMiner ? 'Local Miner' : null),
      toLabel: getMinerAlias(tx.to) || (toLocalMiner ? 'Local Miner' : null),
      toSlot: (toSlotDelegate !== undefined ? toSlotDelegate : false) as any,
      bundleIndex: bundledTx !== undefined ? bundledTx.bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
      viaEdenRPC: edenRPCInfoForTx[tx.hash] !== undefined,
      type: '',
    };
    if (minerReward !== null) labeledTx.minerReward = minerReward;

    const hasSlotPriority = () => {
      if (fromEdenProducer && labeledTx.toSlot !== false) {
        // Check that gas-limit does not exceed slot-avl-gas
        if (tx.gasLimit > slotAvlGas[labeledTx.toSlot]) {
          return false;
        }
        // Check that there is no lower nonce to non-slot or higher-slot delegate
        const inferiorSlotTxForAccount = labeledTxs
          .filter((_tx) => _tx.from === labeledTx.from)
          .find((_tx) => _tx.toSlot === false || _tx.toSlot > labeledTx.toSlot);
        if (inferiorSlotTxForAccount === undefined) {
          // Decrement used gas by slot tx if data is available
          if (tx.gasUsed) {
            slotAvlGas[labeledTx.toSlot] -= tx.gasUsed;
          }
          return true;
        }
      }
      return false;
    };
    const hasStakePriority = () => {
      return (
        fromEdenProducer &&
        labeledTx.senderStake >= 100 &&
        isNextStake(labeledTx.senderStake) &&
        (highestBundleTxIndex === null ||
          labeledTx.index > highestBundleTxIndex)
      );
    };

    if (hasSlotPriority()) {
      labeledTx.type = 'slot';
    } else if (labeledTx.bundleIndex !== null) {
      labeledTx.type = 'fb-bundle';
    } else if (hasStakePriority()) {
      labeledTx.type = 'stake';
    } else if (labeledTx.from.toLowerCase() === blockInfo.miner.toLowerCase()) {
      labeledTx.type = 'local-tx';
    } else {
      labeledTx.type = 'priority-fee';
    }
    labeledTxs[labeledTx.index] = labeledTx;
  });
  return {
    ...blockInfo,
    bundledTxsCallSuccess: bundledTxsWrapped[0],
    baseFeePerGas: blockInfo.baseFeePerGas,
    transactions: labeledTxs,
    number: _blockNumber,
    fromEdenProducer,
  };
};

export const getBlockInsightAndCache = async (_blockNumber) => {
  const blockNumberStr = _blockNumber.toString();
  const cachedResult = await safeReadFromBucket('blocks', blockNumberStr);
  if (cachedResult.error) {
    console.error(`Couldn't read from storage`);
  } else if (!checkIfValidCache(cachedResult.result)) {
    // Check cache validity
    console.error('Invalid cache');
  } else {
    cachedResult.result.bundledTxsCallSuccess = true;
    return cachedResult.result;
  }
  // Only responses from successfull calls were cached
  const blockInsight = await getBlockInsight(_blockNumber);
  if (blockInsight.bundledTxsCallSuccess) {
    isBlockSecure(_blockNumber).then((isSecure) => {
      if (isSecure) {
        safeWriteToBucket('blocks', blockNumberStr, blockInsight).then(
          ({ error, msg }) => {
            if (error) {
              console.error(`Couldn't write to storage: ${msg}`); // eslint-disable-line no-console
            }
          }
        );
      }
    });
  }
  return blockInsight;
};
