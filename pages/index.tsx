import Head from 'next/head'
import Header from '../components/Header'
import HeroStats from '../components/HeroStats'
import { rewardSchedule, stakeStats } from '@eden-network/data'
import { useMemo } from 'react'

const WEI = BigInt("1000000000000000000");

export default function Home({ hashRate, stakers, staked }) {
  return (
    <div className="min-h-screen bg-blue-light">
      <Head>
        <title>Eden Network Explorer</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="py-10 text-white">
        <main>
          <HeroStats hashRate={hashRate} stakers={stakers} staked={staked} />
        </main>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const [rewards, stake] = await Promise.all([rewardSchedule(), stakeStats()]);
  const hashRate = (rewards?.pendingEpoch?.producerBlocksRatio ?? 0) * 100;
  const stakers = stake?.numStakers ?? 0;
  const staked = Number((stake?.totalStaked ?? BigInt(0)) / WEI);
  return {
    props: {
      hashRate,
      stakers,
      staked
    },
    revalidate: 10
  }
}
