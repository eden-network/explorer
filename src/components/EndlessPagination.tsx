/* eslint-disable react/button-has-type */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function EndlessPagination({
  nextClick,
  prevClick,
  reset,
  currentPage,
  end,
}: {
  nextClick: () => void;
  prevClick: () => void;
  reset: () => void;
  currentPage: number;
  end: boolean;
}) {
  return (
    <div className="w-full flex items-center flex-wrap py-3">
      <div className="flex text-center my-1 sm:my-0 flex-grow justify-center pr-2">
        <button
          onClick={reset}
          disabled={currentPage === 1}
          className="w-14 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          First
        </button>
        <button
          onClick={prevClick}
          disabled={currentPage === 1}
          className="w-12 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>

        <div className="text-center px-2 py-2 bg-blue-light text-sm font-medium rounded-md sm:w-28 mx-1 sm:my-0">
          <span className="hidden sm:inline">Page</span> {`${currentPage}`}
        </div>
        <button
          onClick={nextClick}
          disabled={end}
          className="w-12 mx-1 py-0 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          <FontAwesomeIcon icon="chevron-right" />
        </button>
      </div>
    </div>
  );
}
