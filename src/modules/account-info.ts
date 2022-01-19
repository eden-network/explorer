import { ethers } from 'ethers';

import { getContractInfo } from './contract-info';
import {
  getEdenRPCTxsForAccount,
  getBlockInfoForBlocks,
  getTxCountForAccount,
  filterForEdenBlocks,
  getTxsForAccount,
  getSlotDelegates,
  getStakerInfo,
  getMinerAlias,
} from './getters';
import { weiToGwei } from './utils';

interface TxOverview {
  status: 'success' | 'fail';
  blockTxCount: number;
  priorityFee: number;
  viaEdenRPC: boolean;
  timestamp: number;
  isEden: boolean;
  block: number;
  index: number;
  hash: string;
  from: string;
  to: string;
}

interface AccountOverview {
  slotDelegate: number | null;
  isKnownMiner: boolean;
  label: string | null;
  edenStaked: number;
  stakerRank: number;
  txCount: number;
  address: string;
  ens?: string;
}

async function getEdenTxsForAccount(_account, _txPerPage, _page) {
  const txsForAccount = await getTxsForAccount(_account, _txPerPage, _page);
  const blocksForAccount = txsForAccount
    .map((tx) => tx.blockNumber)
    .filter((b, i, a) => a.indexOf(b) === i); // Remove duplicates
  const [edenBlocks, blockInfos, edenRPCTxs] = await Promise.all([
    filterForEdenBlocks(blocksForAccount),
    getBlockInfoForBlocks(blocksForAccount),
    getEdenRPCTxsForAccount(_account),
  ]);
  // Filter out txs that were not mined in an Eden block
  const isEdenBlock = Object.fromEntries(
    edenBlocks.blocks.map((b) => [b.number, true])
  );
  const infoForBlock = Object.fromEntries(
    blockInfos.map((r) => [r.id, r.result])
  );
  const txsForAccountEnriched = txsForAccount.map((tx) => {
    const blockInfo = infoForBlock[tx.blockNumber];
    tx.blockTxCount = blockInfo.transactions.length;
    tx.baseFee = blockInfo.baseFeePerGas || 0;
    tx.fromEdenProducer = isEdenBlock[tx.blockNumber] ?? false;
    tx.viaEdenRPC = edenRPCTxs.result.includes(tx.hash);
    return tx;
  });
  return txsForAccountEnriched;
}

export const getAccountInfo = async (
  _account,
  _txPerPage = 1000,
  _page = 1
) => {
  const accountChecksum = ethers.utils.getAddress(_account);
  const [
    txsForAccount,
    { staked: edenStaked, rank: stakerRank },
    accountTxCount,
    contractInfo,
    slotDelegates,
  ] = await Promise.all([
    getEdenTxsForAccount(accountChecksum, _txPerPage, _page),
    getStakerInfo(_account.toLowerCase()),
    getTxCountForAccount(_account),
    getContractInfo(_account),
    getSlotDelegates('latest'),
  ]);
  const contractLabel = contractInfo.contractName
    ? `Contract: ${contractInfo.contractName}`
    : null;
  const minerAlias = getMinerAlias(_account);
  const accountOverview: AccountOverview = {
    slotDelegate: slotDelegates[_account.toLowerCase()] ?? null,
    stakerRank: stakerRank && parseInt(stakerRank, 10),
    edenStaked: parseInt(edenStaked, 10) / 1e18,
    label: minerAlias || contractLabel || null,
    address: accountChecksum,
    isKnownMiner: minerAlias !== null,
    txCount: accountTxCount,
  };
  const formatTx = (_tx) => ({
    to: ethers.utils.getAddress(_tx.to || ethers.constants.AddressZero),
    priorityFee: weiToGwei(_tx.gasPrice) - weiToGwei(_tx.baseFee),
    status: _tx.isError === '0' ? 'success' : 'fail',
    index: parseInt(_tx.transactionIndex, 10),
    block: parseInt(_tx.blockNumber, 10),
    nonce: parseInt(_tx.nonce, 10),
    blockTxCount: _tx.blockTxCount,
    isEden: _tx.fromEdenProducer,
    viaEdenRPC: _tx.viaEdenRPC,
    timestamp: _tx.timeStamp,
    from: _tx.from,
    hash: _tx.hash,
  });
  const transactions: Array<TxOverview> = txsForAccount.map(formatTx);
  return { accountOverview, transactions };
};
