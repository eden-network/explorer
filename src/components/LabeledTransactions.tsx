import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useWindowSize from '../hooks/useWindowSize.hook';
import { AppConfig } from '../utils/AppConfig';
import TableSortLabel from './table/TableSortLabel';

const rowColorSettings = AppConfig.blockInsightRowColorByPriority;

const formatTxHash = (tx) => {
  return `${tx.slice(0, 6)}...`;
};
const formatAddress = (address) => {
  return `${address.slice(0, 6)}...`;
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
  handleRequestSort,
  orderBy,
  order,
}) {
  const { width } = useWindowSize();
  const isMobile = width < AppConfig.breakpoints.small;

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
                      active={orderBy === 'nonce'}
                      direction={order}
                      onClick={() => handleRequestSort('nonce')}
                    >
                      Nonce
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'priorityFee'}
                      direction={order}
                      onClick={() => handleRequestSort('priorityFee')}
                    >
                      Priority Fee
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:pl-8 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'senderStake'}
                      direction={order}
                      onClick={() => handleRequestSort('senderStake')}
                    >
                      Sender Stake
                    </TableSortLabel>
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TableSortLabel
                      active={orderBy === 'type'}
                      direction={order}
                      onClick={() => handleRequestSort('type')}
                    >
                      Priority By
                    </TableSortLabel>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light">
                {labeledTxs.map((tx) => {
                  const rowColor = getRowColor(tx);
                  return (
                    <tr key={tx.hash} className="text-gray-300">
                      <td className="py-4 text-center whitespace-nowrap">
                        {tx.position}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          className=" hover:text-green"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatTxHash(tx.hash)}{' '}
                          <FontAwesomeIcon icon="external-link-alt" size="xs" />
                        </a>
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        <a
                          href={`https://etherscan.io/address/${tx.from}`}
                          className="  hover:text-green"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatAddress(tx.from)}{' '}
                          <FontAwesomeIcon icon="external-link-alt" size="xs" />
                        </a>
                      </td>
                      <td className="px-2 sm:pl-4 py-4 text-center whitespace-nowrap">
                        <a
                          href={`https://etherscan.io/address/${tx.to}`}
                          className=" hover:text-green"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatAddress(tx.to)}{' '}
                          <FontAwesomeIcon icon="external-link-alt" size="xs" />
                        </a>
                      </td>
                      <td className="px-2 py-4 text-right whitespace-nowrap">
                        {tx.nonce.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-right whitespace-nowrap">
                        {tx.priorityFee.toLocaleString()}
                      </td>
                      <td className="px-2 sm:pl-8 py-4 text-center whitespace-nowrap">
                        {tx.toSlot !== false ? tx.toSlot : ''}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        {tx.bundleIndex !== null ? tx.bundleIndex : ''}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        {tx.senderStake >= 100
                          ? tx.senderStake.toLocaleString()
                          : ''}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-center whitespace-nowrap">
                        <span
                          className={`w-28 rounded-3xl py-2 bg-${rowColor} inline-block text-xs text-bold text-blue-light shadow-sm`}
                        >
                          {AppConfig.labelsToUI[tx.type]}
                        </span>
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
