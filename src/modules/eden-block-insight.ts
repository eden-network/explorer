import { readFromBucket, writeToBucket } from './gcloud-cache';
import {
  isFromEdenProducer,
  checkIfValidCache,
  getSlotDelegates,
  getStakersStake,
  getCapForSlots,
  isBlockSecure,
  getBundledTxs,
  getBlockInfo,
} from './getters';
import { BNToGwei, makeArrayUnique } from './utils';

export const getBlockInsight = async (_blockNumber) => {
  const [slotDelegates, blockInfo, bundledTxs, fromEdenProducer] =
    await Promise.all([
      getSlotDelegates(_blockNumber - 1),
      getBlockInfo(_blockNumber),
      getBundledTxs(_blockNumber),
      isFromEdenProducer(_blockNumber),
    ]);
  const { transactions } = blockInfo;
  const uniqueSenders = makeArrayUnique(
    blockInfo.transactions.map((tx) => tx.from)
  );
  const stakersStake = await getStakersStake(uniqueSenders, _blockNumber - 1);
  const slotAvlGas = getCapForSlots();
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const toSlotDelegate = slotDelegates[tx.to.toLowerCase()];
    const bundleIndex = bundledTxs[tx.hash.toLowerCase()];
    const labeledTx = {
      toSlot: (toSlotDelegate !== undefined ? toSlotDelegate : false) as any,
      bundleIndex: bundleIndex !== undefined ? bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
      maxPriorityFee: BNToGwei(tx.maxPriorityFee), // Format for serialization
      position: tx.transactionIndex,
      nonce: tx.nonce,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      type: '',
    };
    if (
      fromEdenProducer &&
      labeledTx.toSlot !== false &&
      slotAvlGas[labeledTx.toSlot] > tx.gasLimit
    ) {
      slotAvlGas[labeledTx.toSlot] -= tx.gasLimit;
      labeledTx.type = 'slot';
    } else if (labeledTx.bundleIndex !== null) {
      labeledTx.type = 'fb-bundle';
    } else if (fromEdenProducer && labeledTx.senderStake >= 100) {
      labeledTx.type = 'stake';
    } else {
      labeledTx.type = 'priority-fee';
    }
    labeledTxs[labeledTx.position] = labeledTx;
  });
  return {
    ...blockInfo,
    baseFeePerGas: BNToGwei(blockInfo.baseFeePerGas), // Format for serialization
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
      console.log('Invalid cache');
      throw new Error('Invalid cache');
    }
    return blockInsight;
  } catch (_) {} // eslint-disable-line no-empty
  const blockInsight = await getBlockInsight(_blockNumber);
  isBlockSecure(_blockNumber).then((isSecure) => {
    if (isSecure) {
      writeToBucket(blockNumberStr, blockInsight).catch((e) => {
        console.log(`Couldn't write to storage:`, e); // eslint-disable-line no-console
      });
    }
  });
  return blockInsight;
};
