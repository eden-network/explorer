import { useRef, useEffect, useState, useCallback } from 'react';

import cx from 'classnames';
import { useRouter } from 'next/router';

import useWindowSize from '../hooks/useWindowSize.hook';
import { AppConfig } from '../utils/AppConfig';
import ClipboardButton from './ClipboardButton';
import TableSortLabel from './table/TableSortLabel';

const rowColorSettings = AppConfig.blockInsightRowColorByPriority;

const formatTxHash = (tx) => {
  return `${tx.slice(0, 6)}...${tx.slice(tx.length - 4, tx.length)}`;
};
const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length
  )}`;
};

const getRowColor = (tx) => {
  switch (tx.type) {
    case 'slot':
    case 'stake':
      return rowColorSettings[tx.type];
    case 'fb-bundle':
      return rowColorSettings[`bundle-${tx.bundleIndex % 2}`];
    default:
      return rowColorSettings['priority-fee'];
  }
};

export default function LabeledTransactions({
  labeledTxs,
  miner,
  handleRequestSort,
  orderBy,
  order,
}) {
  const { width } = useWindowSize();
  const router = useRouter();
  const fieldRef = useRef(null);
  const isMobile = width < AppConfig.breakpoints.small;

  const selectedTx = router.query.selected_tx ? router.query.selected_tx : null;

  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      fieldRef.current.focus();
      setSelectedRow(selectedTx);
    }
  }, []);

  const handleClickRow = (row) => {
    if (row.hash === selectedRow) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row.hash);
    }
  };

  const handleClickLink = useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="overflow-scroll sm:overflow-hidden -my-2 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-4 lg:px-8">
          <div className="overflow-scroll sm:overflow-hidden sm:rounded-lg">
            <table className="min-w-full">
              <thead className="bg-blue-light">
                <tr>
                  <th
                    scope="col"
                    className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'position'}
                      direction={order}
                      onClick={() => handleRequestSort('position')}
                    >
                      {isMobile ? '#' : 'TxIndex'}
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'hash'}
                      direction={order}
                      onClick={() => handleRequestSort('hash')}
                    >
                      TxHash
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'from'}
                      direction={order}
                      onClick={() => handleRequestSort('from')}
                    >
                      From
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:pl-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'to'}
                      direction={order}
                      onClick={() => handleRequestSort('to')}
                    >
                      To
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'gasLimit'}
                      direction={order}
                      onClick={() => handleRequestSort('gasLimit')}
                    >
                      Gas limit
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'nonce'}
                      direction={order}
                      onClick={() => handleRequestSort('nonce')}
                    >
                      Nonce
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'parsedMaxPriorityFee'}
                      direction={order}
                      onClick={() => handleRequestSort('parsedMaxPriorityFee')}
                    >
                      Priority Fee
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="flex float-right">
                      <span className="w-28">
                        <TableSortLabel
                          active={orderBy === 'type'}
                          direction={order}
                          onClick={() => handleRequestSort('type')}
                        >
                          Priority By
                        </TableSortLabel>
                      </span>
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/100"
                  >
                    <TableSortLabel
                      active={orderBy === 'toSlot'}
                      direction={order}
                      onClick={() => handleRequestSort('toSlot')}
                    >
                      To Slot
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/100"
                  >
                    <TableSortLabel
                      active={orderBy === 'bundleIndex'}
                      direction={order}
                      onClick={() => handleRequestSort('bundleIndex')}
                    >
                      Bundle Index
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/100"
                  >
                    <TableSortLabel
                      active={orderBy === 'senderStake'}
                      direction={order}
                      onClick={() => handleRequestSort('senderStake')}
                    >
                      Sender Stake
                    </TableSortLabel>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light">
                {labeledTxs.map((tx) => {
                  const rowColor = getRowColor(tx);
                  return (
                    <tr
                      key={tx.hash}
                      ref={tx.hash === selectedTx ? fieldRef : null}
                      className={cx('text-gray-300', {
                        'outline-none ring ring-red-300 border-transparent':
                          selectedRow === tx.hash,
                      })}
                      onClick={() => handleClickRow(tx)}
                    >
                      <td className="py-4 text-center whitespace-nowrap">
                        {tx.position}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
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
                            onClick={handleClickLink}
                          >
                            {formatTxHash(tx.hash)}{' '}
                          </a>
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          <ClipboardButton
                            className="pr-2 block"
                            copyText={tx.from}
                          />
                          <a
                            href={`/address/${tx.from}`}
                            className="  hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                            onClick={handleClickLink}
                          >
                            {miner === tx.from
                              ? 'Miner'
                              : formatAddress(tx.from)}{' '}
                          </a>
                        </span>
                      </td>
                      <td className="px-2 sm:pl-4 py-4 text-center whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          <ClipboardButton
                            className="pr-2 block"
                            copyText={tx.to}
                          />
                          <a
                            href={`/address/${tx.to}`}
                            className=" hover:text-green block"
                            target="_blank"
                            rel="noreferrer"
                            onClick={handleClickLink}
                          >
                            {miner === tx.to ? 'Miner' : formatAddress(tx.to)}{' '}
                          </a>
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {tx.gasLimit.toLocaleString()}
                      </td>
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {tx.nonce.toLocaleString()}
                      </td>
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {tx.maxPriorityFee.toLocaleString()}
                      </td>
                      <td className="px-2 py-3 flex float-right text-center whitespace-nowrap">
                        <span
                          className={`w-28 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm font-bold`}
                        >
                          {AppConfig.labelsToUI[tx.type]}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap w-1/100">
                        {tx.toSlot !== false ? tx.toSlot : ''}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap w-1/100">
                        {tx.bundleIndex !== null ? tx.bundleIndex : ''}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap w-1/100">
                        {tx.senderStake >= 100
                          ? tx.senderStake.toLocaleString()
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
