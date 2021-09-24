// eslint-disable-next-line import/no-extraneous-dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import { NormalizedBlockType } from '../utils/type';

const Container = ({ children }) => (
  <p className="leading-7 pr-4 xl:pr-7 line-height">{children}</p>
);
const Label = ({ children }) => (
  <span className="pr-1 sm:text-sm text-gray-500">{children}:</span>
);
const Description = ({ children }) => (
  <span className=" text-gray-300">{children}</span>
);
const Info = { Container, Label, Description };

export default function BlockStatus({
  block,
  isEdenBlock,
}: {
  block: NormalizedBlockType;
  isEdenBlock: any;
}) {
  return (
    <div className="text-small font-medium text-gray-200 sm:flex sm:flex-wrap sm:justify-between">
      <Info.Container>
        <Info.Label>Eden Producer</Info.Label>
        <Info.Description>{isEdenBlock ? 'YES' : 'NO'}</Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Timestamp</Info.Label>
        <Info.Description>
          {moment(block.timestamp * 1000).format('ddd, DD MMM YYYY HH:mm:ss A')}
        </Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Miner</Info.Label>
        <Info.Description>
          <a
            href={`https://etherscan.io/address/${block.miner}`}
            className="hover:text-green"
            target="_blank"
            rel="noreferrer"
          >
            {block.miner.slice(0, 6)}...{' '}
            <FontAwesomeIcon icon="external-link-alt" size="xs" />
          </a>
        </Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Base-fee</Info.Label>
        <Info.Description>{block.baseFeePerGas} gwei</Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Gas-limit</Info.Label>
        <Info.Description>{block.gasLimit}</Info.Description>
      </Info.Container>
      <p className="lg:pr-1">
        <a
          href={`https://etherscan.io/block/${block.number}`}
          className=" hover:text-green"
          target="_blank"
          rel="noreferrer"
        >
          See block on Etherscan{' '}
          <FontAwesomeIcon icon="external-link-alt" size="xs" />
        </a>
      </p>
    </div>
  );
}
