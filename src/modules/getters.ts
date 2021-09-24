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
  proxyAuthToken,
  network,
} = AppConfig;

export const provider = new ethers.providers.JsonRpcProvider(
  providerEndpoint,
  network
);

export const isBlockSecure = async (_blockNumber) => {
  const blockHeight = await provider.getBlockNumber();
  return blockHeight >= _blockNumber + parseInt(cacheBlockConfirmations, 10);
};

export const isEdenBlock = async (_blockNumber) => {
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
  const blockInfo = await provider.getBlockWithTransactions(_blockNumber);
  const transactions = (blockInfo.transactions as any[]).map((tx) => {
    return {
      maxPriorityFee: tx.gasPrice.sub(blockInfo.baseFeePerGas),
      to: tx.to || ethers.constants.AddressZero, // Account for contract creation
      transactionIndex: tx.transactionIndex,
      gasPrice: tx.gasPrice,
      nonce: tx.nonce,
      hash: tx.hash,
      from: tx.from,
    };
  });
  return {
    baseFee: blockInfo.baseFeePerGas,
    timestamp: blockInfo.timestamp,
    gasLimit: blockInfo.gasLimit,
    miner: blockInfo.miner,
    transactions,
  };
};
