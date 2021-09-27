import Link from 'next/link';

import useWindowSize from '../hooks/useWindowSize.hook';
import { AppConfig } from '../utils/AppConfig';

export default function Stakers({
  stakers,
}: {
  stakers: { id: string; staked: number; rank: number }[];
}) {
  const { width } = useWindowSize();
  const isMobileView = width < AppConfig.breakpoints.small;

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
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Staked
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light border-b border-blue-light">
                {stakers.map((staker) => (
                  <tr key={staker.rank}>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      #{staker.rank + 1}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {Math.floor(staker.staked).toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <Link href={`/address/${staker.id}`}>
                        <a className="text-green">
                          {isMobileView
                            ? `${staker.id.slice(0, 16)}...${staker.id.slice(
                                36,
                                40
                              )}`
                            : staker.id}
                        </a>
                      </Link>
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
