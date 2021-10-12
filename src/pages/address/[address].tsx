/* eslint-disable react/jsx-props-no-spreading */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import AccountTxTable from '../../components/AccountTxTable';
import EndlessPagination from '../../components/EndlessPagination';
import EtherscanLink from '../../components/EtherscanLink';
import StakerHeroStats from '../../components/StakerHeroStats';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getAccountInfo } from '../../modules/account-info';
import { getAddressForENS, checkIfContractlike } from '../../modules/getters';
import { validate as ensValidator } from '../../modules/validator/ens';

const PAGE_SIZE = 10;

export default function Address({ accountOverview, transactions }) {
  const router = useRouter();
  const pageNum = router.query.page ? Number(router.query.page) : 1;

  const { next, prev, currentPage } = usePagination(
    999999999,
    PAGE_SIZE,
    pageNum
  );
  useEffect(() => {
    if (currentPage !== Number(router.query.page)) {
      router.push(
        `/address/${router.query.address}?page=${currentPage}`,
        null,
        { scroll: false }
      );
    }
  }, [currentPage, router]);

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
          <h2 className="text-2xl font-extrabold sm:text-4xl hover:text-green break-all">
            <EtherscanLink
              text={accountOverview.address}
              path={`address/${accountOverview.address}`}
            />
          </h2>
        </div>
      </div>
      <StakerHeroStats {...accountOverview} />
      <div className="max-w-7xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="flex-1 mt-4">
              <AccountTxTable
                transactions={transactions}
                account={accountOverview.address}
              />
            </div>
            <EndlessPagination nextClick={next} prevClick={prev} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const pageNum = context.query.page || 1;
  // Find address if ENS
  let { address } = context.query;
  if (ensValidator(address)) {
    address = await getAddressForENS(address);
  }
  const [contractLike, accountInfo] = await Promise.all([
    checkIfContractlike(address),
    getAccountInfo(address.toLowerCase(), PAGE_SIZE, pageNum),
  ]);
  // Change address to ENS if available
  if (context.query.address.toLowerCase() !== address.toLowerCase()) {
    accountInfo.accountOverview.address = context.query.address.toLowerCase();
  }
  // Contracts have tx-count of one
  if (contractLike) {
    accountInfo.accountOverview.txCount = 0;
  }
  return {
    props: {
      ...accountInfo,
    },
  };
}
