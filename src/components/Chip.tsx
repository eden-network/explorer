/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';

export default function Chip({
  label,
  handleClick,
  className = '',
  closeIcon = true,
}) {
  return (
    <span
      className={cx(
        'rounded-2xl bg-blue-light text-white text-sm px-4 py-1.5 leading-3 cursor-pointer hover:bg-green-mid hover:text-black',
        className
      )}
      onClick={() => handleClick(label)}
    >
      {label}
      {closeIcon && <FontAwesomeIcon icon="times" size="sm" className="ml-1" />}
    </span>
  );
}
