import { useRouter } from 'next/router';

import EtherscanLink from '../../components/EtherscanLink';
import StakerHeroStats from '../../components/StakerHeroStats';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getAccountInfo } from '../../modules/account-info';

export default function Address({ accountOverview }) {
  const router = useRouter();

  return (
    <Shell
      meta={
        <Meta
          title="Address"
          description="Eden Network Explorer Address Page"
        />
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {accountOverview.address}
          </h2>
        </div>
      </div>
      {accountOverview.stakerRank !== null ? (
        <StakerHeroStats {...accountOverview} /> // eslint-disable-line react/jsx-props-no-spreading
      ) : (
        <div />
      )}
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
  const accountInfo = await getAccountInfo(context.query.address.toLowerCase());
  return {
    props: {
      ...accountInfo,
    },
  };
}
