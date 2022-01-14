/* eslint-disable prettier/prettier */
import { gql } from 'graphql-request';

export const ETH_GET_TRANSACTION_BY_HASH = gql`
  query ($hash: Bytes32!) {
    transaction(hash: $hash) {
      hash
      nonce
      index
      from {
        address
      }
      to {
        address
      }
      value
      gasPrice
      gas
      inputData
      block {
        number
        hash
        baseFeePerGas
        transactionCount
        timestamp
      }
      status
      gasUsed
      maxPriorityFeePerGas
      logs {
        index
        account {
          address
        }
        topics
        data
      }
    }
  }
`;
