import { ethers } from 'ethers';

import {
  getBlockInfoForBlocks,
  getTxCountForAccount,
  filterForEdenBlocks,
  getTxsForAccount,
  getLatestStake,
} from './getters';
import { weiToGwei } from './utils';

interface TxOverview {
  status: 'success' | 'fail';
  timestamp: number;
  gasPrice: number;
  isEden: boolean;
  block: number;
  nonce: number;
  index: number;
  hash: string;
  to: string;
}

interface AccountOverview {
  edenStaked: number;
  stakerRank: number;
  txCount: number;
  address: string;
}

async function getEdenTxsForAccount(_account, _txPerPage, _page) {
  const endblockDefault = 99999999;
  const txsForAccount = await getTxsForAccount(
    endblockDefault,
    _account,
    _txPerPage,
    _page
  );
  const txsFromSender = txsForAccount.filter((tx) => tx.from === _account);
  const blocksForAccount = txsFromSender
    .map((tx) => tx.blockNumber)
    .filter((b, i, a) => a.indexOf(b) === i); // Remove duplicates
  const [edenBlocks, blockInfos] = await Promise.all([
    filterForEdenBlocks(blocksForAccount),
    getBlockInfoForBlocks(blocksForAccount),
  ]);
  // Filter out txs that were not mined in an Eden block
  const isEdenBlock = Object.fromEntries(
    edenBlocks.blocks.map((b) => [b.number, true])
  );
  const infoForBlock = Object.fromEntries(
    blockInfos.map((r) => [r.id, r.result])
  );
  const txsForAccountEnriched = txsFromSender.map((tx) => {
    const blockInfo = infoForBlock[tx.blockNumber];
    tx.blockTxCount = blockInfo.transactions.length;
    tx.baseFee = blockInfo.baseFeePerGas;
    tx.fromEdenProducer = isEdenBlock[tx.blockNumber] ?? false;
    return tx;
  });
  return txsForAccountEnriched;
}

export const getAccountInfo = async (
  _account,
  _txPerPage = 1000,
  _page = 1
) => {
  const formatTx = (_tx) => {
    return {
      to: ethers.utils.getAddress(_tx.to || ethers.constants.AddressZero),
      priorityFee: weiToGwei(_tx.gasPrice) - weiToGwei(_tx.baseFee),
      status: _tx.isError === '0' ? 'success' : 'fail',
      blockTxCount: parseInt(_tx.blockTxCount, 16),
      index: parseInt(_tx.transactionIndex, 10),
      block: parseInt(_tx.blockNumber, 10),
      nonce: parseInt(_tx.nonce, 10),
      isEden: _tx.fromEdenProducer,
      timestamp: _tx.timeStamp,
      hash: _tx.hash,
    };
  };
  const [
    txsForAccount,
    { staked: edenStaked, rank: stakerRank },
    accountTxCount,
  ] = await Promise.all([
    getEdenTxsForAccount(_account.toLowerCase(), _txPerPage, _page),
    getLatestStake(_account.toLowerCase()),
    getTxCountForAccount(_account),
  ]);
  const accountOverview: AccountOverview = {
    edenStaked: parseInt(edenStaked, 10) / 1e18,
    address: ethers.utils.getAddress(_account),
    stakerRank: parseInt(stakerRank, 10),
    txCount: accountTxCount,
  };
  const transactions: Array<TxOverview> = txsForAccount.map(formatTx);
  return { accountOverview, transactions };
};
