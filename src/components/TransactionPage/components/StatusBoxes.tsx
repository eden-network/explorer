import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { tickSVG, clockSVG } from '@modules/icons';

const StatusBoxes = {
  success: (
    <span className="p-4 rounded-3xl py-2.5 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {tickSVG} SUCCESS
    </span>
  ),
  fail: (
    <span className="p-4 rounded-3xl py-2.5 bg-red inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      <FontAwesomeIcon icon="exclamation-circle" /> FAIL
    </span>
  ),
  indexing: (
    <span className="p-4 rounded-3xl py-2.5 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {clockSVG} INDEXING
    </span>
  ),
  pending: {
    public: (
      <span className="m-1 p-4 rounded-3xl py-2.5 bg-yellow inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN PUBLIC MEMPOOL
      </span>
    ),
    eden: (
      <span className="m-1 p-4 rounded-3xl py-2.5 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN EDEN MEMPOOL
      </span>
    ),
    ethermine: (
      <span className="m-1 p-4 rounded-3xl py-2.5 bg-orange inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN ETHERMINE MEMPOOL
      </span>
    ),
    flashbots: (
      <span className="m-1 p-4 rounded-3xl py-2.5 bg-purple inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN FLASHBOTS MEMPOOL
      </span>
    ),
  },
};

export default StatusBoxes;
