import { useMemo, useState } from 'react';

import { stakeStats, stakerLeaderboard } from '@eden-network/data';
import { useRouter } from 'next/router';

import EndlessPagination from '../components/EndlessPagination';
import Search from '../components/Search';
import Stakers from '../components/Stakers';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';

const WEI = BigInt('1000000000000000000');
const PER_PAGE = 15;

export default function StakersPage({
  leaderboard,
}: {
  leaderboard: { id: string; rank: number; staked: number }[];
}) {
  const router = useRouter();
  const next = useMemo(
    () =>
      `/stakers?skip=${
        router.query.skip === undefined
          ? PER_PAGE
          : Number(router.query.skip) + PER_PAGE
      }`,
    [router.query.skip]
  );
  const previous = useMemo(
    () =>
      `/stakers?skip=${
        router.query.skip === undefined || Number(router.query.skip) === 0
          ? 0
          : Number(router.query.skip) - PER_PAGE
      }`,
    [router.query.skip]
  );

  const [page] = useState(0);
  const [perPage] = useState(15);
  const [filter, setFilter] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (filter) {
      const cmp = filter.toLowerCase();
      return leaderboard.filter((x) => x.id.indexOf(cmp) !== -1);
    }
    return leaderboard;
  }, [leaderboard, filter]);

  const data = useMemo(
    () => filtered.slice(page * perPage, page * perPage + perPage),
    [filtered, page, perPage]
  );

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
            <div className="flex-shrink-0">
              <Search
                prompt="Address"
                handleChange={setFilter}
                value={filter}
              />
            </div>
            <div className="flex-1 mt-4">
              <Stakers stakers={data} />
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
  const [statsRaw, leaderboardRaw] = await Promise.all([
    stakeStats(),
    stakerLeaderboard({
      network: 'mainnet',
      num: PER_PAGE,
      start: skip,
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
