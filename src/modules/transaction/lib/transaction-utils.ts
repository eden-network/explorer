import { request } from 'graphql-request';

import { AppConfig } from '@utils/AppConfig';

import { ETH_GET_TRANSACTION_BY_HASH } from '../graphql/transaction.query';

const { providerEndpointGraphQl } = AppConfig;

export const formatDecodedTxCalldata = (_decoded) => {
  let msgFull = `
  TextSig: ${_decoded.textSig}
  `;
  if (_decoded.args.length > 0) {
    const argsMsg = _decoded.args
      .map((arg) => {
        return `\t* ${arg.key} [${arg.type}]: ${arg.val}`;
      })
      .join('\n');
    msgFull += `Args:\n${argsMsg}`;
  }
  return msgFull;
};

export const normalizeLogs = (tx) => {
  const { logs } = tx;
  return logs.map((log) => ({
    blockHash: tx.block && tx.block.hash,
    address: log.account && log.account.address,
    logIndex: log.index,
    data: log.data,
    removed: false,
    topics: log.topics,
    blockNumber: tx.block && tx.block.number,
    transactionIndex: tx.index,
    transactionHash: tx.hash,
  }));
};

export const getTxRequestByGraphQL = async (txHash) => {
  const response = await request(
    providerEndpointGraphQl,
    ETH_GET_TRANSACTION_BY_HASH,
    {
      hash: txHash,
    }
  );
  return response.transaction;
};
