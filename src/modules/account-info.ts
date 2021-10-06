import { ethers } from 'ethers';

import {
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
  const txsForAccount = await getTxsForAccount(_account, _txPerPage, _page);
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
  const formatTx = (_tx) => ({
    status: _tx.successful ? 'success' : 'fail',
    timestamp: Date.parse(_tx.timestamp) / 1e3,
    nonce: accountTxCount - _tx.nonceOffset,
    gasCostUSD: Math.round(_tx.gasCostUSD),
    to: ethers.utils.getAddress(_tx.to),
    gasPrice: weiToGwei(_tx.gasPrice),
    isEden: _tx.fromEdenProducer,
    block: _tx.blockNumber,
    toLabel: _tx.toLabel,
    index: _tx.index,
    hash: _tx.hash,
  });
  const transactions: Array<TxOverview> = txsForAccount.map(formatTx);
  return { accountOverview, transactions };
};
