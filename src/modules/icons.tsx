import Image from 'next/image';

import edenLogoSvg from '../../public/eden-logo.svg';
import ethLogoSvg from '../../public/eth-logo.svg';
import etherscanLogoSvg from '../../public/etherscan-logo.svg';

export const LockClosed = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
export const LockOpen = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);
export const EthLogo = (
  <Image src={ethLogoSvg} width={20} alt="ether logo svg" />
);
export const EdenLogo = (
  <Image src={edenLogoSvg} width={20} alt="eden logo svg" />
);
export const EtherscanLogo = (
  <Image
    src={etherscanLogoSvg}
    width={14}
    height={14}
    alt="etherscan logo svg"
  />
);
