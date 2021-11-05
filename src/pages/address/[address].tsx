/* eslint-disable react/jsx-props-no-spreading */
import { useEffect } from 'react';

import { useRouter } from 'next/router';

import AccountTxTable from '../../components/AccountTxTable';
import EndlessPagination from '../../components/EndlessPagination';
import ErrorMsg from '../../components/ErrorMsg';
import EtherscanLink from '../../components/EtherscanLink';
import StakerHeroStats from '../../components/StakerHeroStats';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getAccountInfo } from '../../modules/account-info';
import { getAddressForENS, checkIfContractlike } from '../../modules/getters';
import { validateEns } from '../../modules/validators';
import { AppConfig } from '../../utils/AppConfig';

const PAGE_SIZE = 10;

export default function Address({ accountOverview, transactions, error }) {
  const router = useRouter();
  const pageNum = router.query.p ? Number(router.query.p) : 1;

  const { next, prev, currentPage, resetCurrentPage } = usePagination(
    999999999,
    PAGE_SIZE,
    pageNum
  );
  useEffect(() => {
    if (currentPage !== Number(router.query.p)) {
      router.push(`/address/${router.query.address}?p=${currentPage}`, null, {
        scroll: false,
      });
    }
  }, [currentPage, router]);

  if (error) {
    return (
      <ErrorMsg errorMsg={`Couldn't fetch data for the account:`}>
        <div className="text-center pb-2">
          <a
            href={`${AppConfig.etherscanEndpoint}/address/${router.query.address}`}
            target="_blank"
            className="hover:text-green"
            rel="noreferrer"
          >
            <b>{router.query.address}</b>
          </a>
        </div>
      </ErrorMsg>
    );
  }
  return (
    <Shell
      meta={
        <Meta
          title={`Address ${router.query.address}`}
          description="Eden Network Explorer Address Page"
        />
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold sm:text-4xl hover:text-green break-all">
            <EtherscanLink
              text={accountOverview.label || accountOverview.address}
              path={`address/${accountOverview.ens || accountOverview.address}`}
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
                accountAddress={accountOverview.address}
                accountLabel={accountOverview.label}
              />
            </div>
            <EndlessPagination
              end={transactions.length < PAGE_SIZE}
              currentPage={currentPage}
              reset={resetCurrentPage}
              nextClick={next}
              prevClick={prev}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  try {
    const pageNum = context.query.p || 1;
    // Find address if ENS
    let { address } = context.query;
    if (validateEns(address)) {
      const addressForENS = await getAddressForENS(address);
      if (addressForENS === null) {
        throw new Error('Invalid ENS');
      }
      address = addressForENS;
    }
    const [contractLike, accountInfo] = await Promise.all([
      checkIfContractlike(address),
      getAccountInfo(address.toLowerCase(), PAGE_SIZE, pageNum),
    ]);
    // Change address to ENS if available
    if (context.query.address.toLowerCase() !== address.toLowerCase()) {
      accountInfo.accountOverview.ens = context.query.address.toLowerCase();
      accountInfo.accountOverview.label = context.query.address.toLowerCase();
    }
    // Contracts have tx-count of one
    if (contractLike) {
      accountInfo.accountOverview.txCount = 0;
    }
    return {
      props: {
        ...accountInfo,
        error: false,
      },
    };
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return {
      props: {
        error: true,
      },
    };
  }
}
