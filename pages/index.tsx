import Shell from '../components/Shell'
import HeroStats from '../components/HeroStats'
import Blocks from '../components/Blocks'
import { blocksPaged, rewardSchedule, staker, stakerLeaderboard, stakeStats } from '@eden-network/data'
import StakedDistribution from '../components/StakedDistribution'
import StakedDistributionSummary from '../components/StakedDistributionSummary'

const WEI = BigInt("1000000000000000000");

export default function Home({ hashRate, stakers, staked, stakeDistribution, blocks, topStakedAmount }) {
  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Eden Network Explorer
          </h2>
        </div>
      </div>
      <HeroStats hashRate={hashRate} stakers={stakers} staked={staked} />
      <div className="max-w-7xl mx-auto grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg">
                Blocks
              </h3>
            </div>
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-shrink-0">
              <h3 className="text-lg">
                Staking
              </h3>
            </div>
            <div className="flex-1 mt-4">
              <h3 className="text-sm mb-2 w-full text-center">Staked EDEN Distribution</h3>
              <StakedDistribution data={stakeDistribution} />
              <StakedDistributionSummary data={stakeDistribution} stakers={stakers} staked={staked} topStakedAmount={topStakedAmount} />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}



export async function getServerSideProps(context) {
  const [rewards, stake, blocks, leaderboard] = await Promise.all([
    rewardSchedule(),
    stakeStats(),
    blocksPaged({ start: 0, num: 7, fromActiveProducerOnly: true, network: "mainnet" }),
    stakerLeaderboard({ start: 0, num: 1, network: "mainnet" })
  ]);
  const hashRate = (rewards?.pendingEpoch?.producerBlocksRatio ?? 0) * 100;
  const stakers = stake?.numStakers ?? 0;
  const staked = Number((stake?.totalStaked ?? BigInt(0)) / WEI);
  const stakeDistribution = stake.stakedPercentiles.map(x => Number(x / WEI)).reverse();
  const topStakedAmount = Number(leaderboard[0].staked / WEI);
  return {
    props: {
      hashRate,
      stakers,
      staked,
      stakeDistribution,
      blocks,
      topStakedAmount
    }
  }
}
