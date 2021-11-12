import { useRef, useEffect, useState, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { useRouter } from 'next/router';
import ReactToolTip from 'react-tooltip';

import useWindowSize from '../hooks/useWindowSize.hook';
import { formatAddress, formatTxHash } from '../modules/formatter';
import { LockClosed, LockOpen } from '../modules/icons';
import { weiToETH, formatWei } from '../modules/utils';
import { AppConfig } from '../utils/AppConfig';
import ClipboardButton from './ClipboardButton';
import TableSortLabel from './table/TableSortLabel';

const rowColorSettings = AppConfig.blockInsightRowColorByPriority;

const getRowColor = (tx) => {
  switch (tx.type) {
    case 'slot':
    case 'stake':
      return rowColorSettings[tx.type];
    case 'fb-bundle':
      return rowColorSettings[`bundle-${tx.bundleIndex % 2}`];
    case 'local-tx':
      return rowColorSettings[`local-tx`];
    default:
      return rowColorSettings['priority-fee'];
  }
};

export default function LabeledTransactions({
  labeledTxs,
  handleRequestSort,
  orderBy,
  order,
}) {
  const { width } = useWindowSize();
  const router = useRouter();
  const fieldRef = useRef(null);
  const isMobile = width < AppConfig.breakpoints.small;

  const selectedTx = router.query.tx ? router.query.tx : null;
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
  }, [selectedTx]);

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
      <div className="overflow-x-auto -my-2 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-4 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full">
              <thead className="bg-blue-light">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'index'}
                      direction={order}
                      onClick={() => handleRequestSort('index')}
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
                  {labeledTxs.length > 0 &&
                  labeledTxs[0].gasUsed !== undefined ? (
                    <th
                      scope="col"
                      className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Gas usage
                    </th>
                  ) : (
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
                  )}
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
                  {labeledTxs.length > 0 &&
                  labeledTxs[0].minerReward !== undefined ? (
                    <th
                      scope="col"
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <TableSortLabel
                        active={orderBy === 'parsedMaxPriorityFee'}
                        direction={order}
                        onClick={() =>
                          handleRequestSort('parsedMaxPriorityFee')
                        }
                      >
                        <span data-tip data-for="MinerReward">
                          <FontAwesomeIcon icon="question-circle" /> Miner
                          Reward
                        </span>
                      </TableSortLabel>
                    </th>
                  ) : (
                    ''
                  )}
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'viaEdenRPC'}
                      direction={order}
                      onClick={() => handleRequestSort('viaEdenRPC')}
                    >
                      <span data-tip data-for="thViaEdenRPC">
                        <FontAwesomeIcon icon="question-circle" /> Via Eden RPC
                      </span>
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="w-28">
                      <TableSortLabel
                        active={orderBy === 'type'}
                        direction={order}
                        onClick={() => handleRequestSort('type')}
                      >
                        Priority By
                      </TableSortLabel>
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/100"
                  >
                    Extra
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
                      {tx.status === 0 ? (
                        <td className="pr-3 py-4 text-right whitespace-nowrap text-red">
                          <span data-tip data-for="TxFail">
                            <FontAwesomeIcon icon="exclamation-circle" />{' '}
                            {tx.index}
                          </span>
                        </td>
                      ) : (
                        <td className="pr-3 py-4 text-right whitespace-nowrap">
                          {tx.index}
                        </td>
                      )}
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        <span className="flex items-center justify-center">
                          <ClipboardButton
                            className="pr-2 block"
                            copyText={tx.hash}
                          />
                          <a
                            href={`/tx/${tx.hash}`}
                            className=" hover:text-green block w-26"
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
                            className=" hover:text-green block w-26"
                            target="_blank"
                            rel="noreferrer"
                            onClick={handleClickLink}
                          >
                            {tx.fromLabel || formatAddress(tx.from)}{' '}
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
                            className=" hover:text-green block w-26"
                            target="_blank"
                            rel="noreferrer"
                            onClick={handleClickLink}
                          >
                            {tx.toLabel || formatAddress(tx.to)}{' '}
                          </a>
                        </span>
                      </td>
                      {tx.gasUsed ? (
                        <td className="px-2 py-4 text-right whitespace-nowrap">
                          {tx.gasUsed.toLocaleString()}
                          <p>of {tx.gasLimit.toLocaleString()}</p>
                        </td>
                      ) : (
                        <td className="px-2 py-4 text-right whitespace-nowrap">
                          {tx.gasLimit.toLocaleString()}
                        </td>
                      )}
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {tx.nonce.toLocaleString()}
                      </td>
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {Object.values(formatWei(tx.maxPriorityFee)).join(' ')}
                      </td>
                      {tx.minerReward !== undefined ? (
                        <td className="px-2 py-4 text-right whitespace-nowrap">
                          {tx.minerReward && weiToETH(tx.minerReward)} Eth
                        </td>
                      ) : (
                        ''
                      )}
                      <td
                        className={`px-0 py-4 whitespace-nowrap ${
                          tx.viaEdenRPC ? ' text-green' : ''
                        }`}
                      >
                        <span
                          className="flex justify-center"
                          data-tip
                          data-for={
                            tx.viaEdenRPC ? 'LockClosedTip' : 'LockOpenTip'
                          }
                        >
                          {tx.viaEdenRPC ? LockClosed : LockOpen}
                        </span>
                      </td>
                      <td className="px-0 py-4 whitespace-nowrap text-center">
                        <span
                          className={`w-28 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm font-bold`}
                        >
                          {AppConfig.labelsToUI[tx.type]}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-center">
                        <div className="flex float-center justify-start">
                          {tx.toSlot !== false ? (
                            <span
                              className={`p-4 m-1 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm font-bold`}
                            >
                              To slot #{tx.toSlot}
                            </span>
                          ) : (
                            ''
                          )}
                          {tx.bundleIndex !== null ? (
                            <span
                              className={`p-4 m-1 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm font-bold`}
                            >
                              To bundle #{tx.bundleIndex}
                            </span>
                          ) : (
                            ''
                          )}
                          {tx.senderStake >= 100 ? (
                            <span
                              className={`p-4 m-1 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm font-bold`}
                            >
                              Staked: {tx.senderStake.toLocaleString()}
                            </span>
                          ) : (
                            ''
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
        id="thViaEdenRPC"
        place="top"
        effect="solid"
        border
      >
        Whether the user submitted transaction through Eden RPC
      </ReactToolTip>
      <ReactToolTip
        className="tooltip"
        id="MinerReward"
        place="top"
        effect="solid"
        border
      >
        ETH miner recieved from this transaction. Includes non-burned gas fees
        and direct miner payments if transaction is in a bundle.
      </ReactToolTip>
      <ReactToolTip
        className="tooltip"
        id="TxFail"
        place="top"
        effect="solid"
        border
      >
        Transaction reverted
      </ReactToolTip>
    </div>
  );
}
