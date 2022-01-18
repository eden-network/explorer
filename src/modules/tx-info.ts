import { ethers } from 'ethers';

import { decodeTx } from './contract-info';
import {
  getTknInfoForAddresses,
  getBlockInfoForBlocks,
  getLastSupportedBlock,
  getInternalTransfers,
  isFromEdenProducer,
  getEthermineRPCTx,
  getSlotDelegates,
  getNextBaseFee,
  getStakerInfo,
  getEdenRPCTxs,
  getBundledTxs,
  getTxRequest,
  getTxReceipt,
} from './getters';
import {
  getChecksumAddress,
  weiToGwei,
  weiToETH,
  gweiToETH,
  decodeERC20Transfers,
  sleep,
} from './utils';

interface TxInfo {
  pendingPools: string[];
  submissions: string[];
  state: 'mined' | 'pending' | 'indexing';
  gasPrice: number;
  gasLimit: number;
  nonce: number;
  value: number;
  input: string;
  from: string;
  hash: string;
  to: string;
  nextBaseFee: number | null;
  erc20Transfers: Array<Object> | null;
  contractName: string | null;
  bundleIndex: number | null;
  fromEdenProducer: boolean | null;
  blockTxCount: number | null;
  senderStake: number | null;
  gasCost: number | null;
  logs: Array<Object> | null;
  blockNumber: number | null;
  priorityFee: number | null;
  senderRank: number | null;
  timestamp: number | null;
  minerTip: number | null;
  toSlot: number | null;
  gasUsed: number | null;
  baseFee: number | null;
  status: number | null;
  index: number | null;
}

// TODO: move to frontend
const formatDecodedTxCalldata = (_decoded) => {
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

export const getTransactionInfo = async (txHash) => {
  // Get general transaction info
  const [txRequest, txReceipt, edenRPCInfoRes, etherminePoolInfo] =
    await Promise.all([
      getTxRequest(txHash),
      getTxReceipt(txHash),
      getEdenRPCTxs([txHash]),
      getEthermineRPCTx(txHash),
    ]);
  const edenRPCInfo = edenRPCInfoRes.result[0];
  const mined = txRequest !== null && txRequest.blockNumber !== null;
  const viaEdenRPC = edenRPCInfo !== undefined;
  const viaEthermineRPC = etherminePoolInfo.status !== undefined;
  const viaAggregator = edenRPCInfo !== undefined && edenRPCInfo.agg;
  const pendingInEdenMempool = !mined && viaEdenRPC;
  const pendingInEthermineMempool = !mined && viaEthermineRPC;
  const pendingInPublicMempool = !mined && txRequest !== null;
  const txState = mined
    ? txReceipt !== null
      ? 'mined'
      : 'indexing'
    : 'pending';
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
  const transactionInfo = {
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
  } as TxInfo;

  // Pending pools
  if (viaAggregator) {
    transactionInfo.pendingPools.push('flashbots');
  }
  if (pendingInEdenMempool || viaAggregator) {
    transactionInfo.pendingPools.push('eden');
  }
  if (pendingInEthermineMempool || viaAggregator) {
    transactionInfo.pendingPools.push('ethermine');
  }
  if (pendingInPublicMempool) {
    transactionInfo.pendingPools.push('public');
  }
  // Submissions
  if (viaAggregator) {
    transactionInfo.submissions.push('agg');
  } else {
    if (viaEdenRPC) {
      transactionInfo.submissions.push('eden');
    }
    if (viaEthermineRPC) {
      transactionInfo.submissions.push('ethermine');
    }
  }

  if (pendingInEdenMempool) {
    // use just eden rpc source
    transactionInfo.to = getChecksumAddress(
      edenRPCInfo.to || ethers.constants.AddressZero
    );
    transactionInfo.from = getChecksumAddress(edenRPCInfo.from);
    transactionInfo.gasLimit = parseInt(edenRPCInfo.gas, 16);
    transactionInfo.nonce = parseInt(edenRPCInfo.nonce, 10);
    transactionInfo.value = weiToETH(edenRPCInfo.value);
    transactionInfo.input = edenRPCInfo.input;
    transactionInfo.hash = edenRPCInfo.hash;
    if (edenRPCInfo.maxpriorityfeepergas) {
      transactionInfo.priorityFee = weiToGwei(edenRPCInfo.maxpriorityfeepergas);
      transactionInfo.baseFee =
        weiToGwei(edenRPCInfo.maxfeepergas) - transactionInfo.priorityFee;
    } else {
      transactionInfo.gasPrice = weiToGwei(edenRPCInfo.gasprice);
    }
  } else if (txRequest !== null) {
    // use tx-request object
    transactionInfo.to = getChecksumAddress(
      txRequest.to || ethers.constants.AddressZero
    );
    transactionInfo.index = parseInt(txRequest.transactionIndex, 16);
    transactionInfo.gasPrice = weiToGwei(txRequest.gasPrice);
    transactionInfo.from = getChecksumAddress(txRequest.from);
    transactionInfo.gasLimit = parseInt(txRequest.gas, 16);
    transactionInfo.nonce = parseInt(txRequest.nonce, 16);
    transactionInfo.value = weiToETH(txRequest.value);
    transactionInfo.input = txRequest.input;
    transactionInfo.hash = txRequest.hash;
    if (txRequest.maxPriorityFeePerGas) {
      transactionInfo.priorityFee = weiToGwei(txRequest.maxPriorityFeePerGas);
      if (transactionInfo.priorityFee !== transactionInfo.gasPrice) {
        transactionInfo.baseFee =
          weiToGwei(txRequest.gasPrice) - transactionInfo.priorityFee;
      }
    }
    if (txReceipt !== null) {
      const maxAttempts = 10;
      const waitMs = 3000;
      for (let i = 0; i < maxAttempts; i++) {
        const blockNum = parseInt(txRequest.blockNumber, 16);
        // Check if tx block is gte to latest block indexed by the graph
        const latestGraphBlock = await getLastSupportedBlock();
        if (latestGraphBlock < blockNum) {
          console.log(`Waiting for block ${blockNum} to be indexed`);
          await sleep(waitMs);
          continue; // eslint-disable-line no-continue
        }
        const [
          { staked: senderStake, rank: senderRank },
          fromEdenProducer,
          bundledTxsRes,
          slotDelegates,
          [blockInfo],
          decodedTx,
          internalTransfers,
        ] = await Promise.all([
          getStakerInfo(txRequest.from.toLowerCase(), blockNum),
          isFromEdenProducer(blockNum),
          getBundledTxs(blockNum),
          getSlotDelegates(blockNum - 1),
          getBlockInfoForBlocks([blockNum]),
          decodeTx(txRequest.to, txRequest.input),
          getInternalTransfers(blockNum),
        ]);
        if (decodedTx.parsedCalldata) {
          transactionInfo.input = formatDecodedTxCalldata(
            decodedTx.parsedCalldata
          );
        }
        transactionInfo.blockNumber = parseInt(txRequest.blockNumber, 16);
        transactionInfo.contractName = decodedTx.contractName;
        transactionInfo.fromEdenProducer = fromEdenProducer;
        transactionInfo.senderStake = parseInt(senderStake, 10) / 1e18;
        transactionInfo.senderRank = senderRank;
        transactionInfo.toSlot =
          slotDelegates[txRequest.to.toLowerCase()] ?? null;
        if (bundledTxsRes[0] && txHash in bundledTxsRes[1]) {
          const { minerTip, bundleIndex } = bundledTxsRes[1][txHash];
          if (bundleIndex !== undefined) {
            transactionInfo.bundleIndex = bundleIndex ?? null;
            if (!viaAggregator) {
              transactionInfo.submissions.push('flashbots');
            }
          }
          if (minerTip !== undefined) {
            transactionInfo.minerTip = minerTip / 1e18;
          }
        }
        if (!transactionInfo.minerTip) {
          let minerTipInternalTxsETH = 0;
          internalTransfers.forEach((transfer) => {
            if (
              transfer.hash === txHash &&
              transfer.to === blockInfo.result.miner
            ) {
              minerTipInternalTxsETH += transfer.value;
            }
          });
          transactionInfo.minerTip = minerTipInternalTxsETH;
        }
        const erc20Transfers = decodeERC20Transfers(txReceipt.logs);
        if (erc20Transfers.length > 0) {
          const tknAddresses = erc20Transfers.map((t) => t.address);
          const tknInfos = await getTknInfoForAddresses(tknAddresses);
          const erc20TransfersEnriched = erc20Transfers.map((transfer) => {
            const tknInfo = tknInfos[transfer.address.toLowerCase()];
            const localLabels = Object.fromEntries([
              [txRequest.from.toLowerCase(), 'TxSender'],
              [txRequest.to.toLowerCase(), 'TxRecipient'],
            ]);
            return {
              value:
                transfer.args.value === '0x'
                  ? 0
                  : ethers.utils.formatUnits(
                      ethers.BigNumber.from(transfer.args.value),
                      tknInfo.decimals
                    ),
              fromLabel: localLabels[transfer.args.from.toLowerCase()] || null,
              toLabel: localLabels[transfer.args.to.toLowerCase()] || null,
              tknAddress: transfer.address,
              tknSymbol: tknInfo.symbol,
              tknLogoUrl: tknInfo.logoURL,
              from: transfer.args.from,
              to: transfer.args.to,
            };
          });
          transactionInfo.erc20Transfers = erc20TransfersEnriched;
        }
        transactionInfo.timestamp = parseInt(blockInfo.result.timestamp, 16);
        transactionInfo.blockTxCount = blockInfo.result.transactions.length;
        transactionInfo.baseFee = weiToGwei(blockInfo.result.baseFeePerGas, 4);
        transactionInfo.gasUsed = parseInt(txReceipt.gasUsed, 16);
        transactionInfo.status = parseInt(txReceipt.status, 16);
        transactionInfo.logs = txReceipt.logs;
        transactionInfo.gasCost = gweiToETH(
          transactionInfo.gasUsed * transactionInfo.gasPrice
        );
        transactionInfo.priorityFee =
          weiToGwei(txReceipt.effectiveGasPrice, 4) - transactionInfo.baseFee;
        return transactionInfo;
      }
      console.error(`Max limit reached to get data from graph-ql ${txHash}`);
      return null;
    }
  }
  return transactionInfo;
};

export type { TxInfo };
