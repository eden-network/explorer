import { stakerLeaderboard, stakers } from '@eden-network/data';
import Head from 'next/head'
import { useMemo, useState } from 'react';
import Header from '../components/Header'
import Pagination from '../components/Pagination';
import Search from '../components/Search'
import Stakers from '../components/Stakers'

const WEI = BigInt("1000000000000000000");

export default function StakersPage({ leaderboard }: { leaderboard: [{ id: string, rank: number, staked: number }] }) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [filter, setFilter] = useState();

  const data = useMemo(() =>
    leaderboard.slice(page * perPage, page * perPage + perPage),
    [leaderboard, page, perPage, filter]
  );

  const numPages = useMemo(() => 
    Math.floor(data.length / perPage) + (data.length % perPage === 0 ? 0 : data.length % perPage),
    [data, perPage]
  );

  return (
    <div className="min-h-screen bg-blue-light">
      <Head>
        <title>Eden Network Explorer</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="py-10 text-white">
        <main>
          <div className="max-w-4xl mx-auto grid gap-5">
            <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-shrink-0">
                  <Search prompt="Address" />
                </div>
                <div className="flex-1 mt-4">
                  <Stakers stakers={data} />
                </div>
                <Pagination numPages={numPages} perPage={perPage} activePage={page} total={leaderboard.length} setPage={setPage}/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const stakers_ = await stakers();
  const leaderboard = stakers_
    .filter(staker => staker.rank != null)
    .sort((a, b) => a.rank - b.rank)
    .map(staker => {
      return {
        ...staker,
        staked: Number(staker.staked / WEI)
      }
    });
  return {
    props: {
      leaderboard
    }
  };
}
