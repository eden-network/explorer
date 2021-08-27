import { useCallback } from "react";

export default function Pagination({ numPages, perPage, total, activePage, setPage }: { numPages: number, perPage: number, total: number, activePage: number, setPage: (page: number) => any }) {

  const previous = useCallback(() => {
    if (activePage !== 0)
      setPage(activePage - 1);
  }, [activePage, numPages, setPage]);

  const next = useCallback(() => {
    if (activePage !== numPages - 1)
      setPage(activePage + 1)
  }, [activePage, numPages, setPage]);

  return (<div className="px-4 py-3 flex items-center justify-between sm:px-6">
    <div className="flex-1 flex justify-between sm:hidden">
      <a
        onClick={previous}
        className="relative inline-flex items-center px-4 py-2 text-sm bg-blue-light font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
      >
        Previous
      </a>
      <a
        onClick={next}
        className="ml-3 relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
      >
        Next
      </a>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-400">
          Showing <span className="font-medium">{Math.min(activePage * perPage + 1, total)}</span> to <span className="font-medium">{Math.min(activePage * perPage + perPage, total)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </p>
      </div>
      <div className="flex-1 flex justify-between sm:justify-end">
        <a
          onClick={previous}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-light hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Previous
        </a>
        <a
          onClick={next}
          className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-light hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Next
        </a>
      </div>
    </div>
  </div>);
}