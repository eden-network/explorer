import { useEffect, useState } from 'react';

function usePagination(
  totalCount,
  itemsPerPage,
  initialPage = 1,
  updateLocalStoragePageSize = null
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [maxPage, setMaxPage] = useState(Math.ceil(totalCount / itemsPerPage));
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const updatePageSize = (_pageSize) => {
    const currentInd = (currentPage - 1) * pageSize;
    const newPageNum = Math.floor(currentInd / _pageSize) + 1;
    setMaxPage(Math.ceil(totalCount / _pageSize));
    setCurrentPage(newPageNum);
    setPageSize(_pageSize);
    if (updateLocalStoragePageSize) {
      updateLocalStoragePageSize(_pageSize);
    }
  };

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
    setCurrentPage(initialPage);
  }, [totalCount, initialPage]);

  return {
    next,
    prev,
    begin,
    end,
    maxPage,
    currentPage,
    pageSize,
    resetCurrentPage,
    updatePageSize,
  };
}

export default usePagination;
