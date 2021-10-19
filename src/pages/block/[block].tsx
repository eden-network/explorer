/* eslint-disable react/button-has-type */
import { useCallback, useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRouter } from 'next/router';

import etherscanLogoSvg from '../../../public/etherscan-logo.svg';
import BlockPagination from '../../components/BlockPagination';
import BlockStatus from '../../components/BlockStatus';
import ErrorMsg from '../../components/ErrorMsg';
import LabeledTransactions from '../../components/LabeledTransactions';
import toast from '../../components/Toast';
import useLocalStorage from '../../hooks/useLocalStorage.hook';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getBlockInsight } from '../../modules/eden-block-insight';
import { getLatestBlock } from '../../modules/getters';
import { stableSort, getSorting } from '../../modules/table/sort';
import { NormalizedBlockType } from '../../utils/type';

interface BlockProps {
  labeledTxs: Array<any>;
  block: NormalizedBlockType;
  isEdenBlock: string;
  isValidBlock: boolean;
  bundledTxsCallSuccess: boolean;
}

const PAGE_SIZE = 15;
const FAST_FORWARD_ICON = (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="forward-fast"
    className="svg-inline--fa fa-forward-fast"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M512 96.03v319.9c0 17.67-14.33 31.1-31.1 31.1C462.3 447.1 448 433.6 448 415.1V284.1l-171.5 156.5C255.9 457.7 224 443.3 224 415.1V284.1l-171.5 156.5C31.88 457.7 0 443.3 0 415.1V96.03c0-27.37 31.88-41.74 52.5-24.62L224 226.8V96.03c0-27.37 31.88-41.74 52.5-24.62L448 226.8V96.03c0-17.67 14.33-31.1 31.1-31.1C497.7 64.03 512 78.36 512 96.03z"
    />
  </svg>
);

export default function Block({
  labeledTxs,
  block,
  isEdenBlock,
  isValidBlock,
  bundledTxsCallSuccess,
}: BlockProps) {
  const router = useRouter();
  const [initialPageSize, setInitialPageSize] = useLocalStorage(
    'block_pagination_page_size',
    PAGE_SIZE
  );
  const {
    next,
    prev,
    begin,
    end,
    maxPage,
    currentPage,
    resetCurrentPage,
    updatePageSize,
    pageSize,
  } = usePagination(labeledTxs.length, initialPageSize, 1, setInitialPageSize);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('position');

  const handleRequestSort = (property) => {
    let newOrder = 'asc';

    if (orderBy === property && order === 'asc') {
      newOrder = 'desc';
    }
    setOrder(newOrder);
    setOrderBy(property);
    resetCurrentPage();
  };

  const parsedTxs = labeledTxs.map((v) => {
    return {
      ...v,
      parsedMaxPriorityFee: parseFloat(v.maxPriorityFee),
    };
  });

  const sortedRows = stableSort(parsedTxs, getSorting(order, orderBy));
  const currentTxs = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClickFastForward = useCallback(() => {
    router.push(`/block/latest`);
  }, [router]);

  const handleClickRefresh = useCallback(() => {
    router.push(`/block/${block.number ?? router.query.block}`);
  }, [router, block]);

  const handleClickPrev = useCallback(() => {
    router.push(`/block/${block.number - 1}`);
  }, [router, block]);

  const handleClickNext = useCallback(() => {
    router.push(`/block/${block.number + 1}`);
  }, [router, block]);

  const notify = useCallback((type, message) => {
    toast({ type, message });
  }, []);

  useEffect(() => {
    if (!bundledTxsCallSuccess) {
      notify(
        'error',
        'Unable to retrieve Flashbot bundles, please try again in a few minutes!'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  if (!isValidBlock) {
    return (
      <ErrorMsg
        errorMsg={`Couldn't fetch data for the block: ${router.query.block}`}
      >
        <div className="text-center pb-2">
          <div className="w-full flex items-center flex-wrap py-3">
            <div className="flex text-center my-1 sm:my-0 flex-grow justify-center pr-2">
              <button
                onClick={handleClickFastForward}
                className="mx-1 relative inline-flex items-center px-3 py-3 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
              >
                See latest block
              </button>
              <button
                onClick={handleClickRefresh}
                className="mx-1 relative inline-flex items-center px-3 py-3 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
              >
                <FontAwesomeIcon icon="sync" />
              </button>
              <a
                className="button mx-1 relative inline-flex items-center px-3 py-3 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                href={`https://etherscan.io/block/${
                  block.number || router.query.block
                }`}
                target="_blank"
                role="button"
                rel="noreferrer"
              >
                <Image src={etherscanLogoSvg} width={20} height={20} />
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
          title={`Block ${block.number}`}
          description="Eden Network Explorer Block Page"
        />
      }
    >
      <div className="px-0 sm:px-4 max-w-full mx-auto grid gap-5 ">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
            <div className="p-0 sm:px-3 xl:flex xl:justify-between xl:flex-wrap items-center">
              <div className="lg:mr-8">
                <a
                  role="button"
                  onClick={handleClickPrev}
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-0 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  <FontAwesomeIcon icon="chevron-left" />
                </a>
                <span className="ml-0 relative inline-flex font-bold py-2 px-4">
                  {block.number}
                </span>
                <a
                  role="button"
                  onClick={handleClickNext}
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-0 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  <FontAwesomeIcon icon="chevron-right" />
                </a>
                <a
                  role="button"
                  onClick={handleClickFastForward}
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-3 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  {FAST_FORWARD_ICON}
                </a>
                <a
                  role="button"
                  onClick={handleClickRefresh}
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-3 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  <FontAwesomeIcon icon="sync" />
                </a>
                <a
                  role="button"
                  href={`https://etherscan.io/block/${block.number}`}
                  target="_blank"
                  rel="noreferrer"
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-3 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  <Image src={etherscanLogoSvg} width={14} height={14} />
                </a>
              </div>
              <BlockStatus block={block} isEdenBlock={isEdenBlock} />
            </div>
            <div className="flex-1 mt-4">
              <LabeledTransactions
                labeledTxs={currentTxs}
                handleRequestSort={handleRequestSort}
                orderBy={orderBy}
                order={order}
              />
            </div>
            <BlockPagination
              prev={prev}
              next={next}
              end={end}
              begin={begin}
              maxPage={maxPage}
              pageSize={pageSize}
              onChangePageSize={updatePageSize}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

const normailizeBlockInfo = (block): NormalizedBlockType => {
  return {
    baseFeePerGas: block.baseFeePerGas.toString(),
    gasUsed: block.gasUsed.toLocaleString(),
    timestamp: block.timestamp,
    number: block.number,
    miner: block.miner,
  };
};

export async function getServerSideProps(context) {
  if (context.query.block === 'latest') {
    const latestBlock = await getLatestBlock();
    return {
      props: {},
      redirect: {
        destination: `/block/${latestBlock}`,
        permanent: false,
      },
    };
  }
  const blockNum = Number.parseInt(context.query.block, 10);
  try {
    const blockInsight = await getBlockInsight(blockNum);
    return {
      props: {
        bundledTxsCallSuccess: blockInsight.bundledTxsCallSuccess,
        isEdenBlock: blockInsight.fromEdenProducer,
        block: normailizeBlockInfo(blockInsight),
        labeledTxs: blockInsight.transactions,
        isValidBlock: true,
      },
    };
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
    return {
      props: {
        block: { number: blockNum },
        isValidBlock: false,
        isEdenBlock: false,
        labeledTxs: [],
        bundledTxsCallSuccess: false,
      },
    };
  }
}
