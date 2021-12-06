import { useCallback, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import ErrorMsg from '../../components/ErrorMsg';
import TransactionPage from '../../components/TransactionPage';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { EtherscanLogo } from '../../modules/icons';
import { getTransactionInfo } from '../../modules/tx-info';
import { validateTxHash } from '../../modules/validators';
import { AppConfig } from '../../utils/AppConfig';

export default function Tx({ txInfo, error }) {
  const router = useRouter();
  const handleClickRefresh = useCallback(() => {
    router.push(`/tx/${router.query.tx}`);
  }, [router]);

  async function waitForTx(txhash, confirmations = 1) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        AppConfig.publicEdenAlchemyAPI
      );
      await provider.waitForTransaction(txhash, confirmations);
    } catch (_) {
      console.log(`Couldnt connect to ethereum provider`);
      // Wait for few sec and try again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  useEffect(() => {
    if (txInfo.state !== 'mined') {
      waitForTx(router.query.tx).then(() => handleClickRefresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txInfo]);

  if (error) {
    return (
      <ErrorMsg errorMsg={`Couldn't fetch data for the tx: ${router.query.tx}`}>
        <div className="text-center pb-2">
          <div className="w-full flex items-center flex-wrap py-3">
            <div className="flex text-center my-1 sm:my-0 flex-grow justify-center pr-2">
              <button
                type="button"
                onClick={handleClickRefresh}
                className="mx-1 relative inline-flex items-center px-3 py-3 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
              >
                Refresh
                <span className="px-1">
                  <FontAwesomeIcon icon="sync" />
                </span>
              </button>
              <a
                className="button mx-1 relative inline-flex items-center px-3 py-3 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                href={`${AppConfig.etherscanEndpoint}/tx/${router.query.tx}`}
                target="_blank"
                role="button"
                rel="noreferrer"
              >
                See on Etherscan
                <span className="px-1">{EtherscanLogo}</span>
              </a>
            </div>
          </div>
        </div>
      </ErrorMsg>
    );
  }
  return (
    <Shell
      meta={
        <Meta
          title={`Tx ${txInfo.hash}`}
          description="Eden Network Explorer Transaction page"
        />
      }
    >
      <div className="max-w-5xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="flex-1 mt-4">
              <TransactionPage txInfo={txInfo} />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const txHash = context.query.tx;
  if (validateTxHash(txHash)) {
    try {
      const txInfo = await getTransactionInfo(txHash);
      if (txInfo !== null) {
        return { props: { txInfo, error: false } };
      }
    } catch (e) {
      console.error(e);
    }
  }
  return { props: { txInfo: {}, error: true } };
}
