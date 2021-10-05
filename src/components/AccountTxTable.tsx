import ClipboardButton from './ClipboardButton';

const formatTxHash = (tx) => {
  return `${tx.slice(0, 4)}...${tx.slice(tx.length - 4, tx.length)}`;
};
const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length
  )}`;
};

export default function AccountTxTable({ transactions }) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-hidden sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden sm:rounded-lg">
            <table className="min-w-full">
              <thead className="bg-blue-light">
                <tr>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nonce
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Block
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hash
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gas Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light border-b border-blue-light">
                {transactions.map((tx) => (
                  <tr key={tx.nonce}>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {tx.nonce}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <ClipboardButton className="pr-2" copyText={tx.block} />
                      <a
                        href={`/block/${tx.block}?tx=${tx.hash}`}
                        className=" hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {tx.block}
                      </a>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {new Date(tx.timestamp * 1e3).toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <ClipboardButton className="pr-2" copyText={tx.hash} />
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        className=" hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatTxHash(tx.hash)}
                      </a>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <ClipboardButton className="pr-2" copyText={tx.to} />
                      <a
                        href={`/address/${tx.to}`}
                        className=" hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatAddress(tx.to)}
                      </a>
                    </td>
                    <td
                      className={`px-2 sm:px-6 py-4 whitespace-nowrap capitalize ${
                        tx.status === 'fail' ? 'text-red' : 'text-green'
                      }`}
                    >
                      {tx.status}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {tx.gasPrice} Gwei
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
