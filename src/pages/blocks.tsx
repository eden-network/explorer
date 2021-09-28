import { useMemo } from 'react';

import { blocksPaged } from '@eden-network/data';
import { useRouter } from 'next/router';

import Blocks from '../components/Blocks';
import EndlessPagination from '../components/EndlessPagination';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';
import { getBlockInsightAndCache } from '../modules/eden-block-insight';

const PER_PAGE = 15;

export default function BlocksPage({ blocks }) {
  const router = useRouter();

  const next = useMemo(
    () =>
      `/blocks?skip=${
        router.query.skip === undefined
          ? PER_PAGE
          : Number(router.query.skip) + PER_PAGE
      }`,
    [router.query.skip]
  );
  const previous = useMemo(
    () =>
      `/blocks?skip=${
        router.query.skip === undefined || Number(router.query.skip) === 0
          ? 0
          : Number(router.query.skip) - PER_PAGE
      }`,
    [router.query.skip]
  );

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
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
            <EndlessPagination next={next} previous={previous} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const skip = context.query.skip ?? 0;
  const blocks = await blocksPaged({
    start: skip,
    num: PER_PAGE,
    fromActiveProducerOnly: true,
    network: 'mainnet',
  });
  const blocksWithInsight = await Promise.all(
    blocks.map(async (block) => {
      const blockInsight = await getBlockInsightAndCache(block.number);
      return {
        bundledTxs: blockInsight.transactions.filter(
          (tx) => tx.bundleIndex !== null
        ).length,
        stakerTxs: blockInsight.transactions.filter(
          (tx) => tx.senderStake >= 100
        ).length,
        slotTxs: blockInsight.transactions.filter((tx) => tx.toSlot !== false)
          .length,
        timestamp: block.timestamp,
        author: block.author,
        number: block.number,
      };
    })
  );
  return {
    props: {
      blocks: blocksWithInsight,
    },
  };
}
