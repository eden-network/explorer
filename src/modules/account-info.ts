import { ethers } from 'ethers';

import {
  getTxCountForAccount,
  filterForEdenBlocks,
  getTxsForAccount,
  getLatestStake,
} from './getters';

interface TxOverview {
  status: 'success' | 'fail';
  timestamp: number;
  gasPrice: number;
  isEden: boolean;
  block: number;
  nonce: number;
  hash: string;
  to: string;
}

interface AccountOverview {
  edenTxCount: number;
  edenStaked: number;
  allTxCount: number;
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
  const blocksForAccount = txsFromSender.map((tx) => tx.blockNumber);
  const edenBlocks = await filterForEdenBlocks(blocksForAccount);
  // Filter out txs that were not mined in an Eden block
  const isEdenBlock = Object.fromEntries(
    edenBlocks.blocks.map((b) => [b.number, true])
  );
  const txsForAccountEnriched = txsFromSender.map((tx) => {
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
      gasPrice: Math.round(parseInt(_tx.gasPrice, 10) / 1e9),
      status: _tx.isError === '0' ? 'success' : 'fail',
      block: parseInt(_tx.blockNumber, 10),
      to: ethers.utils.getAddress(_tx.to),
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
    address: ethers.utils.getAddress(_account),
    edenStaked: parseInt(edenStaked, 10) / 1e18,
    edenTxCount: txsForAccount.filter((tx) => tx.fromEdenProducer).length,
    allTxCount: txsForAccount.length,
    txCount: accountTxCount,
    stakerRank,
  };
  const transactions: Array<TxOverview> = txsForAccount.map(formatTx);
  return { accountOverview, transactions };
};
