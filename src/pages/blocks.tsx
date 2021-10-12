import { useState } from 'react';

import { blocksPaged } from '@eden-network/data';
import moment from 'moment';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';

import Blocks from '../components/Blocks';
import EndlessPagination from '../components/EndlessPagination';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';
import { getBlockInsightAndCache } from '../modules/eden-block-insight';

const PER_PAGE = 10;

export default function BlocksPage({ blocks }) {
  const router = useRouter();
  const [endDate, setEndDate] = useState(() =>
    router.query.endDate ? new Date(Number(router.query.endDate)) : new Date()
  );

  const nextClick = () => {
    router.push(
      `/blocks?skip=${
        router.query.skip === undefined
          ? PER_PAGE
          : Number(router.query.skip) + PER_PAGE
      }`
    );
  };

  const prevClick = () => {
    router.push(
      `/blocks?skip=${
        router.query.skip === undefined || Number(router.query.skip) === 0
          ? 0
          : Number(router.query.skip) - PER_PAGE
      }`
    );
  };

  const handleChangeDate = (date) => {
    router.push(
      `/blocks?skip=${
        router.query.skip === undefined || Number(router.query.skip) === 0
          ? 0
          : Number(router.query.skip) - PER_PAGE
      }&endDate=${date.getTime()}`
    );
    setEndDate(date);
  };

  const handleInputChangeRaw = (e) => {
    const date = moment(e.target.value, 'MMMM d, yyyy h:mm aa');

    if (date.isValid()) {
      handleChangeDate(date);
    }
  };

  return (
    <Shell
      meta={
        <Meta
          title="Block List"
          description="Eden Network Explorer Block List Page"
        />
      }
    >
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg sm:overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center float-right">
                <p className="text-gray-500 w-32 text-sm">
                  Filter By End Date:
                </p>
                <DatePicker
                  selected={endDate}
                  onChange={handleChangeDate}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  onChangeRaw={handleInputChangeRaw}
                />
              </div>
            </div>
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
            <EndlessPagination nextClick={nextClick} prevClick={prevClick} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const skip = context.query.skip ?? 0;
  try {
    const blocks = await blocksPaged({
      start: skip,
      num: PER_PAGE,
      fromActiveProducerOnly: true,
      network: 'mainnet',
    });
    const blocksWithInsight = await Promise.all(
      blocks.map(async (block) => {
        try {
          const blockInsight = await getBlockInsightAndCache(block.number);
          return {
            bundledTxs: blockInsight.transactions.filter(
              (tx) => tx.bundleIndex !== null
            ).length,
            stakerTxs: blockInsight.transactions.filter(
              (tx) => tx.senderStake >= 100
            ).length,
            slotTxs: blockInsight.transactions.filter(
              (tx) => tx.toSlot !== false
            ).length,
            bundledTxsCallSuccess: blockInsight.bundledTxsCallSuccess,
            timestamp: block.timestamp,
            author: block.author,
            number: block.number,
          };
        } catch (e) {
          console.log(e); // eslint-disable-line no-console
          return block;
        }
      })
    );
    return {
      props: {
        blocks: blocksWithInsight,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      props: {
        blocks: [],
      },
    };
  }
}
