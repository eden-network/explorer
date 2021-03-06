/* eslint-disable jsx-a11y/label-has-associated-control */
import { useCallback } from 'react';

import cx from 'classnames';

interface SearchProps {
  value: string;
  prompt: string;
  error?: boolean;
  handleChange: (value) => void;
  handleKeyDown?: (event) => void;
}

export default function Search({
  prompt,
  value,
  error,
  handleChange,
  handleKeyDown,
}: SearchProps) {
  const onChange = useCallback(
    (event) => {
      handleChange(event.target.value);
    },
    [handleChange]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (handleKeyDown) {
        handleKeyDown(event);
      }
    },
    [handleKeyDown]
  );

  return (
    <div className="w-full">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          id="search"
          name="search"
          value={value}
          className={cx(
            'block w-full bg-blue-light rounded-md py-2 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:text-white focus:placeholder-gray-400 focus:ring-1 focus:ring-green focus:border-green sm:text-sm',
            {
              ' text-red focus:text-red border-red focus:border-red focus:ring-red':
                error,
            }
          )}
          placeholder={prompt}
          type="search"
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
