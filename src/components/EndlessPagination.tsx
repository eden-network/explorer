export default function EndlessPagination({
  next,
  previous,
}: {
  next: string;
  previous: string;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <a
          href={previous}
          className="relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Previous
        </a>
        <a
          href={next}
          className="ml-3 relative inline-flex items-center px-4 py-2 bg-blue-light text-sm font-medium rounded-md hover:bg-green hover:text-blue cursor-pointer select-none"
        >
          Next
        </a>
      </div>
    </div>
  );
}
