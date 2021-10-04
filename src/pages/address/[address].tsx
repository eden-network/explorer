/* eslint-disable react/jsx-props-no-spreading */
import { useRouter } from 'next/router';

import AccountTxTable from '../../components/AccountTxTable';
import BlockPagination from '../../components/BlockPagination';
import EtherscanLink from '../../components/EtherscanLink';
import StakerHeroStats from '../../components/StakerHeroStats';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getAccountInfo } from '../../modules/account-info';
import { getAddressForENS } from '../../modules/getters';
import { validate as ensValidator } from '../../modules/validator/ens';

const PAGE_SIZE = 10;

export default function Address({ accountOverview, transactions }) {
  const router = useRouter();
  const pageNum = router.query.page ? Number(router.query.page) : 1;

  const { next, prev, begin, end, maxPage, currentPage } = usePagination(
    accountOverview.edenTxCount,
    PAGE_SIZE,
    pageNum
  );
  const currentTxs = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
          <h2 className="text-3xl font-extrabold sm:text-4xl hover:text-green">
            <EtherscanLink
              text={accountOverview.address}
              path={`address/${accountOverview.address}`}
            />
          </h2>
        </div>
      </div>
      <StakerHeroStats {...accountOverview} />
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="flex-1 mt-4">
              <AccountTxTable transactions={currentTxs} />
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
  // Find address if ENS
  let { address } = context.query;
  if (ensValidator(address)) {
    address = await getAddressForENS(address);
  }
  const accountInfo = await getAccountInfo(address.toLowerCase());
  return {
    props: {
      ...accountInfo,
    },
  };
}
