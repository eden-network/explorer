/* eslint-disable react/button-has-type */
export default function EndlessPagination({
  nextClick,
  prevClick,
  page,
  total,
}: {
  page?: number;
  total?: number;
  nextClick?: () => void;
  prevClick?: () => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex items-center justify-between w-full">
        <button
          onClick={prevClick}
          className="relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Previous
        </button>
        {total && (
          <span className="text-white">
            {page + 1} of {total}
          </span>
        )}
        <button
          onClick={nextClick}
          className="ml-3 relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Next
        </button>
      </div>
    </div>
  );
}
