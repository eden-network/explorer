import { ethers } from 'ethers';

import {
  filterForEdenBlocks,
  getTxsForAccount,
  getLatestStake,
} from './getters';

interface TxOverview {
  status: 'success' | 'fail';
  gasPrice: number;
  block: number;
  nonce: number;
  to: string;
  hash: string;
}

interface AccountOverview {
  edenTxCount: number;
  edenStaked: number;
  allTxCount: number;
  stakerRank: number;
  address: string;
}

async function getEdenTxsForAccount(_account) {
  const endblockDefault = 99999999;
  const txsForAccount = await getTxsForAccount(endblockDefault, _account);
  const txsFromSender = txsForAccount.filter((tx) => tx.from === _account);
  const blocksForAccount = txsFromSender.map((tx) => tx.blockNumber);
  const edenBlocks = await filterForEdenBlocks(blocksForAccount);
  // Filter out txs that were not mined in an Eden block
  const isEdenBlock = Object.fromEntries(
    edenBlocks.blocks.map((b) => [b.number, true])
  );
  const edenTxsForAccount = txsFromSender.filter((tx) => {
    return isEdenBlock[tx.blockNumber] ?? false;
  });
  return {
    allTxCount: txsFromSender.length,
    edenTxsForAccount,
  };
}

export const getAccountInfo = async (_account) => {
  const formatTx = (_tx) => {
    return {
      gasPrice: Math.round(parseInt(_tx.gasPrice, 10) / 1e9),
      status: _tx.isError === '0' ? 'success' : 'fail',
      block: parseInt(_tx.blockNumber, 10),
      to: ethers.utils.getAddress(_tx.to),
      nonce: parseInt(_tx.nonce, 10),
      hash: _tx.hash,
    };
  };
  const [
    { edenTxsForAccount, allTxCount },
    { staked: edenStaked, rank: stakerRank },
  ] = await Promise.all([
    getEdenTxsForAccount(_account.toLowerCase()),
    getLatestStake(_account.toLowerCase()),
  ]);
  const accountOverview: AccountOverview = {
    address: ethers.utils.getAddress(_account),
    edenStaked: parseInt(edenStaked, 10) / 1e18,
    edenTxCount: edenTxsForAccount.length,
    allTxCount,
    stakerRank,
  };
  const transactions: Array<TxOverview> = edenTxsForAccount.map(formatTx);
  return { accountOverview, transactions };
};
