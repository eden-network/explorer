// eslint-disable-next-line import/no-extraneous-dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import { getMinerAlias } from '../modules/getters';
import { NormalizedBlockType } from '../utils/type';

const Container = ({ children }) => (
  <p className="leading-7 pr-4 xl:pr-6 line-height">{children}</p>
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
    <div className="text-small font-medium sm:flex sm:flex-wrap sm:justify-between">
      <Info.Container>
        <Info.Label>Eden Producer</Info.Label>
        <Info.Description>{isEdenBlock ? 'YES' : 'NO'}</Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Timestamp</Info.Label>
        <Info.Description>
          {moment(block.timestamp * 1000).format('ddd, DD MMM YYYY H:mm:ss A')}
        </Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Miner</Info.Label>
        <Info.Description>
          <a
            href={`/address/${block.miner}`}
            className="hover:text-green"
            target="_blank"
            rel="noreferrer"
          >
            {getMinerAlias(block.miner) || `${block.miner.slice(0, 6)}...`}{' '}
            <sup>
              <FontAwesomeIcon icon="external-link-alt" size="xs" />
            </sup>
          </a>
        </Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Base-fee</Info.Label>
        <Info.Description>{block.baseFeePerGas} Gwei</Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Label>Gas-used</Info.Label>
        <Info.Description>{block.gasUsed}</Info.Description>
      </Info.Container>
      <Info.Container>
        <Info.Description>
          <a
            href={`https://etherscan.io/block/${block.number}`}
            className="hover:text-green"
            target="_blank"
            rel="noreferrer"
          >
            See block on Etherscan{' '}
            <sup>
              <FontAwesomeIcon icon="external-link-alt" size="xs" />
            </sup>
          </a>
        </Info.Description>
      </Info.Container>
    </div>
  );
}
