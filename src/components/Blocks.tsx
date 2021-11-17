import { useEffect, useMemo } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';
import ReactToolTip from 'react-tooltip';

import { formatAddress } from '../modules/formatter';
import { getMinerAlias } from '../modules/getters';
import { EthLogo, EdenLogo } from '../modules/icons';
import ClipboardButton from './ClipboardButton';

TimeAgo.addDefaultLocale(en);

export default function Blocks({
  blocks,
  edenProducerOnly,
}: {
  blocks: {
    number: number;
    author: string;
    timestamp: number;
    slotTxs: number;
    bundledTxs: number;
    stakerTxs: number;
    fromActiveProducer: boolean;
    bundledTxsCallSuccess: boolean;
  }[];
  edenProducerOnly: boolean;
}) {
  const timeAgo = useMemo(() => new TimeAgo('en-US'), []);

  const shapedBlocks = useMemo(
    () =>
      blocks
        .filter((x) => !edenProducerOnly || x.fromActiveProducer)
        .map((block) => {
          return {
            number: block.number,
            autherHex: block.author,
            author: getMinerAlias(block.author) || formatAddress(block.author),
            timestamp: timeAgo.format(block.timestamp * 1000),
            bundledTxsCallSuccess: block.bundledTxsCallSuccess,
            fromActiveProducer: block.fromActiveProducer,
            bundledTxs: block.bundledTxs,
            stakerTxs: block.stakerTxs,
            slotTxs: block.slotTxs,
          };
        }),
    [edenProducerOnly, blocks, timeAgo]
  );

  useEffect(() => {
    ReactToolTip.rebuild();
  }, [edenProducerOnly]);

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full">
              <thead className="bg-blue-light">
                <tr>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1"
                  >
                    Number
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1"
                  >
                    Time
                  </th>

                  <th
                    scope="col"
                    className="px-0 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-22"
                  >
                    {!edenProducerOnly && (
                      <span data-tip data-for="thBlockType">
                        <FontAwesomeIcon icon="question-circle" /> Block-Type
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Producer
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1"
                  >
                    Slot Txs
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1"
                  >
                    Bundled Txs
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1"
                  >
                    Staker Txs
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

                    <td className="pt-3 pb-0 flex justify-center">
                      {!edenProducerOnly && (
                        <span
                          data-tip
                          data-for={
                            block.fromActiveProducer
                              ? 'EdenLogoTip'
                              : 'EthLogoTip'
                          }
                        >
                          {block.fromActiveProducer ? EdenLogo : EthLogo}
                        </span>
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-left">
                      <span className="flex">
                        <ClipboardButton
                          className="pr-2 block"
                          copyText={block.autherHex}
                        />
                        {block.author}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center">
                      {block.slotTxs}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center">
                      {block.bundledTxs > 0 || block.bundledTxsCallSuccess
                        ? block.bundledTxs
                        : '?'}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center">
                      {block.stakerTxs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ReactToolTip
        className="tooltip"
        id="thBlockType"
        place="top"
        effect="solid"
        border
      >
        Was block mined by Eden producer
      </ReactToolTip>
      <ReactToolTip
        className="tooltip"
        id="EdenLogoTip"
        place="top"
        effect="solid"
        offset={{ left: 2 }}
        border
      >
        Block was mined by Eden producer
      </ReactToolTip>
      <ReactToolTip
        className="tooltip"
        id="EthLogoTip"
        place="top"
        offset={{ left: 2 }}
        effect="solid"
        border
      >
        Block was not mined by Eden producer
      </ReactToolTip>
    </div>
  );
}
