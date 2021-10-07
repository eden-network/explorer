import { useState } from 'react';

function usePagination(totalCount, itemsPerPage, initialPage) {
  const [currentPage, setCurrentPage] = useState(() => initialPage);
  const maxPage = Math.max(Math.ceil(totalCount / itemsPerPage), 1);

  const next = () => {
    setCurrentPage(Math.min(currentPage + 1, maxPage));
  };

  const prev = () => {
    setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const begin = () => {
    setCurrentPage(Math.min(1, maxPage));
  };

  const end = () => {
    setCurrentPage(maxPage);
  };

  return {
    setCurrentPage,
    currentPage,
    maxPage,
    begin,
    next,
    prev,
    end,
  };
}

export default usePagination;
