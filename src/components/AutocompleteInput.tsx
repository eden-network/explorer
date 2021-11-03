/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';

export default function AutoCompleteInput({
  label,
  pholder,
  data,
  onSelected,
  onChange,
}) {
  const [suggestions, setSugesstions] = useState([]);
  const [isHideSuggs, setIsHideSuggs] = useState(false);
  const [selectedVal, setSelectedVal] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handler = (e) => {
    setSugesstions(
      data.filter((i) => {
        let search = e.target.value;
        if (search) {
          search = search.toLowerCase();
        }
        return i.toLowerCase().startsWith(search);
      })
    );
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setIsHideSuggs(false);
    setSelectedVal(input);
    onChange(input);
  };

  const hideSuggs = (value) => {
    onSelected(value);
    setSelectedVal(value);
    setIsHideSuggs(true);
  };

  const handleClickOutside = (event) => {
    if (
      wrapperRef &&
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target)
    ) {
      setIsHideSuggs(true);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <div className="flex items-center">
        <label
          htmlFor="tag-input"
          className="text-gray-500 w-28 text-sm mr-4 flex-none"
          style={{ flex: 0 }}
        >
          {label}:
        </label>
        <div className="flex-1 relative">
          <input
            className="block w-full bg-blue-light rounded-md py-2 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:text-white focus:placeholder-gray-400 focus:ring-1 focus:ring-green focus:border-green sm:text-sm"
            placeholder={pholder}
            type="search"
            value={selectedVal}
            onChange={handleChange}
            onKeyUp={handler}
          />
          <div
            className={cx(
              'suggestions absolute bg-blue-light cursor-pointer w-100 overflow-auto max-h-64 border-rounded-sm shadow-sm w-100',
              {
                hidden: isHideSuggs,
                block: !isHideSuggs,
              }
            )}
            style={{
              zIndex: 999,
              marginTop: '10px',
              transition: 'all 0.1s ease',
              width: '100%',
            }}
          >
            {suggestions.map((item, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className="px-4 py-2 border-b-2 border-gray-500 hover:bg-gray-300 hover:text-black text-sm"
                onClick={() => {
                  hideSuggs(item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
