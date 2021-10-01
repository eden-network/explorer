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
  from: string;
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
  const blocksForAccount = txsForAccount.map((tx) => tx.blockNumber);
  const edenBlocks = await filterForEdenBlocks(blocksForAccount);
  // Filter out txs that were not mined in an Eden block
  const isEdenBlock = Object.fromEntries(
    edenBlocks.blocks.map((b) => [b.number, true])
  );
  const edenTxsForAccount = txsForAccount.filter((tx) => {
    return isEdenBlock[tx.blockNumber] ?? false;
  });
  return {
    allTxCount: txsForAccount.length,
    edenTxsForAccount,
  };
}

export const getAccountInfo = async (_account) => {
  const formatTx = (_tx) => {
    return {
      gasPrice: Math.round(parseInt(_tx.gasPrice, 10) / 1e9),
      status: _tx.isError === '0' ? 'success' : 'fail',
      from: ethers.utils.getAddress(_tx.from),
      block: parseInt(_tx.blockNumber, 10),
      nonce: parseInt(_tx.nonce, 10),
      hash: _tx.hash,
    };
  };
  const [
    { edenTxsForAccount, allTxCount },
    { staked: edenStaked, rank: stakerRank },
  ] = await Promise.all([
    getEdenTxsForAccount(_account),
    getLatestStake(_account),
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
