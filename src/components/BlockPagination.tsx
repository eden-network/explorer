/* eslint-disable react/button-has-type */
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface BlockPaginationProps {
  next: () => void;
  prev: () => void;
  begin: () => void;
  end: () => void;
  maxPage: number;
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onChangePageSize: (_pageSize: number) => void;
}

const PAGE_SIZE = [15, 25, 50, 100, 500];

export default function BlockPagination({
  next,
  prev,
  begin,
  end,
  maxPage,
  currentPage,
  totalCount,
  pageSize,
  onChangePageSize,
}: BlockPaginationProps) {
  return (
    <div className="w-full flex items-center flex-wrap justify-between py-3 sm:w-6/12">
        <select
          name="customer_data_length"
          aria-controls="customer_data"
          className="custom-select bg-blue-light border-none rounded-md text-sm font-medium color-white cursor-pointer select-none mx-1 my-1 sm:my-0"
          value={pageSize}
          onChange={(e) => onChangePageSize(Number(e.target.value))}
        >
          {PAGE_SIZE.map((size) =>
            size === pageSize ? (
              <option key={size} value={size} selected>
                {size}
              </option>
            ) : (
              <option key={size} value={size}>
                {size}
              </option>
            )
          )}
        </select>
        <div className="flex text-center my-1 sm:my-0">
          
          <button
            onClick={begin}
            disabled={currentPage === 1}
            className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
          >
            First
          </button>
          <button
            onClick={prev}
            disabled={currentPage === 1}
            className="w-12 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
          >
            <FontAwesomeIcon icon="chevron-left" />
          </button>
          

        <div className="text-center py-2 bg-blue-light text-sm font-medium rounded-md w-28 mx-1 my-1 sm:my-0">
          {`Page ${currentPage} of ${maxPage}`}
        </div>
          <button
            onClick={next}
            disabled={currentPage === maxPage}
            className="w-12 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
          >
            <FontAwesomeIcon icon="chevron-right" />
          </button>
          <button
            onClick={end}
            disabled={currentPage === maxPage}
            className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
          >
            End
          </button>
        </div>
    </div>
  );
}
