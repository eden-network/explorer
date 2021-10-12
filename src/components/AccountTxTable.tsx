import moment from 'moment';
import Image from 'next/image';

import edenLogoSvg from '../../public/eden-logo.svg';
import ethLogoSvg from '../../public/eth-logo.svg';
import { formatAddress, formatTxHash } from '../modules/formatter';
import ClipboardButton from './ClipboardButton';

const EthLogo = <Image src={ethLogoSvg} width={20} />;
const EdenLogo = <Image src={edenLogoSvg} width={20} />;

export default function AccountTxTable({ transactions, account }) {
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
                    Block-Type
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
                    % Txs Above
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority Fee
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
                      className={`px-2 sm:px-1 py-4 whitespace-nowrap capitalize ${
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
                          account.toLowerCase() === tx.from.toLowerCase()
                            ? 'text-gray-300'
                            : ''
                        }`}
                      >
                        {account.toLowerCase() !== tx.from.toLowerCase() ? (
                          <ClipboardButton
                            className="pr-2"
                            copyText={tx.from}
                          />
                        ) : (
                          ''
                        )}
                        {account.toLowerCase() !== tx.from.toLowerCase() ? (
                          <a
                            href={`/address/${tx.from}`}
                            className=" hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {formatAddress(tx.from)}
                          </a>
                        ) : (
                          formatAddress(tx.from)
                        )}
                      </span>
                    </td>
                    <td className="px-2 sm:px-1 py-4 whitespace-nowrap">
                      <span
                        className={`flex items-center justify-center ${
                          account.toLowerCase() === tx.to.toLowerCase()
                            ? 'text-gray-300'
                            : ''
                        }`}
                      >
                        {account.toLowerCase() !== tx.to.toLowerCase() ? (
                          <ClipboardButton className="pr-2" copyText={tx.to} />
                        ) : (
                          ''
                        )}
                        {account.toLowerCase() !== tx.to.toLowerCase() ? (
                          <a
                            href={`/address/${tx.to}`}
                            className=" hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {formatAddress(tx.to)}
                          </a>
                        ) : (
                          formatAddress(tx.to)
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
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {tx.priorityFee} Gwei
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
