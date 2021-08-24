import { staker, stakeStats } from '@eden-network/data';
import { useRouter } from 'next/router';
import EtherscanLink from '../../components/EtherscanLink';
import Shell from '../../components/Shell';
import StakerHeroStats from '../../components/StakerHeroStats';

const WEI = BigInt("1000000000000000000");

export default function Address({ staked, rank, outOf }) {
  const router = useRouter();

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {router.query.address}
          </h2>
        </div>
      </div>
      {rank !== null
        ? <StakerHeroStats rank={rank} outOf={outOf} staked={staked} />
        : <div />
      }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl text-green">
            <EtherscanLink path={`address/${router.query.address}`} />
          </h2>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const [data, stats] = await Promise.all([
    staker({ staker: context.query.address.toLowerCase(), network: "mainnet" }),
    stakeStats()
  ]);
  const staked = data !== undefined ? Number(data.staked / WEI) : undefined;
  return {
    props: {
      staked: staked !== undefined ? staked : null,
      rank: data?.rank ?? null,
      outOf: stats.numStakers
    }
  };
}
