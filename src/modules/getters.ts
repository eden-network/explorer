import edenData, { Network } from '@eden-network/data';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';

import { AppConfig } from '../utils/AppConfig';
import { safeFetch, sendRawJsonRPCRequest } from './utils';

const {
  cacheBlockConfirmations,
  providerEndpointGraphQl,
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

interface TransactionInfo {
  cumulativeGasUsed?: number;
  maxPriorityFee: string;
  minerReward?: string;
  gasLimit: number;
  gasUsed?: number;
  status?: number;
  txFee?: string;
  nonce: number;
  index: number;
  value: string;
  from: string;
  hash: string;
  to: string;
}
interface BlockInfoWithTxs {
  transactions: TransactionInfo[];
  baseFeePerGas: string;
  timestamp: number;
  gasLimit: number;
  gasUsed: number;
  number: number;
  miner: string;
}

export const provider = new ethers.providers.JsonRpcProvider(
  providerEndpoint,
  network
);

export const getTxReceipt = (_txHash) => {
  return sendRawJsonRPCRequest(
    'eth_getTransactionReceipt',
    [_txHash],
    providerEndpoint
  );
};

export const getTxRequest = (_txHash) => {
  return sendRawJsonRPCRequest(
    'eth_getTransactionByHash',
    [_txHash],
    providerEndpoint
  );
};

export const getLatestBlock = async () => {
  return provider.getBlockNumber();
};

export const getTxCountForAccount = async (_address) => {
  return provider
    .send('eth_getTransactionCount', [_address])
    .then((txCount) => parseInt(txCount, 16));
};

export const getAddressForENS = async (_ens: string) => {
  try {
    return await provider.resolveName(_ens);
  } catch (e) {
    console.error(`Error resolving ENS: ${e}`);
    return null;
  }
};

export const withinSlotGasCap = (_gas) => slotGasCap >= _gas;

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
  const slotProperties = [
    'expirationTime',
    'taxRatePerDay',
    'winningBid',
    'delegate',
    'startTime',
    'oldBid',
    'owner',
    'id',
  ];
  const [slotsInfo] = await request(
    graphNetworkEndpoint,
    gql`{
        networks
          ${
            _blockNumber === 'latest'
              ? ''
              : `(block: { number: ${_blockNumber} })`
          }
         {
            slot0 { ${slotProperties.toString()} },
            slot1 { ${slotProperties.toString()} },
            slot2 { ${slotProperties.toString()} }
        }
    }`
  ).then((r) => r.networks);
  const slotsInfoVals = Object.values(slotsInfo) as any;
  return Object.fromEntries(
    slotsInfoVals.map((slotInfo, slotNum) => [slotInfo.delegate, slotNum])
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

export const getBlocksPaged = async ({
  fromActiveProducerOnly,
  beforeTimestamp,
  start,
  num,
}) => {
  return request(
    graphNetworkEndpoint,
    gql`{
        blocks(
          where: {
            ${beforeTimestamp ? `timestamp_lte: ${beforeTimestamp}` : ''}
            fromActiveProducer: ${fromActiveProducerOnly},
          }
          orderDirection: desc
          orderBy: number, 
          skip: ${start}, 
          first: ${num}, 
        ) {
          timestamp,
          author,
          number,
        }
    }`
  ).then((r) =>
    r.blocks.map((blockInfo) => {
      blockInfo.timestamp = parseInt(blockInfo.timestamp, 10);
      blockInfo.number = parseInt(blockInfo.number, 10);
      return blockInfo;
    })
  );
};

export const getBundledTxs = async (_blockNumber) => {
  return safeFetch(
    `${flashbotsAPIEndpoint}/v1/blocks?block_number=${_blockNumber}`,
    { method: 'GET', headers: { Auth: proxyAuthToken } },
    ({ success, res }) => {
      if (!success) {
        console.error(`request to flashbots api failed: ${res}`);
        return [false, {}];
      }
      if (!res || !res.blocks || !res.latest_block_number) {
        throw new Error(`Invalid response format:\n${JSON.stringify(res)}`);
      }
      if (res.latest_block_number < _blockNumber) {
        throw new Error(
          `Querying block ${_blockNumber}, but latest avl block is ${res.latest_block_number}`
        );
      }
      if (res.blocks.length === 0) {
        return [true, {}];
      }
      const bundledTxs = Object.fromEntries(
        res.blocks[0].transactions
          .filter((tx) => tx.bundle_type === 'flashbots') // Exclude rogue
          .map((tx) => [
            tx.transaction_hash,
            {
              minerTip: parseInt(tx.coinbase_transfer, 10),
              minerReward: tx.total_miner_reward,
              bundleIndex: tx.bundle_index,
            },
          ])
      );
      return [true, bundledTxs];
    }
  );
};

export const fetchBlockInfoGraphQl = async (
  _blockNumber
): Promise<BlockInfoWithTxs> => {
  const blockInfoRaw = await request(
    providerEndpointGraphQl,
    gql`{
          block(number: ${_blockNumber}) {
              miner { address }
              baseFeePerGas
              timestamp
              gasLimit
              gasUsed
              number
              transactions { 
                cumulativeGasUsed
                from { address }
                to { address }
                gasPrice
                gasUsed
                status
                nonce
                index
                value
                hash
                gas
              }
          }
      }`
  ).then((r) => r.block);
  // Format response
  const baseFeePerGas = ethers.BigNumber.from(blockInfoRaw.baseFeePerGas);
  const miner = ethers.utils.getAddress(blockInfoRaw.miner.address);
  const timestamp = parseInt(blockInfoRaw.timestamp, 16);
  const gasLimit = parseInt(blockInfoRaw.gasLimit, 16);
  const gasUsed = parseInt(blockInfoRaw.gasUsed, 16);
  const transactions = blockInfoRaw.transactions.map((tx, index) => {
    const maxPriorityFee = ethers.BigNumber.from(tx.gasPrice).sub(
      baseFeePerGas
    );
    const txFee = maxPriorityFee.mul(tx.gasUsed);
    return {
      to: ethers.utils.getAddress(
        (tx.to && tx.to.address) || ethers.constants.AddressZero
      ),
      cumulativeGasUsed: parseInt(tx.cumulativeGasUsed, 16),
      transactionIndex: parseInt(tx.transactionIndex, 16),
      from: ethers.utils.getAddress(tx.from.address),
      maxPriorityFee: maxPriorityFee.toHexString(),
      gasUsed: parseInt(tx.gasUsed, 16),
      gasLimit: parseInt(tx.gas, 16),
      nonce: parseInt(tx.nonce, 16),
      txFee: txFee.toHexString(),
      status: tx.status,
      value: tx.value,
      hash: tx.hash,
      index,
    } as TransactionInfo;
  });
  return {
    baseFeePerGas: blockInfoRaw.baseFeePerGas,
    number: _blockNumber,
    transactions,
    timestamp,
    gasLimit,
    gasUsed,
    miner,
  };
};

export const fetchBlockInfoRPC = async (
  _blockNumber
): Promise<BlockInfoWithTxs> => {
  const blockInfoRaw = await provider.send('eth_getBlockByNumber', [
    `0x${_blockNumber.toString(16)}`,
    true,
  ]);
  // Format response
  const baseFeePerGas = ethers.BigNumber.from(blockInfoRaw.baseFeePerGas);
  const miner = ethers.utils.getAddress(blockInfoRaw.miner);
  const timestamp = parseInt(blockInfoRaw.timestamp, 16);
  const gasLimit = parseInt(blockInfoRaw.gasLimit, 16);
  const gasUsed = parseInt(blockInfoRaw.gasUsed, 16);
  const transactions = blockInfoRaw.transactions.map((tx, index) => {
    const maxPriorityFee = ethers.BigNumber.from(tx.gasPrice).sub(
      baseFeePerGas
    );
    return {
      to: ethers.utils.getAddress(tx.to || ethers.constants.AddressZero),
      transactionIndex: parseInt(tx.transactionIndex, 16),
      maxPriorityFee: maxPriorityFee.toHexString(),
      from: ethers.utils.getAddress(tx.from),
      gasLimit: parseInt(tx.gas, 16),
      nonce: parseInt(tx.nonce, 16),
      value: tx.value,
      hash: tx.hash,
      index,
    } as TransactionInfo;
  });
  return {
    baseFeePerGas: blockInfoRaw.baseFeePerGas,
    number: _blockNumber,
    transactions,
    timestamp,
    gasLimit,
    gasUsed,
    miner,
  };
};

export const getBlockInfo = async (_blockNumber) => {
  if (network === 'ropsten') {
    return fetchBlockInfoRPC(_blockNumber);
  }
  return fetchBlockInfoGraphQl(_blockNumber);
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
  const url: any = new URL(AppConfig.etherscanAPIEndpoint);
  url.search = queryString;
  const { status, message, result } = await fetch(url.href).then((r) =>
    r.json()
  );
  if (status !== '1') {
    console.error(`Etherscan request failed: ${message}`);
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
  const response = await safeFetch(
    monitorEndpointEdenRPC,
    {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      method: 'POST',
    },
    ({ success, res }) => {
      if (!success) {
        console.error(`request to eden-monitor api failed: ${res}`);
        return { result: [] };
      }
      return res;
    }
  );
  return response;
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

export const getLastSupportedBlock = async () => {
  return request(
    graphNetworkEndpoint,
    gql`
      {
        blocks(orderDirection: desc, orderBy: number, first: 1) {
          number
        }
      }
    `
  ).then((res) => {
    return parseInt(res.blocks[0].number, 10);
  });
};

export const getStakerInfo = async (_staker, _blockNum?) => {
  const response = await request(
    graphNetworkEndpoint,
    gql`{
          staker(
            id: "${_staker.toLowerCase()}"
            ${_blockNum !== undefined ? `block: { number: ${_blockNum} }` : ''}
          ) {
            staked, 
            rank
          }
      }`
  ).then((r) => r.staker);
  if (response === null) {
    return { rank: null, staked: 0 };
  }
  return response;
};

export const fetchContractInfo = async (_address) => {
  const query = {
    apikey: process.env.ETHERSCAN_API_TOKEN,
    action: 'getsourcecode',
    module: 'contract',
    address: _address,
  };
  const queryString = new URLSearchParams(query);
  const url: any = new URL(AppConfig.etherscanAPIEndpoint);
  url.search = queryString;
  const { status, message, result } = await fetch(url.href).then((r) =>
    r.json()
  );
  if (status !== '1') {
    console.error(`Etherscan request failed: ${message}`);
    return null;
  }
  const [res0] = result;
  if (res0.ABI === 'Contract source code not verified') {
    return null;
  }
  return {
    implementation: res0.Implementation,
    contractName: res0.ContractName,
    isProxy: res0.Proxy === '1',
    abi: JSON.parse(res0.ABI),
  };
};

export const fetchMethodSig = async (_methodSigHex) => {
  const endpoint = 'https://www.4byte.directory/api/v1/signatures/';
  const url = `${endpoint}?hex_signature=${_methodSigHex}`;
  const res = await fetch(url).then((r) => r.json());
  return res;
};

export const getTimestampsForBlocks = async (_minTimestamp, _maxTimestamp) => {
  const [minTimestamp, maxTimestamp] = [_minTimestamp, _maxTimestamp].map((t) =>
    String(t).length > 10 ? Math.floor(t / 1e3) : t
  );

  const result = await request(
    graphNetworkEndpoint,
    gql`{
        minBlock: blocks(
          orderDirection: asc,
          orderBy: timestamp, 
          first: 1,
          where: { 
            timestamp_gte: ${minTimestamp}
          }
        ) {
            number
        }
        maxBlock: blocks(
          orderDirection: desc,
          orderBy: timestamp, 
          first: 1,
          where: { 
            timestamp_lte: ${maxTimestamp}
          }
        ) {
            number
        }
      }`
  );
  const [minBlock, maxBlock] = [
    Number(result.minBlock[0].number),
    Number(result.maxBlock[0].number),
  ];
  const blocksPerHour = Math.floor(
    (maxBlock - minBlock) / ((maxTimestamp - minTimestamp) / 3600)
  );
  const blocksRes = [];
  for (let i = minBlock; i <= maxBlock; i += blocksPerHour) {
    blocksRes.push(i);
  }
  return blocksRes;
};
