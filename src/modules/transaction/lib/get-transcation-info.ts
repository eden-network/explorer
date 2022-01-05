import { ethers } from 'ethers';

import { decodeTx } from '@modules/contract-info';
import {
  getTknInfoForAddresses,
  getBlockInfoForBlocks,
  getInternalTransfers,
  isFromEdenProducer,
  getEthermineRPCTx,
  getSlotDelegates,
  getNextBaseFee,
  getStakerInfo,
  getEdenRPCTxs,
  getBundledTxs,
} from '@modules/getters';
import {
  getChecksumAddress,
  weiToGwei,
  gweiToETH,
  decodeERC20Transfers,
  sleep,
  weiToETH,
} from '@modules/utils';

import { TxInfoType } from '../typings/transaction-info.type';
import {
  getTxRequestByGraphQL,
  normalizeLogs,
  formatDecodedTxCalldata,
} from './transaction-utils';

// TODO: move to frontend

export const getTransactionInfo = async (txHash) => {
  // Get general transaction info
  const [tx, edenRPCInfoRes, etherminePoolInfo] = await Promise.all([
    getTxRequestByGraphQL(txHash),
    getEdenRPCTxs([txHash]),
    getEthermineRPCTx(txHash),
  ]);

  const edenRPCInfo = edenRPCInfoRes.result[0];
  const mined = tx && tx.block;
  const viaEdenRPC = edenRPCInfo !== undefined;
  const viaEthermineRPC = etherminePoolInfo.status !== undefined;
  const pendingInEdenMempool = !mined && viaEdenRPC;
  const pendingInEthermineMempool = !mined && viaEthermineRPC;
  const viaAggregator = edenRPCInfo !== undefined && edenRPCInfo.agg;
  const pendingInPublicMempool = !mined && tx !== null;
  const txState = mined ? (tx.to !== null ? 'mined' : 'indexing') : 'pending';
  if (
    !(
      pendingInPublicMempool ||
      pendingInEthermineMempool ||
      pendingInEdenMempool ||
      mined
    )
  ) {
    console.error(`Can't find any info for transaction ${txHash}`);
    return null;
  }
  const nextBaseFee = !mined ? await getNextBaseFee() : null;

  // Get tx info
  const txInfo = {
    hash: txHash,
    fromEdenProducer: null,
    contractName: null,
    blockTxCount: null,
    senderStake: null,
    blockNumber: null,
    priorityFee: null,
    timestamp: null,
    bundleIndex: null,
    pendingPools: [],
    submissions: [],
    state: txState,
    gasUsed: null,
    gasCost: null,
    baseFee: null,
    toSlot: null,
    status: null,
    minerTip: 0,
    index: null,
    logs: null,
    nextBaseFee,
  } as TxInfoType;

  // Pending pools
  if (viaAggregator) {
    txInfo.pendingPools.push('flashbots');
  }
  if (pendingInEdenMempool) {
    txInfo.pendingPools.push('eden');
  }
  if (pendingInEthermineMempool) {
    txInfo.pendingPools.push('ethermine');
  }
  if (pendingInPublicMempool) {
    txInfo.pendingPools.push('public');
  }
  // Submissions
  if (viaAggregator) {
    txInfo.submissions.push('agg');
  } else {
    if (viaEdenRPC) {
      txInfo.submissions.push('eden');
    }
    if (viaEthermineRPC) {
      txInfo.submissions.push('ethermine');
    }
  }

  console.log({ tx });

  if (pendingInEdenMempool) {
    // use just eden rpc source
    txInfo.to = getChecksumAddress(
      edenRPCInfo.to || ethers.constants.AddressZero
    );
    txInfo.from = getChecksumAddress(edenRPCInfo.from);
    txInfo.gasLimit = parseInt(edenRPCInfo.gas, 16);
    txInfo.nonce = parseInt(edenRPCInfo.nonce, 10);
    txInfo.value = weiToETH(edenRPCInfo.value);
    txInfo.input = edenRPCInfo.input;
    txInfo.hash = edenRPCInfo.hash;
    if (edenRPCInfo.maxpriorityfeepergas) {
      txInfo.priorityFee = weiToGwei(edenRPCInfo.maxpriorityfeepergas);
      txInfo.baseFee = weiToGwei(edenRPCInfo.maxfeepergas) - txInfo.priorityFee;
    } else {
      txInfo.gasPrice = weiToGwei(edenRPCInfo.gasprice);
    }
  } else if (tx && tx.from !== null) {
    txInfo.to = getChecksumAddress(
      (tx.to && tx.to.address) || ethers.constants.AddressZero
    );
    txInfo.index = tx.index;
    txInfo.gasPrice = weiToGwei(parseInt(tx.gasPrice, 16));
    txInfo.from = getChecksumAddress(tx.from.address);
    txInfo.gasLimit = parseInt(tx.gas, 16);
    txInfo.nonce = parseInt(tx.nonce, 16);
    txInfo.value = weiToETH(parseInt(tx.value, 16));
    txInfo.input = tx.inputData;

    // if (tx.block.baseFeePerGas !== null) {
    //   txInfo.baseFee = weiToGwei(tx.block.baseFeePerGas, 4);
    //   if (tx.gasPrice)
    //     txInfo.priorityFee = weiToGwei(tx.gasPrice, 4) - txInfo.baseFee;
    // }

    if (tx.block !== null) {
      const maxAttempts = 10;
      const waitMs = 2000;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const blockNum = parseInt(tx.block.number, 10);
          const [
            { staked: senderStake, rank: senderRank },
            fromEdenProducer,
            bundledTxsRes,
            slotDelegates,
            [blockInfo],
            internalTransfers,
          ] = await Promise.all([
            getStakerInfo(tx.from.address.toLowerCase(), blockNum),
            isFromEdenProducer(blockNum),
            getBundledTxs(blockNum),
            getSlotDelegates(blockNum - 1),
            getBlockInfoForBlocks([blockNum]),
            getInternalTransfers(blockNum),
          ]);

          const decodedTx = await decodeTx(tx.to.address, tx.inputData);
          txInfo.contractName = decodedTx.contractName;
          if (decodedTx.parsedCalldata) {
            txInfo.input = formatDecodedTxCalldata(decodedTx.parsedCalldata);
          }
          txInfo.blockNumber = blockNum;
          txInfo.fromEdenProducer = fromEdenProducer;
          txInfo.senderStake = parseInt(senderStake, 10) / 1e18;
          txInfo.senderRank = senderRank;
          txInfo.toSlot = slotDelegates[tx.to.address.toLowerCase()] ?? null;
          if (bundledTxsRes[0] && txHash in bundledTxsRes[1]) {
            const { minerTip, bundleIndex } = bundledTxsRes[1][txHash];
            if (bundleIndex !== undefined) {
              txInfo.bundleIndex = bundleIndex ?? null;
              txInfo.submissions.push('flashbots');
            }
            if (minerTip !== undefined) {
              txInfo.minerTip = minerTip / 1e18;
            }
          }
          if (!txInfo.minerTip) {
            let minerTipInternalTxsETH = 0;
            internalTransfers.forEach((transfer) => {
              if (
                transfer.hash === txHash &&
                transfer.to === blockInfo.result.miner
              ) {
                minerTipInternalTxsETH += transfer.value;
              }
            });
            txInfo.minerTip = minerTipInternalTxsETH;
          }
          txInfo.logs = normalizeLogs(tx);
          const erc20Transfers = decodeERC20Transfers(txInfo.logs);
          if (erc20Transfers.length > 0) {
            const tknAddresses = erc20Transfers.map((t) => t.address);
            const tknInfos = await getTknInfoForAddresses(tknAddresses);
            const erc20TransfersEnriched = erc20Transfers.map((transfer) => {
              const tknInfo = tknInfos[transfer.address.toLowerCase()];
              const localLabels = Object.fromEntries([
                [tx.from.address.toLowerCase(), 'TxSender'],
                [tx.to.address.toLowerCase(), 'TxRecipient'],
              ]);
              return {
                value:
                  transfer.args.value === '0x'
                    ? 0
                    : ethers.utils.formatUnits(
                        ethers.BigNumber.from(transfer.args.value),
                        tknInfo.decimals
                      ),
                fromLabel:
                  localLabels[transfer.args.from.toLowerCase()] || null,
                toLabel: localLabels[transfer.args.to.toLowerCase()] || null,
                tknAddress: transfer.address,
                tknSymbol: tknInfo.symbol,
                tknLogoUrl: tknInfo.logoURL,
                from: transfer.args.from,
                to: transfer.args.to,
              };
            });
            txInfo.erc20Transfers = erc20TransfersEnriched;
          }
          txInfo.timestamp = parseInt(blockInfo.result.timestamp, 16);
          txInfo.blockTxCount = blockInfo.result.transactions.length;
          txInfo.baseFee = weiToGwei(blockInfo.result.baseFeePerGas, 4);
          txInfo.gasUsed = tx.gasUsed;
          txInfo.status = parseInt(tx.status, 10);
          txInfo.gasCost = gweiToETH(txInfo.gasUsed * txInfo.gasPrice);
          txInfo.priorityFee = weiToGwei(tx.gasPrice, 4) - txInfo.baseFee;
          break;
        } catch (err) {
          console.error(`Error getting tx info for ${txHash}`, err);
          if (maxAttempts - 1 === i) {
            throw new Error(
              `Max attempts reached to fetch tx-info for ${txHash}`
            );
          }
          await sleep(waitMs);
        } // eslint-disable-line no-empty
      }
    }
  }
  return txInfo;
};
