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
      block {
        hash
        number
        transactionCount
        timestamp
      }
      value
      gasPrice
      gas
      gasUsed
      status
      inputData
      cumulativeGasUsed
      createdContract {
        address
      }
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
