/* eslint-disable react/button-has-type */
import { useCallback, useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';

import BlockPagination from '../../components/BlockPagination';
import BlockStatus from '../../components/BlockStatus';
import ErrorMsg from '../../components/ErrorMsg';
import LabeledTransactions from '../../components/LabeledTransactions';
import toast from '../../components/Toast';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getBlockInsightAndCache } from '../../modules/eden-block-insight';
import { stableSort, getSorting } from '../../modules/table/sort';
import { NormalizedBlockType } from '../../utils/type';

const PAGE_SIZE = 15;

interface BlockProps {
  labeledTxs: Array<any>;
  block: NormalizedBlockType;
  isEdenBlock: string;
  isValidBlock: boolean;
  bundledTxsCallSuccess: boolean;
}

export default function Block({
  labeledTxs,
  block,
  isEdenBlock,
  isValidBlock,
  bundledTxsCallSuccess,
}: BlockProps) {
  const router = useRouter();
  const { next, prev, begin, end, maxPage, currentPage, resetCurrentPage } =
    usePagination(labeledTxs.length, PAGE_SIZE);
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
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
      notify('error', 'Flashbots API is not available!');
    }
  }, [notify, block, bundledTxsCallSuccess]);

  if (!isValidBlock) {
    return (
      <ErrorMsg errorMsg="Couldn't fetch data for the block">
        <div className="text-center pb-2">
          <a
            href={`https://etherscan.io/block/${block.number}`}
            target="_blank"
            className="text-green"
            rel="noreferrer"
          >
            View block on Etherscan
          </a>
          <div className="pb-4 my-10">
            <button
              onClick={handleClickPrev}
              className="mx-3 relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
            >
              Previous
            </button>
            <span className="text-white">{block.number}</span>
            <button
              onClick={handleClickNext}
              className="mx-3 relative inline-flex items-center px-6 py-2 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
            >
              Next
            </button>
          </div>
        </div>
      </ErrorMsg>
    );
  }

  return (
    <Shell
      meta={
        <Meta title="Block" description="Eden Network Explorer Block Page" />
      }
    >
      <div className="px-0 sm:px-4 max-w-full mx-auto grid gap-5 ">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
            <div className="p-0 sm:px-2 xl:flex xl:justify-between xl:flex-wrap items-center">
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
              </div>
              <BlockStatus block={block} isEdenBlock={isEdenBlock} />
            </div>
            <div className="flex-1 mt-4">
              <LabeledTransactions
                labeledTxs={currentTxs}
                miner={block.miner}
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
  const blockNum = Number.parseInt(context.query.block, 10);
  try {
    const blockInsight = await getBlockInsightAndCache(blockNum);
    return {
      props: {
        isEdenBlock: blockInsight.fromEdenProducer,
        block: normailizeBlockInfo(blockInsight),
        labeledTxs: blockInsight.transactions,
        isValidBlock: true,
        bundledTxsCallSuccess: blockInsight.bundledTxsCallSuccess,
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
