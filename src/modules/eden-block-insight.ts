import { readFromBucket, writeToBucket } from './gcloud-cache';
import {
  getSlotDelegates,
  getStakersStake,
  getBlockInfo,
  getBundledTxs,
  isBlockSecure,
  isEdenBlock as checkIfEdenBlock,
} from './getters';
import { BNToGwei } from './utils';

export const getBlockInsight = async (_blockNumber) => {
  const [slotDelegates, stakersStake, blockInfo, bundledTxs, isEdenBlock] =
    await Promise.all([
      getSlotDelegates(_blockNumber - 1),
      getStakersStake(_blockNumber - 1),
      getBlockInfo(_blockNumber),
      getBundledTxs(_blockNumber),
      checkIfEdenBlock(_blockNumber),
    ]);
  const { transactions } = blockInfo;
  transactions.sort((tx0, tx1) => tx1.transactionIndex - tx0.transactionIndex); // Start at the end
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const toSlotDelegate = slotDelegates[tx.to.toLowerCase()];
    const bundleIndex = bundledTxs[tx.hash.toLowerCase()];
    const labeledTx = {
      toSlot: toSlotDelegate !== undefined ? toSlotDelegate : false,
      bundleIndex: bundleIndex !== undefined ? bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
      priorityFee: BNToGwei(tx.maxPriorityFee),
      position: tx.transactionIndex,
      nonce: tx.nonce,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      type: '',
    };
    if (isEdenBlock && labeledTx.toSlot !== false) {
      labeledTx.type = 'slot';
    } else if (labeledTx.bundleIndex !== null) {
      labeledTx.type = 'fb-bundle';
    } else if (isEdenBlock && labeledTx.senderStake >= 100) {
      labeledTx.type = 'stake';
    } else {
      labeledTx.type = 'priority-fee';
    }
    labeledTxs[labeledTx.position] = labeledTx;
  });
  return labeledTxs;
};

export const getBlockInsightAndCache = async (_blockNumber) => {
  const blockNumberStr = _blockNumber.toString();
  try {
    const labeledTxs = await readFromBucket(blockNumberStr);
    return labeledTxs;
  } catch (_) {} // eslint-disable-line no-empty
  const labeledTxs = await getBlockInsight(_blockNumber);
  isBlockSecure(_blockNumber).then((isSecure) => {
    if (isSecure) {
      writeToBucket(blockNumberStr, labeledTxs).catch((e) => {
        console.log(`Couldn't write to storage: ${e}`);
      });
    }
  });
  return labeledTxs;
};
