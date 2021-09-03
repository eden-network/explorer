import { useMemo } from 'react';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';

TimeAgo.addDefaultLocale(en);

function translateProducer(producer: string) {
  switch (producer) {
    case '0xb3b7874f13387d44a3398d298b075b7a3505d8d4':
      return 'Spark Pool';
    case '0xe206e3dca498258f1b7eec1c640b5aee7bb88fd0':
      return 'Spark Pool';
    case '0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c':
      return 'Spark Pool';
    case '0x00192fb10df37c9fb26829eb2cc623cd1bf599e8':
      return '2Miners: PPLNS';
    case '0x002e08000acbbae2155fab7ac01929564949070d':
      return '2Miners: Solo';
    case '0x1ad91ee08f21be3de0ba2ba6918e714da6b45836':
      return 'Hiveon';
    case '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5':
      return 'Nanopool';
    case '0x829bd824b016326a401d083b33d092293333a830':
      return 'F2Pool';
    case '0x249bdb4499bd7c683664c149276c1d86108e2137':
      return 'Cruxpool';
    case '0x01ca8a0ba4a80d12a8fb6e3655688f57b16608cf':
      return 'Spark Pool';
    default:
      return 'Not found';
  }
}

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
          author: translateProducer(block.author),
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Producer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-light">
                {shapedBlocks.map((block) => (
                  <tr key={block.number}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/block/${block.number}`}>
                        <a className="text-green">
                          {block.number.toLocaleString()}
                        </a>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {block.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
