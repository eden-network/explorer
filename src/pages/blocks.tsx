/* eslint-disable react/button-has-type */
import { useCallback, useMemo, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  const [beforeEpoch, setbeforeEpoch] = useState(() => {
    return router.query.beforeEpoch ?? new Date().getTime() / 1e3;
  });

  const reset = () => {
    router.push(
      `/blocks${
        router.query.beforeEpoch
          ? `?beforeEpoch=${router.query.beforeEpoch}`
          : ''
      }`,
      null,
      { scroll: false }
    );
  };

  const nextClick = () => {
    router.push(
      `/blocks?p=${
        router.query.p === undefined ? 2 : Number(router.query.p) + 1
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
      `/blocks?p=${
        router.query.p === undefined ? 1 : Number(router.query.p) - 1
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
    const epoch = Math.ceil(date.getTime() / 1e3);
    router.push(`/blocks?beforeEpoch=${epoch}`, null, {
      scroll: false,
    });
    setbeforeEpoch(epoch);
  };

  const handleInputChangeRaw = (e) => {
    const date = moment(e.target.value, 'MMMM d, yyyy h:mm aa');

    if (date.isValid()) {
      handleChangeDate(date);
    }
  };

  const selectedTime = useMemo(
    () => new Date(Number(beforeEpoch) * 1000),
    [beforeEpoch]
  );

  const handleResetBeforeEpoch = useCallback(() => {
    router.push(`/blocks`, null, {
      scroll: false,
    });
    setbeforeEpoch(new Date().getTime() / 1e3);
  }, [router]);

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
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="w-100">
              <div className="flex items-center sm:float-right">
                <p className="text-gray-500 w-28 text-sm mr-2">
                  Filter By End Date:
                </p>
                <DatePicker
                  selected={selectedTime}
                  onChange={handleChangeDate}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  onChangeRaw={handleInputChangeRaw}
                />
                <button
                  onClick={handleResetBeforeEpoch}
                  className="ml-1 px-2 py-1 text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
                >
                  <FontAwesomeIcon icon="sync" />
                </button>
              </div>
            </div>
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
            <EndlessPagination
              end={blocks.length < PER_PAGE}
              currentPage={router.query.p ? Number(router.query.p) : 1}
              nextClick={nextClick}
              prevClick={prevClick}
              reset={reset}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const page = context.query.p ?? 1;
  const beforeEpoch = context.query.beforeEpoch || null;
  try {
    const skip = (page - 1) * PER_PAGE;
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
          console.error(e); // eslint-disable-line no-console
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
