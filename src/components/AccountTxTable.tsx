import moment from 'moment';
import Image from 'next/image';
import ReactToolTip from 'react-tooltip';

import edenLogoSvg from '../../public/eden-logo.svg';
import ethLogoSvg from '../../public/eth-logo.svg';
import { formatAddress, formatTxHash } from '../modules/formatter';
import ClipboardButton from './ClipboardButton';
import NoSSr from './NoSsr';

const EthLogo = (
  <Image
    src={ethLogoSvg}
    alt="ether logo image"
    width={20}
    data-tip
    data-for="ethLogoTip"
  />
);
const EdenLogo = (
  <Image
    src={edenLogoSvg}
    alt="ether logo image"
    width={20}
    data-tip
    data-for="edenLogoTip"
  />
);

const LockClosed = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    data-tip
    data-for="lockClosedTip"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
const LockOpen = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    data-tip
    data-for="lockOpenTip"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);

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
                      Block-Type
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
                      % Txs Above
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
                      Via Eden RPC{' '}
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
                      {tx.isEden ? EdenLogo : EthLogo}
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
                      {tx.viaEdenRPC ? LockClosed : LockOpen}
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
          id="edenLogoTip"
          place="top"
          effect="solid"
          offset={{ top: -10, left: 2 }}
          arrowColor="#303F9F"
        >
          Block was mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          id="ethLogoTip"
          place="top"
          offset={{ top: -10, left: 2 }}
          effect="solid"
          arrowColor="#303F9F"
        >
          Block was not mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          id="lockOpenTip"
          place="top"
          effect="solid"
          arrowColor="#303F9F"
        >
          Transaction was not submitted to Eden RPC
        </ReactToolTip>
        <ReactToolTip
          id="lockClosedTip"
          place="top"
          effect="solid"
          arrowColor="#303F9F"
        >
          Transaction was submitted to Eden RPC
        </ReactToolTip>
        <ReactToolTip
          id="thBlockType"
          place="top"
          effect="solid"
          arrowColor="#303F9F"
        >
          Was block mined by Eden producer
        </ReactToolTip>
        <ReactToolTip
          id="thTxsAbove"
          place="top"
          effect="solid"
          arrowColor="#303F9F"
        >
          Percentage of transactions in the block with lower transaction index
        </ReactToolTip>
        <ReactToolTip
          id="thViaEdenRPC"
          place="top"
          effect="solid"
          arrowColor="#303F9F"
        >
          Did user submitted transaction through Eden RPC (past submissions not
          supported)
        </ReactToolTip>
      </NoSSr>
    </div>
  );
}
