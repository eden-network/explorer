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
  const { length } = label;
  const formatedLabel =
    label.length > 40
      ? `${label.slice(0, 6)}...${label.slice(length - 4, length)}`
      : label;
  return (
    <span
      className={cx(
        'rounded-2xl bg-blue-light text-white text-sm inline-block px-4 py-2.5 mb-1.5 leading-3 cursor-pointer hover:bg-green-mid hover:text-black',
        className
      )}
      onClick={() => handleClick(label)}
    >
      {formatedLabel}
      {closeIcon && <FontAwesomeIcon icon="times" size="sm" className="ml-1" />}
    </span>
  );
}
