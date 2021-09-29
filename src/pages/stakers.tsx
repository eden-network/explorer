import { useEffect } from 'react';

import { stakeStats, stakerLeaderboard } from '@eden-network/data';
import { useRouter } from 'next/router';

import BlockPagination from '../components/BlockPagination';
import Stakers from '../components/Stakers';
import usePagination from '../hooks/usePagination.hook';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';

const WEI = BigInt('1000000000000000000');
const PER_PAGE = 15;

interface StakerPageProps {
  leaderboard: { id: string; rank: number; staked: number }[];
  stats: {
    numStakers: number;
    totalStaked: number;
  };
}

const PAGE_SIZE = 15;

export default function StakersPage({ leaderboard, stats }: StakerPageProps) {
  const router = useRouter();
  const pageNum = router.query.page ? Number(router.query.page) : 1;

  const { next, prev, begin, end, maxPage, currentPage } = usePagination(
    stats.numStakers,
    PAGE_SIZE,
    pageNum
  );

  useEffect(() => {
    if (currentPage !== Number(router.query.page)) {
      router.push(
        `/stakers?page=${router.query.page === undefined ? 1 : currentPage}`
      );
    }
  }, [currentPage, router]);

  return (
    <Shell
      meta={
        <Meta
          title="Staker List"
          description="Eden Network Explorer Staker List Page"
        />
      }
    >
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="flex-1 mt-4">
              <Stakers stakers={leaderboard} />
            </div>
            <BlockPagination
              prev={prev}
              next={next}
              end={end}
              begin={begin}
              maxPage={maxPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const pageNum = context.query.page ?? 1;
  const [statsRaw, leaderboardRaw] = await Promise.all([
    stakeStats(),
    stakerLeaderboard({
      network: 'mainnet',
      num: PER_PAGE,
      start: (pageNum - 1) * PER_PAGE,
    }),
  ]);
  const stats = {
    numStakers: statsRaw.numStakers,
    totalStaked: Number(statsRaw.totalStaked / WEI),
  };
  const leaderboard = leaderboardRaw
    .filter((staker) => staker.rank != null)
    .map((staker) => {
      return {
        ...staker,
        staked: Number(staker.staked / WEI),
      };
    });
  return {
    props: {
      leaderboard,
      stats,
    },
  };
}
