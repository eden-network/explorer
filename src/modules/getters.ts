import edenData, { Network } from '@eden-network/data';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';

import { AppConfig } from '../utils/AppConfig';
import { safeFetch } from './utils';

const {
  cacheBlockConfirmations,
  cacheBlockInsightParams,
  graphNetworkEndpoint,
  flashbotsAPIEndpoint,
  providerEndpoint,
  proxyAuthToken,
  minerAlias,
  network,
} = AppConfig;

export const provider = new ethers.providers.JsonRpcProvider(
  providerEndpoint,
  network
);

export const checkIfValidCache = (_cache) => {
  return Object.keys(cacheBlockInsightParams).every((param) => {
    return typeof _cache[param] === cacheBlockInsightParams[param];
  });
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
      if (!resJson || !resJson.blocks || resJson.blocks.length === 0) {
        return [];
      }
      return Object.fromEntries(
        resJson.blocks[0].transactions.map((tx) => [
          tx.transaction_hash,
          tx.bundle_index,
        ])
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
