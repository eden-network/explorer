export default function EndlessPagination({
  next,
  previous,
  nextClick,
  prevClick,
  page,
  total,
}: {
  next?: string;
  previous?: string;
  page?: number;
  total?: number;
  nextClick?: () => void;
  prevClick?: () => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex items-center justify-between w-full">
        <a
          onClick={prevClick}
          href={previous}
          className="relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Previous
        </a>
        {total && (
          <span className="text-white">
            {page + 1} of {total}
          </span>
        )}
        <a
          onClick={nextClick}
          href={next}
          className="ml-3 relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Next
        </a>
      </div>
    </div>
  );
}
