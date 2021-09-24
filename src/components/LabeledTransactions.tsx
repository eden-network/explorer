import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useWindowSize from '../hooks/useWindowSize.hook';
import { AppConfig } from '../utils/AppConfig';

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

export default function LabeledTransactions({ labeledTxs }) {
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
                    {isMobile ? '#' : 'TxIndex'}
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    TxHash
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:pl-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nonce
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority Fee
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:pl-8 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To Slot
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bundle Index
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sender Stake
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light">
                {labeledTxs.map((tx) => {
                  const rowColor = getRowColor(tx);
                  return (
                    <tr key={tx.hash} className={`text-${rowColor}`}>
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
                        {tx.maxPriorityFee.toLocaleString()}
                      </td>
                      <td className="px-2 sm:pl-8 py-4 text-center whitespace-nowrap">
                        {tx.toSlot !== false ? tx.toSlot : 'NO'}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        {tx.bundleIndex !== null ? tx.bundleIndex : 'NO'}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        {tx.senderStake >= 100
                          ? tx.senderStake.toLocaleString()
                          : 'NO'}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-center whitespace-nowrap">
                        {AppConfig.labelsToUI[tx.type]}
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
