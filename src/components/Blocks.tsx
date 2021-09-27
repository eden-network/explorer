import { useMemo } from 'react';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';

import { getMinerAlias } from '../modules/getters';

TimeAgo.addDefaultLocale(en);

export default function Blocks({
  blocks,
}: {
  blocks: { number: number; author: string; timestamp: number }[];
}) {
  const timeAgo = useMemo(() => new TimeAgo('en-US'), []);

  const shapedBlocks = useMemo(
    () =>
      blocks.map((block) => {
        return {
          number: block.number,
          author: getMinerAlias(block.author) || block.author,
          timestamp: timeAgo.format(block.timestamp * 1000),
        };
      }),
    [blocks, timeAgo]
  );

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
                    Number
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Producer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light">
                {shapedBlocks.map((block) => (
                  <tr key={block.number}>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <Link href={`/block/${block.number}`}>
                        <a className="text-green">
                          {block.number.toLocaleString()}
                        </a>
                      </Link>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {block.timestamp}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {block.author}
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
