import edenData, { Network } from '@eden-network/data';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';

import { AppConfig } from '../utils/AppConfig';
import { safeFetch } from './utils';

const {
  cacheBlockConfirmations,
  graphNetworkEndpoint,
  flashbotsAPIEndpoint,
  providerEndpoint,
  cacheBlockParams,
  etherscanAPIKey,
  proxyAuthToken,
  cacheTxParams,
  slotGasCap,
  minerAlias,
  network,
} = AppConfig;

export const provider = new ethers.providers.JsonRpcProvider(
  providerEndpoint,
  network
);

export const getTxCountForAccount = async (_address) => {
  return provider
    .send('eth_getTransactionCount', [_address])
    .then((txCount) => parseInt(txCount, 16));
};

export const getAddressForENS = async (_ens: string) => {
  return provider.resolveName(_ens);
};

export const getCapForSlots = () => {
  return { 0: slotGasCap, 1: slotGasCap, 2: slotGasCap };
};

export const checkIfValidCache = (_cache) => {
  return (
    Object.keys(cacheBlockParams).every((param) => {
      return typeof _cache[param] === cacheBlockParams[param];
    }) &&
    (_cache.transactions.length === 0 ||
      Object.keys(cacheTxParams).every((param) => {
        return typeof _cache.transactions[0][param] === cacheTxParams[param];
      }))
  );
};

export const getBlockInfoForBlocks = async (_blockNums) => {
  const makeRequest = (_block) => ({
    jsonrpc: '2.0',
    id: _block,
    method: 'eth_getBlockByNumber',
    params: [`0x${parseInt(_block, 10).toString(16)}`, false],
  });
  const requests = _blockNums.map(makeRequest);
  return fetch(AppConfig.providerEndpoint, {
    method: 'POST',
    body: JSON.stringify(requests),
  }).then((r) => r.json());
};

export const isBlockSecure = async (_blockNumber) => {
  const blockHeight = await provider.getBlockNumber();
  return blockHeight >= _blockNumber + parseInt(cacheBlockConfirmations, 10);
};

export const isFromEdenProducer = async (_blockNumber) => {
  const blocksInfo = await edenData.blocks({
    startBlock: _blockNumber,
    endBlock: _blockNumber,
    fromActiveProducerOnly: false,
    network: network as Network,
  });
  if (blocksInfo.length === 0) {
    throw new Error(`Can't find block-info for block: ${_blockNumber}`);
  }
  return blocksInfo[0].fromActiveProducer;
};

export const getSlotDelegates = async (_blockNumber) => {
  const slotsInfo = await edenData.slots({
    block: _blockNumber,
    network: network as Network,
  });
  return Object.fromEntries(
    slotsInfo.map((slotInfo, slotNum) => [slotInfo.delegate, slotNum])
  );
};

export const getStakersStake = async (_accounts, _blockNumber) => {
  const weiBN = BigInt(1e18);
  const stakers = await request(
    graphNetworkEndpoint,
    gql`{
          stakers(
              where: {
                staked_gte: 100, 
                id_in: [ ${_accounts
                  .map((a) => `"${a.toLowerCase()}"`)
                  .join(',')} ]
              }, 
              block: { number: ${_blockNumber} }
            ) {
              id
              staked
            }
      }`
  );
  return Object.fromEntries(
    stakers.stakers.map((staker) => [
      staker.id,
      Number(BigInt(staker.staked) / weiBN),
    ])
  );
};

export const getBundledTxs = async (_blockNumber) => {
  return safeFetch(
    `${flashbotsAPIEndpoint}/v1/blocks?block_number=${_blockNumber}`,
    { method: 'GET', headers: { Auth: proxyAuthToken } },
    (resJson) => {
      if (!resJson || !resJson.blocks || !resJson.latest_block_number) {
        throw new Error(`Invalid response format:\n${JSON.stringify(resJson)}`);
      }
      if (resJson.latest_block_number < _blockNumber) {
        throw new Error(
          `Querying block ${_blockNumber}, but latest avl block is ${resJson.latest_block_number}`
        );
      }
      if (resJson.blocks.length === 0) {
        return [];
      }
      return Object.fromEntries(
        resJson.blocks[0].transactions
          .filter((tx) => tx.bundle_type === 'flashbots') // Exclude rogue
          .map((tx) => [tx.transaction_hash, tx.bundle_index])
      );
    }
  );
};

export const getBlockInfo = async (_blockNumber) => {
  const blockInfoRaw = await provider.send('eth_getBlockByNumber', [
    `0x${_blockNumber.toString(16)}`,
    true,
  ]);
  const baseFeePerGas = ethers.BigNumber.from(blockInfoRaw.baseFeePerGas);
  const timestamp = parseInt(blockInfoRaw.timestamp, 16);
  const gasLimit = parseInt(blockInfoRaw.gasLimit, 16);
  const gasUsed = parseInt(blockInfoRaw.gasUsed, 16);
  const miner = ethers.utils.getAddress(blockInfoRaw.miner);
  const transactions = blockInfoRaw.transactions.map((tx) => {
    return {
      maxPriorityFee: ethers.BigNumber.from(tx.gasPrice).sub(baseFeePerGas),
      to: ethers.utils.getAddress(tx.to || ethers.constants.AddressZero),
      transactionIndex: parseInt(tx.transactionIndex, 16),
      from: ethers.utils.getAddress(tx.from),
      gasLimit: parseInt(tx.gas, 16),
      nonce: parseInt(tx.nonce, 16),
      hash: tx.hash,
    };
  });
  return {
    baseFeePerGas,
    transactions,
    timestamp,
    gasLimit,
    gasUsed,
    miner,
  };
};

export const getMinerAlias = (_minerAddress) => {
  return minerAlias[_minerAddress.toLowerCase()] || null;
};

export const checkIfContractlike = async (_address) => {
  // Returns false for empty contracts (eg. 0xd8253352f6044cfe55bcc0748c3fa37b7df81f98)
  const code = await provider.send('eth_getCode', [_address]);
  return code !== '0x';
};

export const getTxsForAccount = async (_account, _offset = 10, _page = 1) => {
  const endpoint = 'https://api.etherscan.io/api';
  const query: any = {
    apikey: etherscanAPIKey,
    endblock: 99999999,
    address: _account,
    module: 'account',
    action: 'txlist',
    offset: _offset,
    startblock: 0,
    sort: 'desc',
    page: _page,
  };
  const queryString = new URLSearchParams(query);
  const url: any = new URL(endpoint);
  url.search = queryString;
  const { status, message, result } = await fetch(url.href).then((r) =>
    r.json()
  );
  if (status !== '1') {
    console.log(`Etherscan request failed: ${message}`);
    return [];
  }
  return result;
};

export const getEdenRPCTxs = async (_txs) => {
  const monitorEndpointEdenRPC = 'https://api.edennetwork.io/v1/monitor';
  const query = {
    method: 'eth_getTransactionsByHash',
    params: [_txs],
    jsonrpc: '2.0',
    id: Date.now(),
  };
  return fetch(monitorEndpointEdenRPC, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
    method: 'POST',
  }).then((r) => r.json());
};

export const filterForEdenBlocks = async (_blocks) => {
  // GraphQL returns max of 1000 entries per call
  return request(
    graphNetworkEndpoint,
    gql`{
          blocks(
            first: 1000,
            where : { 
                fromActiveProducer: true, 
                number_in: [${_blocks.join()}]
            }
          ) {
            number
          }
      }`
  );
};

export const getLatestStake = async (_staker) => {
  const response = await request(
    graphNetworkEndpoint,
    gql`{
          staker(
            id: "${_staker.toLowerCase()}"
          ) {
            staked, 
            rank
          }
      }`
  ).then((r) => r.staker);
  if (response === null) {
    return { rank: -1, staked: 0 };
  }
  return response;
};
