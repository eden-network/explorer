import { useState } from 'react';

import moment from 'moment';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';

import Blocks from '../components/Blocks';
import EndlessPagination from '../components/EndlessPagination';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';
import { getBlockInsightAndCache } from '../modules/eden-block-insight';
import { getBlocksPaged } from '../modules/getters';

const PER_PAGE = 10;

export default function BlocksPage({ blocks }) {
  const router = useRouter();
  const [beforeEpoch, setbeforeEpoch] = useState(() =>
    router.query.beforeEpoch
      ? new Date(Number(router.query.beforeEpoch))
      : new Date()
  );

  const nextClick = () => {
    router.push(
      `/blocks?skip=${
        router.query.skip === undefined
          ? PER_PAGE
          : Number(router.query.skip) + PER_PAGE
      }${
        router.query.beforeEpoch
          ? `&beforeEpoch=${router.query.beforeEpoch}`
          : ''
      }`,
      null,
      { scroll: false }
    );
  };

  const prevClick = () => {
    router.push(
      `/blocks?skip=${
        router.query.skip === undefined || Number(router.query.skip) === 0
          ? 0
          : Number(router.query.skip) - PER_PAGE
      }${
        router.query.beforeEpoch
          ? `&beforeEpoch=${router.query.beforeEpoch}`
          : ''
      }`,
      null,
      { scroll: false }
    );
  };

  const handleChangeDate = (date) => {
    router.push(`/blocks?skip=0&beforeEpoch=${date.getTime() / 1e3}`, null, {
      scroll: false,
    });
    setbeforeEpoch(date);
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
                  selected={beforeEpoch}
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
  const beforeEpoch = context.query.beforeEpoch || null;
  try {
    const blocks = await getBlocksPaged({
      fromActiveProducerOnly: true,
      beforeTimestamp: beforeEpoch,
      num: PER_PAGE,
      start: skip,
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
