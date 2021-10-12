/* eslint-disable react/button-has-type */
export default function EndlessPagination({
  nextClick,
  prevClick,
}: {
  nextClick?: () => void;
  prevClick?: () => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex items-center justify-between w-full">
        <button
          onClick={prevClick}
          className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          Back
        </button>
        <button
          onClick={nextClick}
          className="w-14 py-2 mx-1 bg-blue-light text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
