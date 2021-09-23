import {
  getSlotDelegates,
  getStakersStake,
  getBlockInfo,
  getBundledTxs,
  isBlockSecure,
  isEdenBlock as checkIfEdenBlock,
} from './getters';
import { BNToGwei } from './utils';
import { readFromBucket, writeToBucket } from './gcloud-cache';

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
  let pastStakedTxs = false;
  const labeledTxs = [];
  transactions.forEach((tx) => {
    const bundleIndex = bundledTxs[tx.hash.toLowerCase()];
    const labeledTx = {
      bundleIndex: bundleIndex !== undefined ? bundleIndex : null,
      senderStake: stakersStake[tx.from.toLowerCase()] || 0,
      toSlot: slotDelegates.includes(tx.to.toLowerCase()),
      priorityFee: BNToGwei(tx.maxPriorityFee),
      position: tx.transactionIndex,
      nonce: tx.nonce,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      type: '',
    };
    if (labeledTx.senderStake >= 100) {
      pastStakedTxs = true;
    }
    if (isEdenBlock && labeledTx.toSlot) {
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
  const blockNumberStr = _blockNumber.toString()
  try {
      const labeledTxs = await readFromBucket(blockNumberStr)
      console.log(`Reading cache for block ${_blockNumber}`)
      return labeledTxs
  } catch (_) { }
  console.log(`Fetching data for block ${_blockNumber}`)
  const labeledTxs = await getBlockInsight(_blockNumber)
  isBlockSecure(_blockNumber)
    .then(isSecure => {
      if (isSecure) {
        console.log(`Writing data for block ${_blockNumber}`)
        writeToBucket(blockNumberStr, labeledTxs)
          .catch((e) => { console.log(`Couldn't write to storage: ${e}`) })
      }
  })
  return labeledTxs
}