import edenData, { Network } from '@eden-network/data';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';

import { AppConfig } from '../utils/AppConfig';
import { formatAddress } from './formatter';
import {
  safeFetch,
  sendRawJsonRPCRequest,
  weiToGwei,
  safeParseResponse,
} from './utils';

const {
  monitorEndpointEthermineRPC,
  cacheBlockConfirmations,
  providerEndpointGraphQl,
  monitorEndpointEdenRPC,
  graphNetworkEndpoint,
  flashbotsAPIEndpoint,
  tokensAPI,
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

export const getPendingBlock = () => {
  return sendRawJsonRPCRequest(
    'eth_getBlockByNumber',
    ['pending', false],
    providerEndpoint
  );
};

export const getNextBaseFee = async () => {
  return getPendingBlock().then((block) => weiToGwei(block.baseFeePerGas, 4));
};

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

export const getInternalTransfers = async (blockNum, from?, to?) => {
  // Only available on mainnet
  if (network !== 'mainnet') {
    return [];
  }
  try {
    const blockNumHex = `0x${blockNum.toString(16)}`;
    const args = {
      category: ['internal'],
      fromBlock: blockNumHex,
      toBlock: blockNumHex,
    } as any;
    if (from) {
      args.fromAddress = from;
    }
    if (to) {
      args.toAddress = to;
    }
    const res = await sendRawJsonRPCRequest(
      'alchemy_getAssetTransfers',
      [args],
      providerEndpoint
    );
    return res.transfers;
  } catch (err) {
    console.error(`Error while fetching miner tip ${err}`);
    return [];
  }
};

export const getMinerTips = async (blockNum, miner) => {
  const internalTransfers = await getInternalTransfers(blockNum, null, miner);
  const minerTipToTx = {};
  internalTransfers.forEach((t) => {
    const currentVal = minerTipToTx[t.hash];
    minerTipToTx[t.hash] = currentVal ? currentVal + t.value : t.value;
  });
  return minerTipToTx;
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

export const getSlotGasCap = () => slotGasCap;

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
  miners,
  start,
  num,
}) => {
  return request(
    graphNetworkEndpoint,
    gql`{
        blocks(
          where: {
            ${
              fromActiveProducerOnly
                ? `fromActiveProducer: ${fromActiveProducerOnly},`
                : ``
            }
            ${
              miners
                ? `author_in: [${miners
                    .map((m) => `"${m.toLowerCase()}"`)
                    .join(', ')}],`
                : ``
            }
            ${beforeTimestamp ? `timestamp_lte: ${beforeTimestamp},` : ''}
          }
          orderDirection: desc
          orderBy: number, 
          skip: ${start}, 
          first: ${num}, 
        ) {
          fromActiveProducer,
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
  const gasLimit = parseInt(blockInfoRaw.gasLimit, 10);
  const gasUsed = parseInt(blockInfoRaw.gasUsed, 10);
  const transactions = blockInfoRaw.transactions.map((tx, index) => {
    const maxPriorityFee = ethers.BigNumber.from(tx.gasPrice).sub(
      baseFeePerGas
    );
    const txFee = maxPriorityFee.mul(tx.gasUsed);

    return {
      to: ethers.utils.getAddress(
        (tx.to && tx.to.address) || ethers.constants.AddressZero
      ),
      transactionIndex: parseInt(tx.transactionIndex, 16),
      from: ethers.utils.getAddress(tx.from.address),
      maxPriorityFee: maxPriorityFee.toHexString(),
      cumulativeGasUsed: tx.cumulativeGasUsed,
      gasLimit: parseInt(tx.gas, 16),
      nonce: parseInt(tx.nonce, 16),
      txFee: txFee.toHexString(),
      gasUsed: tx.gasUsed,
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
  if (providerEndpointGraphQl && network === 'mainnet') {
    return fetchBlockInfoGraphQl(_blockNumber);
  }
  return fetchBlockInfoRPC(_blockNumber);
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

export const getEdenRPCTx = async (_tx) => {
  const query = {
    method: 'eth_getTransactionByHash',
    params: [_tx],
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
        return { result: null };
      }
      return res;
    }
  );
  return response;
};

export const getEthermineRPCTx = async (_tx) => {
  const url = monitorEndpointEthermineRPC + _tx;
  const response = await safeFetch(url, {}, ({ success, res }) => {
    if (!success) {
      console.error(`request to ethermine-monitor api failed: ${res}`);
      return {};
    }
    return res;
  });
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

export const getTknInfoFromAPI = async () => {
  try {
    const dataRaw = await fetch(tokensAPI).then(safeParseResponse);
    return Object.fromEntries(
      dataRaw.tokens.map((tknInfo) => [
        tknInfo.address,
        {
          decimals: tknInfo.decimals,
          logoURL: tknInfo.logoURI,
          symbol: tknInfo.symbol,
        },
      ])
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTknInfoFromChain = async (_tokenAddress) => {
  const callDecimals = {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
      {
        to: _tokenAddress,
        data: '0x313ce567', // ERC20.decimals()
      },
    ],
    id: 1,
  };
  const callSymbol = {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
      {
        to: _tokenAddress,
        data: '0x95d89b41', // ERC20.name()
      },
    ],
    id: 1,
  };
  const [decRaw, symbolRaw] = await fetch(providerEndpoint, {
    method: 'POST',
    body: JSON.stringify([callDecimals, callSymbol]),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
  const decimals = parseInt(decRaw.result.slice(0, 66), 16);
  const symbol = ethers.utils.defaultAbiCoder.decode(
    ['string'],
    symbolRaw.result.slice(0, 66)
  )[0];
  return { decimals, symbol, logoURL: null };
};

export const getTknInfoForAddresses = async (_addresses) => {
  const getDefualtTknInfo = (_address) => ({
    symbol: formatAddress(_address),
    decimals: 18,
    logoURL: null,
  });
  // Fetch token data
  const tknData = await getTknInfoFromAPI();
  const tknInfo = await Promise.all(
    _addresses.map(async (tknAdd) => {
      // Fetch token info from API
      const tknInfoAPI = tknData && tknData[ethers.utils.getAddress(tknAdd)];
      if (tknInfoAPI) {
        return [tknAdd, tknInfoAPI];
      }
      // Fetch token info from blockchain
      try {
        return [tknAdd, await getTknInfoFromChain(tknAdd)];
      } catch (_) {
        return [tknAdd, getDefualtTknInfo(tknAdd)];
      }
    })
  ).then((r: any[]) => Object.fromEntries(r));
  return tknInfo;
};
