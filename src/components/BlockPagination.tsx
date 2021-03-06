/* eslint-disable react/button-has-type */
import React, { useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';

import usePrevious from '../hooks/usePrevious.hook';

interface BlockPaginationProps {
  next: () => void;
  prev: () => void;
  begin: () => void;
  end: () => void;
  maxPage: number;
  currentPage: number;
  pageSize?: number;
  onChangePageSize?: (_pageSize: number) => void;
}

const PAGE_SIZE = [15, 25, 50, 100];

export default function BlockPagination({
  next,
  prev,
  begin,
  end,
  maxPage,
  currentPage,
  pageSize,
  onChangePageSize,
}: BlockPaginationProps) {
  const prevPageSize = usePrevious(pageSize);
  const prevCurrentPage = usePrevious(currentPage);

  useEffect(() => {
    if (
      typeof prevPageSize !== 'undefined' &&
      typeof prevCurrentPage !== 'undefined'
    ) {
      window.scrollTo(0, 175);
    }
  }, [prevPageSize, prevCurrentPage]);

  return (
    <div className="w-full flex items-center flex-wrap py-3">
      {onChangePageSize && (
        <select
          name="customer_data_length"
          aria-controls="customer_data"
          className="custom-select ml-3 hidden md:block bg-blue-light border-none rounded-md text-sm font-medium color-white cursor-pointer select-none mx-1 my-1 sm:my-0"
          value={pageSize}
          onChange={(e) => onChangePageSize(Number(e.target.value))}
        >
          {PAGE_SIZE.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
          <option key="all" value={Number.MAX_SAFE_INTEGER}>
            All
          </option>
        </select>
      )}
      <div
        className={cx(
          'flex text-center my-1 sm:my-0 flex-grow justify-center pr-2',
          {
            'md:pr-44': onChangePageSize,
          }
        )}
      >
        <button
          onClick={begin}
          disabled={currentPage === 1}
          className="w-14 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          First
        </button>
        <button
          onClick={prev}
          disabled={currentPage === 1}
          className="w-12 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>

        <div className="text-center px-2 py-2 bg-blue-light text-sm font-medium rounded-md sm:w-28 mx-1 sm:my-0">
          <span className="hidden sm:inline">Page</span>{' '}
          {`${currentPage} of ${maxPage}`}
        </div>
        <button
          onClick={next}
          disabled={currentPage === maxPage}
          className="w-12 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-right" />
        </button>
        <button
          onClick={end}
          disabled={currentPage === maxPage}
          className="w-14 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          End
        </button>
      </div>
    </div>
  );
}
