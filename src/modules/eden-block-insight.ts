import { readFromBucket, writeToBucket } from './gcloud-cache';
import {
  getLabelForAddress,
  isFromEdenProducer,
  checkIfValidCache,
  withinSlotGasCap,
  getSlotDelegates,
  getStakersStake,
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
  const stakersStake = await getStakersStake(uniqueSenders, _blockNumber - 1);
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const toSlotDelegate = slotDelegates[tx.to.toLowerCase()];
    const bundleIndex = bundledTxs[tx.hash.toLowerCase()];
    const labeledTx = {
      toSlot: (toSlotDelegate !== undefined ? toSlotDelegate : false) as any,
      bundleIndex: bundleIndex !== undefined ? bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
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
  try {
    const blockInsight = await readFromBucket(blockNumberStr);
    // Check cache validity
    if (!checkIfValidCache(blockInsight)) {
      console.error('Invalid cache');
      throw new Error('Invalid cache');
    }
    // Only responses from successfull calls were cached
    blockInsight.bundledTxsCallSuccess = true;
    return blockInsight;
  } catch (_) {} // eslint-disable-line no-empty
  const blockInsight = await getBlockInsight(_blockNumber);
  if (blockInsight.bundledTxsCallSuccess) {
    isBlockSecure(_blockNumber).then((isSecure) => {
      if (isSecure) {
        writeToBucket(blockNumberStr, blockInsight).catch((e) => {
          console.error(`Couldn't write to storage:`, e); // eslint-disable-line no-console
        });
      }
    });
  }
  return blockInsight;
};
