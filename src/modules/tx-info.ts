import { ethers } from 'ethers';

import { decodeTx } from './contract-info';
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
  getTxRequestByGraphQL,
} from './getters';
import {
  getChecksumAddress,
  weiToGwei,
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

const normalizeLogs = (rawTx) => {
  const { logs } = rawTx;
  return logs.map((log) => ({
    blockHash: rawTx.block.hash,
    address: log.account.address,
    logIndex: log.index,
    data: log.data,
    removed: false,
    topics: log.topics,
    blockNumber: rawTx.block.number,
    transactionIndex: rawTx.index,
    transactionHash: rawTx.hash,
  }));
};

export const getTransactionInfo = async (txHash) => {
  // Get general transaction info

  const [rawTx, edenRPCInfoRes, etherminePoolInfo] = await Promise.all([
    getTxRequestByGraphQL(txHash),
    getEdenRPCTxs([txHash]),
    getEthermineRPCTx(txHash),
  ]);

  const edenRPCInfo = edenRPCInfoRes.result[0];
  const mined = rawTx.from !== null && rawTx.from.address !== null;
  const viaEdenRPC = edenRPCInfo !== undefined;
  const viaEthermineRPC = etherminePoolInfo.status !== undefined;
  const pendingInEdenMempool = !mined && viaEdenRPC;
  const pendingInEthermineMempool = !mined && viaEthermineRPC;
  const pendingInPublicMempool = !mined && rawTx.from !== null;
  const txState = mined
    ? rawTx.to !== null
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

  transactionInfo.gasUsed = rawTx.gasUsed;
  transactionInfo.blockNumber = rawTx.block && rawTx.block.number;
  transactionInfo.from = rawTx.from && rawTx.from.address;
  transactionInfo.to = rawTx.to && rawTx.to.address;
  transactionInfo.blockTxCount = rawTx.block && rawTx.block.transactionCount;
  transactionInfo.index = rawTx.index;
  transactionInfo.hash = rawTx.hash;
  transactionInfo.timestamp = parseInt(rawTx.block.timestamp, 16);
  transactionInfo.nonce = parseInt(rawTx.nonce, 16);
  transactionInfo.nextBaseFee = nextBaseFee;
  transactionInfo.value = parseInt(rawTx.value, 16);
  transactionInfo.gasLimit = parseInt(rawTx.gas, 16);
  transactionInfo.status = parseInt(rawTx.status, 10);
  transactionInfo.gasPrice = weiToGwei(rawTx.gasPrice);
  transactionInfo.logs = normalizeLogs(rawTx);
  transactionInfo.state =
    rawTx.from && rawTx.to && rawTx.block ? 'mined' : 'pending';
  if (rawTx.block && rawTx.block.baseFeePerGas) {
    transactionInfo.baseFee = weiToGwei(rawTx.block.baseFeePerGas, 4);
    if (rawTx.gasPrice)
      transactionInfo.priorityFee =
        weiToGwei(rawTx.gasPrice, 4) - transactionInfo.baseFee;
  }

  if (transactionInfo.state === 'mined')
    transactionInfo.fromEdenProducer = await isFromEdenProducer(
      rawTx.block.number
    );
  const decodedTx = await decodeTx(rawTx.to.address, rawTx.inputData);
  transactionInfo.contractName = decodedTx.contractName;
  if (decodedTx.parsedCalldata) {
    transactionInfo.input = formatDecodedTxCalldata(decodedTx.parsedCalldata);
  }

  // Pending pools
  if (pendingInEdenMempool) {
    transactionInfo.pendingPools.push('eden');
  }
  if (pendingInEthermineMempool) {
    transactionInfo.pendingPools.push('ethermine');
  }
  if (pendingInPublicMempool) {
    transactionInfo.pendingPools.push('public');
  }
  // Submissions
  if (viaEdenRPC) {
    transactionInfo.submissions.push('eden');
  }
  if (viaEthermineRPC) {
    transactionInfo.submissions.push('ethermine');
  }

  if (pendingInEdenMempool) {
    // use just eden rpc source
    transactionInfo.to = getChecksumAddress(
      edenRPCInfo.to || ethers.constants.AddressZero
    );
    transactionInfo.from = getChecksumAddress(edenRPCInfo.from);
    transactionInfo.gasLimit = parseInt(edenRPCInfo.gas, 16);
    if (edenRPCInfo.maxpriorityfeepergas) {
      transactionInfo.priorityFee = weiToGwei(edenRPCInfo.maxpriorityfeepergas);
      transactionInfo.baseFee =
        weiToGwei(edenRPCInfo.maxfeepergas) - transactionInfo.priorityFee;
    } else {
      transactionInfo.gasPrice = weiToGwei(edenRPCInfo.gasprice);
    }
  } else if (rawTx.from !== null) {
    // use tx-request object
    if (rawTx.gas) {
      transactionInfo.priorityFee = weiToGwei(rawTx.gas);
    }
    if (rawTx.to !== null) {
      const maxAttempts = 10;
      const waitMs = 2000;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const blockNum = parseInt(rawTx.block.number, 10);
          const [
            { staked: senderStake, rank: senderRank },
            bundledTxsRes,
            slotDelegates,
            [blockInfo],
            internalTransfers,
          ] = await Promise.all([
            getStakerInfo(rawTx.from.address.toLowerCase(), blockNum),
            getBundledTxs(blockNum),
            getSlotDelegates(blockNum - 1),
            getBlockInfoForBlocks([blockNum]),
            getInternalTransfers(blockNum),
          ]);
          transactionInfo.senderStake = parseInt(senderStake, 10) / 1e18;
          transactionInfo.senderRank = senderRank;
          transactionInfo.toSlot =
            slotDelegates[rawTx.to.address.toLowerCase()] ?? null;
          if (bundledTxsRes[0] && txHash in bundledTxsRes[1]) {
            const { minerTip, bundleIndex } = bundledTxsRes[1][txHash];
            if (bundleIndex !== undefined) {
              transactionInfo.bundleIndex = bundleIndex ?? null;
              transactionInfo.submissions.push('flashbots');
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
          const erc20Transfers = decodeERC20Transfers(transactionInfo.logs);
          if (erc20Transfers.length > 0) {
            const tknAddresses = erc20Transfers.map((t) => t.address);
            const tknInfos = await getTknInfoForAddresses(tknAddresses);
            const erc20TransfersEnriched = erc20Transfers.map((transfer) => {
              const tknInfo = tknInfos[transfer.address.toLowerCase()];
              const localLabels = Object.fromEntries([
                [rawTx.from.address.toLowerCase(), 'TxSender'],
                [rawTx.to.address.toLowerCase(), 'TxRecipient'],
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
            transactionInfo.erc20Transfers = erc20TransfersEnriched;
          }
          transactionInfo.baseFee = weiToGwei(
            blockInfo.result.baseFeePerGas,
            4
          );
          transactionInfo.gasCost = gweiToETH(
            transactionInfo.gasUsed * transactionInfo.gasPrice
          );
          transactionInfo.priorityFee =
            weiToGwei(rawTx.gasPrice, 4) - transactionInfo.baseFee;
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
  return transactionInfo;
};

export type { TxInfo };
