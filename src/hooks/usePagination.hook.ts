import { useEffect, useState } from 'react';

function usePagination(totalCount, itemsPerPage, _currentPage = 1) {
  const [currentPage, setCurrentPage] = useState(() => _currentPage);
  const maxPage = Math.ceil(totalCount / itemsPerPage);

  const next = () => {
    setCurrentPage(Math.min(currentPage + 1, maxPage));
  };

  const resetCurrentPage = () => {
    setCurrentPage(1);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [totalCount]);

  return { next, prev, begin, end, maxPage, currentPage, resetCurrentPage };
}

export default usePagination;
