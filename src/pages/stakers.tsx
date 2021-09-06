import { useMemo, useState } from 'react';

import { stakers } from '@eden-network/data';

import Pagination from '../components/Pagination';
import Search from '../components/Search';
import Stakers from '../components/Stakers';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';

const WEI = BigInt('1000000000000000000');

export default function StakersPage({
  leaderboard,
}: {
  leaderboard: { id: string; rank: number; staked: number }[];
}) {
  const [page, setPage] = useState(0);
  const [perPage] = useState(15);
  const [filter, setFilter] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (filter) {
      const cmp = filter.toLowerCase();
      return leaderboard.filter((x) => x.id.indexOf(cmp) !== -1);
    }
    return leaderboard;
  }, [leaderboard, filter]);

  const numPages = useMemo(
    () =>
      Math.floor(filtered.length / perPage) +
      (filtered.length % perPage === 0 ? 0 : 1),
    [filtered, perPage]
  );

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
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <Search prompt="Address" setValue={setFilter} />
            </div>
            <div className="flex-1 mt-4">
              <Stakers stakers={data} />
            </div>
            <Pagination
              numPages={numPages}
              perPage={perPage}
              activePage={page}
              total={filtered.length}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps() {
  const allStakers = await stakers();
  const leaderboard = allStakers
    .filter((staker) => staker.rank != null)
    .sort((a, b) => a.rank - b.rank)
    .map((staker) => {
      return {
        ...staker,
        staked: Number(staker.staked / WEI),
      };
    });
  return {
    props: {
      leaderboard,
    },
  };
}
