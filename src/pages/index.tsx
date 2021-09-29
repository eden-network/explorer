import { useCallback, useEffect } from 'react';

import {
  blocksPaged,
  rewardSchedule,
  stakerLeaderboard,
  stakeStats,
  timeseries,
} from '@eden-network/data';
import { useRouter } from 'next/router';

import Blocks from '../components/BlocksHome';
import HeroStats from '../components/HeroStats';
import LastWeekPlot from '../components/LastWeekPlot';
import StakedDistribution from '../components/StakedDistribution';
import StakedDistributionSummary from '../components/StakedDistributionSummary';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';

const WEI = BigInt('1000000000000000000');

export default function Home({
  hashRate,
  stakers,
  staked,
  stakeDistribution,
  blocks,
  topStakedAmount,
  historicalStakeStats,
}) {
  const router = useRouter();

  const refreshData = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  return (
    <Shell
      meta={<Meta title="Home" description="Eden Network Explorer Home Page" />}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Eden Network Explorer
          </h2>
        </div>
      </div>
      <HeroStats hashRate={hashRate} stakers={stakers} staked={staked} />
      <div className="max-w-7xl mx-auto grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg text-center">Blocks</h3>
            </div>
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg text-center">Staked EDEN Distribution</h3>
            </div>
            <div className="flex-1">
              <StakedDistribution data={stakeDistribution} />
              <StakedDistributionSummary
                data={stakeDistribution}
                stakers={stakers}
                staked={staked}
                topStakedAmount={topStakedAmount}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid gap-5 lg:grid-cols-2 mt-6">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg text-center">
                Active Stakers (last 7 days)
              </h3>
            </div>
            <div className="flex-1 mt-4">
              <LastWeekPlot
                data={historicalStakeStats.stakers}
                label="Active Stakers"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg text-center">
                Total EDEN Staked (last 7 days)
              </h3>
            </div>
            <div className="flex-1 mt-4">
              <LastWeekPlot
                data={historicalStakeStats.totalStaked}
                label="EDEN Staked"
              />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps() {
  const now = Math.floor(Date.now() / 1000);
  const hour = 60 * 60;
  const lastSevenDays = [...Array(24 * 7).keys()]
    .reverse()
    .map((x) => now - hour * x);
  const [rewards, stake, blocks, leaderboard, historicalStake] =
    await Promise.all([
      rewardSchedule(),
      stakeStats(),
      blocksPaged({
        start: 0,
        num: 6,
        fromActiveProducerOnly: true,
        network: 'mainnet',
      }),
      stakerLeaderboard({ start: 0, num: 1, network: 'mainnet' }),
      timeseries(
        { timestamps: lastSevenDays, network: 'mainnet', target: stakeStats },
        { includePercentiles: false }
      ),
    ]);
  const hashRate = (rewards?.pendingEpoch?.producerBlocksRatio ?? 0) * 100;
  const stakers = stake?.numStakers ?? 0;
  const staked = Number((stake?.totalStaked ?? BigInt(0)) / WEI);
  const stakeDistribution = stake.stakedPercentiles
    .map((x) => Number(x / WEI))
    .reverse();
  const topStakedAmount = Number(leaderboard[0].staked / WEI);
  const historicalStakeStats = {
    totalStaked: historicalStake.map((x) => Number(x.data.totalStaked / WEI)),
    stakers: historicalStake.map((x) => x.data.numStakers),
  };
  return {
    props: {
      hashRate,
      stakers,
      staked,
      stakeDistribution,
      blocks,
      topStakedAmount,
      historicalStakeStats,
    },
  };
}
