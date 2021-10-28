import { safeReadFromBucket, writeToBucket } from './gcloud-cache';
import {
  getLabelForAddress,
  isFromEdenProducer,
  checkIfValidCache,
  withinSlotGasCap,
  getSlotDelegates,
  getStakersStake,
  getEdenRPCTxs,
  isBlockSecure,
  getBundledTxs,
  getBlockInfo,
} from './getters';
import { BNToGwei, makeArrayUnique } from './utils';

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
  const [stakersStake, edenRPCTxs] = await Promise.all([
    getStakersStake(uniqueSenders, _blockNumber - 1),
    getEdenRPCTxs(txHashes),
  ]);
  const edenRPCInfoForTx = Object.fromEntries(
    edenRPCTxs.result.map((tx) => [tx.hash, tx.blocknumber])
  );
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const toSlotDelegate = slotDelegates[tx.to.toLowerCase()];
    const bundledTx = bundledTxs[tx.hash.toLowerCase()];
    const labeledTx = {
      toSlot: (toSlotDelegate !== undefined ? toSlotDelegate : false) as any,
      bundleIndex: bundledTx !== undefined ? bundledTx.bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
      viaEdenRPC: edenRPCInfoForTx[tx.hash] !== undefined,
      maxPriorityFee: BNToGwei(tx.maxPriorityFee), // Format for serialization
      fromLabel: getLabelForAddress(tx.from),
      toLabel: getLabelForAddress(tx.to),
      position: tx.transactionIndex,
      gasLimit: tx.gasLimit,
      nonce: tx.nonce,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      type: '',
    };
    const hasSlotPriority = () => {
      if (
        fromEdenProducer &&
        labeledTx.toSlot !== false &&
        withinSlotGasCap(tx.gasLimit)
      ) {
        // Check that there is no lower nonce to non-slot or higher-slot delegate
        const inferiorSlotTxForAccount = labeledTxs
          .filter((_tx) => _tx.from === labeledTx.from)
          .find((_tx) => _tx.toSlot === false || _tx.toSlot > labeledTx.toSlot);
        if (inferiorSlotTxForAccount === undefined) {
          return true;
        }
      }
      return false;
    };

    if (hasSlotPriority()) {
      labeledTx.type = 'slot';
    } else if (labeledTx.bundleIndex !== null) {
      labeledTx.type = 'fb-bundle';
    } else if (fromEdenProducer && labeledTx.senderStake >= 100) {
      labeledTx.type = 'stake';
    } else if (labeledTx.from.toLowerCase() === blockInfo.miner.toLowerCase()) {
      labeledTx.type = 'local-tx';
    } else {
      labeledTx.type = 'priority-fee';
    }
    labeledTxs[labeledTx.position] = labeledTx;
  });
  return {
    ...blockInfo,
    baseFeePerGas: BNToGwei(blockInfo.baseFeePerGas), // Format for serialization
    bundledTxsCallSuccess: bundledTxsWrapped[0],
    transactions: labeledTxs,
    number: _blockNumber,
    fromEdenProducer,
  };
};

export const getBlockInsightAndCache = async (_blockNumber) => {
  const blockNumberStr = _blockNumber.toString();
  const { error, result } = await safeReadFromBucket('blocks', blockNumberStr);
  if (error) {
    console.error(`Couldn't read from storage`);
  } else if (!checkIfValidCache(result)) {
    // Check cache validity
    console.error('Invalid cache');
  } else {
    result.bundledTxsCallSuccess = true;
    return result;
  }
  // Only responses from successfull calls were cached
  const blockInsight = await getBlockInsight(_blockNumber);
  if (blockInsight.bundledTxsCallSuccess) {
    isBlockSecure(_blockNumber).then((isSecure) => {
      if (isSecure) {
        writeToBucket('blocks', blockNumberStr, blockInsight).catch((e) => {
          console.error(`Couldn't write to storage:`, e); // eslint-disable-line no-console
        });
      }
    });
  }
  return blockInsight;
};
