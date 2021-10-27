import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import ReactToolTip from 'react-tooltip';

import { formatAddress, formatTxHash } from '../modules/formatter';
import { EthLogo, EdenLogo, LockClosed, LockOpen } from '../modules/icons';
import ClipboardButton from './ClipboardButton';
import NoSSr from './NoSsr';

export default function AccountTxTable({
  transactions,
  accountAddress,
  accountLabel,
}) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg text-center">
            <table className="min-w-full">
              <thead className="bg-blue-light">
                <tr>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hash
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-0 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span data-tip data-for="thBlockType">
                      <FontAwesomeIcon icon="question-circle" /> Block-Type
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Block
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:pl-2 sm:pr-12 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-0 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span data-tip data-for="thTxsAbove">
                      <FontAwesomeIcon icon="question-circle" /> % Txs Above
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-0 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority Fee
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px- py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span data-tip data-for="thViaEdenRPC">
                      <FontAwesomeIcon icon="question-circle" /> Via Eden RPC
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light border-b border-blue-light">
                {transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      <span className="flex items-center justify-center">
                        <ClipboardButton
                          className="pr-2 block"
                          copyText={tx.hash}
                        />
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          className=" hover:text-green block"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatTxHash(tx.hash)}
                        </a>
                      </span>
                    </td>
                    <td
                      className={`px-2 sm:px-1 pt-1 whitespace-nowrap capitalize ${
                        tx.isEden ? 'text-green' : 'text-white'
                      }`}
                    >
                      <span
                        data-tip
                        data-for={tx.isEden ? 'EdenLogoTip' : 'EthLogoTip'}
                      >
                        {tx.isEden ? EdenLogo : EthLogo}
                      </span>
                    </td>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      <span className="flex items-center justify-center">
                        <ClipboardButton
                          className="pr-2 block"
                          copyText={tx.block}
                        />
                        <a
                          href={`/block/${tx.block}?tx=${tx.hash}`}
                          className=" hover:text-green block"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {tx.block}
                        </a>
                      </span>
                    </td>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      {moment(tx.timestamp * 1e3).format('D MMM YYYY H:mm')}
                    </td>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      <span
                        className={`flex items-center justify-center ${
                          accountAddress.toLowerCase() === tx.from.toLowerCase()
                            ? 'text-gray-300'
                            : ''
                        }`}
                      >
                        {accountAddress.toLowerCase() !==
                        tx.from.toLowerCase() ? (
                          <ClipboardButton
                            className="pr-2"
                            copyText={tx.from}
                          />
                        ) : (
                          ''
                        )}
                        {accountAddress.toLowerCase() !==
                        tx.from.toLowerCase() ? (
                          <a
                            href={`/address/${tx.from}`}
                            className=" hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {formatAddress(tx.from)}
                          </a>
                        ) : (
                          accountLabel || formatAddress(tx.from)
                        )}
                      </span>
                    </td>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      <span
                        className={`flex items-center justify-center ${
                          accountAddress.toLowerCase() === tx.to.toLowerCase()
                            ? 'text-gray-300'
                            : ''
                        }`}
                      >
                        {accountAddress.toLowerCase() !==
                        tx.to.toLowerCase() ? (
                          <ClipboardButton className="pr-2" copyText={tx.to} />
                        ) : (
                          ''
                        )}
                        {accountAddress.toLowerCase() !==
                        tx.to.toLowerCase() ? (
                          <a
                            href={`/address/${tx.to}`}
                            className=" hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {formatAddress(tx.to)}
                          </a>
                        ) : (
                          accountLabel || formatAddress(tx.to)
                        )}
                      </span>
                    </td>
                    <td
                      className={`px-2 sm:px-1 py-4 whitespace-nowrap capitalize ${
                        tx.status === 'fail' ? 'text-red' : 'text-green'
                      }`}
                    >
                      {tx.status}
                    </td>
                    <td className="px-2 sm:px-0 py-4 whitespace-nowrap">
                      {Math.round((tx.index / tx.blockTxCount) * 100)} %
                    </td>
                    <td className="px-2 sm:px-0 py-4 whitespace-nowrap">
                      {tx.priorityFee} Gwei
                    </td>
                    <td
                      className={`px-2 sm:px-0 py-6 whitespace-nowrap flex justify-center${
                        tx.viaEdenRPC ? ' text-green' : ''
                      }`}
                    >
                      <span
                        data-tip
                        data-for={
                          tx.viaEdenRPC ? 'LockClosedTip' : 'LockOpenTip'
                        }
                      >
                        {tx.viaEdenRPC ? LockClosed : LockOpen}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <NoSSr>
        <ReactToolTip
          className="tooltip"
          id="EdenLogoTip"
          place="top"
          effect="solid"
          offset={{ left: 2 }}
          border
        >
          Block was mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="EthLogoTip"
          place="top"
          offset={{ left: 2 }}
          effect="solid"
          border
        >
          Block was not mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="LockOpenTip"
          place="top"
          effect="solid"
          border
        >
          Transaction was not submitted to Eden RPC
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="LockClosedTip"
          place="top"
          effect="solid"
          border
        >
          Transaction was submitted to Eden RPC
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="thBlockType"
          place="top"
          effect="solid"
          border
        >
          Was block mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="thTxsAbove"
          place="top"
          effect="solid"
          border
        >
          Percentage of transactions in the block
          <br />
          with lower transaction index
        </ReactToolTip>
        <ReactToolTip
          className="tooltip"
          id="thViaEdenRPC"
          place="top"
          effect="solid"
          border
        >
          Did user submitted transaction through
          <br />
          Eden RPC (past submissions not supported)
        </ReactToolTip>
      </NoSSr>
    </div>
  );
}
