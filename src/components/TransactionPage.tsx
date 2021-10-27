import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment';

import {
  clockSVG,
  crossSVG,
  tickSVG,
  EdenLogo,
  EthLogo,
} from '../modules/icons';
import { TxInfo } from '../modules/tx-info';

TimeAgo.addDefaultLocale(en);

const makeInputBox = (_input) => (
  <span className="p-3 rounded-3xl py-2 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
    <p className="break-all">{_input}</p>
  </span>
);

const submissionBoxes = {
  flashbots: (
    <span className="p-3 rounded-3xl py-2 bg-purple inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Flashbots Relay
    </span>
  ),
  eden: (
    <span className="p-3 rounded-3xl py-2 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Eden Relay
    </span>
  ),
  unknown: (
    <span className="p-3 rounded-3xl py-2 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Unknown
    </span>
  ),
};

const statusBoxes = {
  success: (
    <span className="p-3 rounded-3xl py-2 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {tickSVG} SUCCESS
    </span>
  ),
  fail: (
    <span className="p-3 rounded-3xl py-2 bg-red inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {crossSVG} FAIL
    </span>
  ),
  'pending-mempool': (
    <span className="p-3 rounded-3xl py-2 bg-yellow inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {clockSVG} PENDING IN PUBLIC MEMPOOL
    </span>
  ),
  'pending-eden': (
    <span className="p-3 rounded-3xl py-2 bg-purple inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {clockSVG} PENDING IN EDEN MEMPOOL
    </span>
  ),
};

export default function TransactionPage({ txInfo }: { txInfo: TxInfo }) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full">
              <tbody className="divide-y divide-blue-light">
                <tr key="Transaction Hash">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Transaction Hash:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://etherscan.io/tx/${txInfo.hash}`}
                      className="hover:text-green"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txInfo.hash}
                    </a>
                  </td>
                </tr>
                <tr key="From">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Sender:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/address/${txInfo.from}`}
                      className="hover:text-green"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txInfo.from}
                      <span className="text-green">
                        {' '}
                        - STAKED{' '}
                        {Math.round(
                          txInfo.senderStake
                        ).toLocaleString()} EDEN{' '}
                        {txInfo.senderRank ? ` (#${txInfo.senderRank})` : ''}
                      </span>
                    </a>
                  </td>
                </tr>
                <tr key="To">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Recipient:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/address/${txInfo.to}`}
                      className="hover:text-green"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txInfo.to}{' '}
                      {txInfo.toSlot !== null
                        ? ` - SLOT #${txInfo.toSlot}`
                        : ''}
                    </a>
                  </td>
                </tr>
                {txInfo.blockNumber ? (
                  <tr key="Block Number">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Block Number:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap inline-flex">
                      <a
                        href={`/block/${txInfo.blockNumber}?tx=${txInfo.hash}`}
                        className="hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {txInfo.blockNumber}
                        <span className="px-1">
                          {txInfo.fromEdenProducer ? EdenLogo : EthLogo}
                        </span>
                      </a>
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.blockNumber ? (
                  <tr key="Timestamp">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Timestamp:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap inline-flex">
                      {moment(txInfo.timestamp * 1e3).format('D MMM YYYY H:mm')}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                <tr key="Submission">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Submission:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.viaEdenRPC
                      ? submissionBoxes.eden
                      : txInfo.inBundle
                      ? submissionBoxes.flashbots
                      : submissionBoxes.unknown}
                  </td>
                </tr>
                <tr key="Status">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Status:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.pending
                      ? txInfo.viaEdenRPC
                        ? statusBoxes['pending-eden']
                        : statusBoxes['pending-mempool']
                      : txInfo.status === 1
                      ? statusBoxes.success
                      : statusBoxes.fail}
                  </td>
                </tr>
                <tr key="In Bundle">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    In Bundle:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.inBundle ? 'True' : 'False'}
                  </td>
                </tr>
                <tr key="Transaction index">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Transaction Index:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.index.toLocaleString()} of{' '}
                    {txInfo.blockTxCount.toLocaleString()} (
                    {Math.round((100 * txInfo.index) / txInfo.blockTxCount)}%)
                  </td>
                </tr>
                <tr key="Nonce">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Nonce:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.nonce.toLocaleString()}
                  </td>
                </tr>
                {txInfo.priorityFee !== null ? (
                  <tr key="Priority fee">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Priority Fee:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.priorityFee} Gwei
                    </td>
                  </tr>
                ) : (
                  <tr key="Gas Price">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Gas Price:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.gasPrice.toLocaleString()} Gwei
                    </td>
                  </tr>
                )}
                {txInfo.baseFee !== null ? (
                  <tr key="Base fee">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Base Fee:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.baseFee} Gwei
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                <tr key="Gas used">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Gas used:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.gasUsed.toLocaleString()} of{' '}
                    {txInfo.gasLimit.toLocaleString()} (
                    {Math.round((100 * txInfo.gasUsed) / txInfo.gasLimit)}%)
                  </td>
                </tr>
                {txInfo.value > 0 ? (
                  <tr key="Value">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Value:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.value.toLocaleString()} ETH
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.input.length > 2 ? (
                  <tr key="Input">
                    <td className="px-2 sm:px-6 py-4 break-words">Input:</td>
                    <td className="px-2 sm:px-6 py-4 ">
                      {makeInputBox(txInfo.input)}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
