import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

import edenLogoSvg from '../../public/eden-logo.svg';
import ethLogoSvg from '../../public/eth-logo.svg';
import etherscanLogoSvg from '../../public/etherscan-logo.svg';

export const LockClosed = <FontAwesomeIcon icon="low-vision" />;

export const LockOpen = <FontAwesomeIcon icon="eye" />;

export const tickSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 display: inline"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
export const crossSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 display: inline"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
export const clockSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 display: inline"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
export const EthLogo = <Image src={ethLogoSvg} width={20} />;
export const EdenLogo = <Image src={edenLogoSvg} width={20} />;
export const EtherscanLogo = (
  <Image
    src={etherscanLogoSvg}
    width={14}
    height={14}
    alt="etherscan logo svg"
  />
);
