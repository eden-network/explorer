/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';

interface TableSortLabelProps {
  active?: boolean;
  direction?: 'asc' | 'desc';
  hideSortIcon?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function TableSortLabel({
  active,
  direction,
  hideSortIcon,
  children,
  onClick,
}: TableSortLabelProps) {
  return (
    <span
      className={cx('cursor-pointer select-none', {
        'text-green': active && !hideSortIcon,
      })}
      onClick={onClick}
    >
      {children}
      {!hideSortIcon && active && direction === 'asc' && (
        <FontAwesomeIcon icon="long-arrow-alt-up" className="ml-1" />
      )}
      {!hideSortIcon && active && direction === 'desc' && (
        <FontAwesomeIcon icon="long-arrow-alt-down" className="ml-1" />
      )}
    </span>
  );
}
