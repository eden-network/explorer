/* eslint-disable react/button-has-type */
import { useCallback, useState } from 'react';

import type { Block as _BlockType } from '@ethersproject/abstract-provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';

import BlockPagination from '../../components/BlockPagination';
import BlockStatus from '../../components/BlockStatus';
import ErrorMsg from '../../components/ErrorMsg';
import LabeledTransactions from '../../components/LabeledTransactions';
import usePagination from '../../hooks/usePagination.hook';
import { Meta } from '../../layout/Meta';
import Shell from '../../layout/Shell';
import { getBlockInsightAndCache } from '../../modules/eden-block-insight';
import {
  provider,
  isEdenBlock as checkIfEdenBlock,
} from '../../modules/getters';
import { stableSort, getSorting } from '../../modules/table/sort';
import { NormalizedBlockType } from '../../utils/type';

const PAGE_SIZE = 15;

interface BlockProps {
  labeledTxs: Array<any>;
  block: NormalizedBlockType;
  isEdenBlock: string;
  isValidBlock: boolean;
}

export default function Block({
  labeledTxs,
  block,
  isEdenBlock,
  isValidBlock,
}: BlockProps) {
  const router = useRouter();
  const { next, prev, begin, end, maxPage, currentPage } = usePagination(
    labeledTxs.length,
    PAGE_SIZE
  );
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('position');

  const handleRequestSort = (property) => {
    let newOrder = 'asc';

    if (orderBy === property && order === 'asc') {
      newOrder = 'desc';
    }
    setOrder(newOrder);
    setOrderBy(property);
  };

  const sortedRows = stableSort(labeledTxs, getSorting(order, orderBy));
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

  if (!isValidBlock) {
    return (
      <ErrorMsg errorMsg="">
        <div className="text-center pb-2">
          <div className="pb-4">
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
          <a
            href={`https://etherscan.io/block/${block.number}`}
            target="_blank"
            className="text-green"
            rel="noreferrer"
          >
            View on Etherscan
          </a>
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
                <span className="ml-3 relative inline-flex font-bold py-2 px-4">
                  {block.number}
                </span>
                <a
                  role="button"
                  onClick={handleClickNext}
                  onKeyDown={null}
                  tabIndex={0}
                  className="ml-3 relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-light betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none"
                >
                  <FontAwesomeIcon icon="chevron-right" />
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
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

const normailizeBlockInfo = (block: _BlockType): NormalizedBlockType => {
  return {
    number: block.number,
    timestamp: block.timestamp,
    miner: block.miner,
    baseFeePerGas: block.baseFeePerGas.toString(),
    gasLimit: block.gasLimit.toString(),
  };
};

export async function getServerSideProps(context) {
  const blockNum = Number.parseInt(context.query.block, 10);
  try {
    const [labeledTxs, block, isEdenBlock] = await Promise.all([
      getBlockInsightAndCache(blockNum),
      provider.getBlock(blockNum),
      checkIfEdenBlock(blockNum),
    ]);
    return {
      props: {
        labeledTxs,
        block: normailizeBlockInfo(block),
        isEdenBlock,
        isValidBlock: true,
      },
    };
  } catch (e) {
    return {
      props: {
        labeledTxs: [],
        block: { number: blockNum },
        isEdenBlock: false,
        isValidBlock: false,
      },
    };
  }
}
