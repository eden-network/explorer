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
}

export default function BlockPagination({
  next,
  prev,
  begin,
  end,
  maxPage,
  currentPage,
}: BlockPaginationProps) {
  return (
    <div className="w-full flex items-center">
      <div className="py-3 flex mx-auto">
        <button
          onClick={begin}
          disabled={currentPage === 1}
          className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none disabled:opacity-50 disabled:bg-blue-light disabled:text-white"
        >
          First
        </button>
        <button
          onClick={prev}
          disabled={currentPage === 1}
          className="w-12 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none disabled:opacity-50 disabled:bg-blue-light disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>
        <p className="w-14 text-center py-2 mx-1 bg-blue-light text-sm font-medium rounded-md sm:w-28 sm:mx-2">
          <span className="hidden sm:inline-flex">Page</span> {currentPage} of{' '}
          {maxPage}
        </p>
        <button
          onClick={next}
          disabled={currentPage === maxPage}
          className="w-12 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none disabled:opacity-50 disabled:bg-blue-light disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-right" />
        </button>
        <button
          onClick={end}
          disabled={currentPage === maxPage}
          className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none disabled:opacity-50 disabled:bg-blue-light disabled:text-white"
        >
          End
        </button>
      </div>
    </div>
  );
}
