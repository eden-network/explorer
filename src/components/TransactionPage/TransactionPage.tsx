import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment';
import Image from 'next/image';

import { formatAddress } from '@modules/formatter';
import { getMinerAlias } from '@modules/getters';
import { EdenLogo, EthLogo } from '@modules/icons';
import { TxInfo } from '@modules/tx-info';
import { AppConfig } from '@utils/AppConfig';

import StatusBoxes from './components/StatusBoxes';
import SubmissionBoxes from './components/SubmissionBoxes';

TimeAgo.addDefaultLocale(en);

const makeInputBox = (_input) => (
  <span className="pt-0 px-3 rounded-3xl pb-4 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-left">
    <pre
      className={cx(
        'w-screen max-w-xs w-xs md:max-w-md	md:w-md lg:max-w-xl overflow-x-auto',
        { 'p-4 pb-0': _input.indexOf(' ') < 0 }
      )}
    >
      {_input}
    </pre>
  </span>
);

const Label = ({ children, className = '' }) => (
  <td
    className={cx(
      'px-2 sm:px-6 py-4 whitespace-nowrap text-gray-300',
      className
    )}
  >
    {children}
  </td>
);

const Description = ({ children, className = '' }) => (
  <td className={cx('px-2 sm:px-6 py-4 whitespace-nowrap', className)}>
    {children}
  </td>
);

const Container = ({ children }) => <tr>{children}</tr>;

const Info = {
  Container,
  Label,
  Description,
};

export default function TransactionPage({
  txInfo,
  nextBaseFee,
}: {
  txInfo: TxInfo;
  nextBaseFee: number;
}) {
  const isMined = txInfo.state === 'mined';
  const makeAddressHyperlink = (_text, _address) => (
    <a
      href={`${AppConfig.etherscanEndpoint}/address/${_address}`}
      className="hover:text-gray-300"
      target="_blank"
      rel="noreferrer"
    >
      {_text}
    </a>
  );

  const makeTknIcon = (_url) => {
    if (_url) {
      return <Image src={_url} width={15} height={15} alt="transcation icon" />;
    }
    return <FontAwesomeIcon icon="question-circle" />;
  };
  const arrowRight = <FontAwesomeIcon icon={faLongArrowAltRight} />;

  const formatERC20Transfers = (_transfers) => {
    return _transfers.map((transfer, i) => {
      const fromAddFormatted =
        transfer.fromLabel || formatAddress(transfer.from);
      const toAddFormatted = transfer.toLabel || formatAddress(transfer.to);
      const transferKey = `Transfer#${i}`;
      return (
        <p key={transferKey} className="px-0 sm:px-0 py-2">
          {makeTknIcon(transfer.tknLogoUrl)} From:{' '}
          {makeAddressHyperlink(fromAddFormatted, transfer.from)} {arrowRight}{' '}
          To: {makeAddressHyperlink(toAddFormatted, transfer.to)} For{' '}
          {transfer.value}{' '}
          {makeAddressHyperlink(transfer.tknSymbol, transfer.tknAddress)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="pt-1 pb-3 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full">
              <tbody className="divide-y divide-blue-light">
                <Info.Container>
                  <Info.Label>Transaction Hash:</Info.Label>
                  <Info.Description>
                    <a
                      href={`${AppConfig.etherscanEndpoint}/tx/${txInfo.hash}`}
                      className="hover:text-green"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txInfo.hash}
                      <sup className="px-1">
                        <FontAwesomeIcon icon="external-link-alt" />
                      </sup>
                    </a>
                  </Info.Description>
                </Info.Container>
                {txInfo.miner && (
                  <Info.Container>
                    <Info.Label>Miner:</Info.Label>
                    <Info.Description>
                      {getMinerAlias(txInfo.miner) || txInfo.miner}
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.from && (
                  <Info.Container>
                    <Info.Label>Sender:</Info.Label>
                    <Info.Description>
                      <a
                        href={`/address/${txInfo.from}`}
                        className="hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {txInfo.from}
                        <sup className="px-1">
                          <FontAwesomeIcon icon="external-link-alt" />
                        </sup>
                      </a>
                    </Info.Description>
                  </Info.Container>
                )}

                {txInfo.to && (
                  <Info.Container>
                    <Info.Label>Recipient:</Info.Label>
                    <Info.Description>
                      <a
                        href={`/address/${txInfo.to}`}
                        className="hover:text-green"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {txInfo.contractName
                          ? `Contract: ${txInfo.contractName}`
                          : txInfo.to}
                        {txInfo.toSlot !== null
                          ? ` - SLOT #${txInfo.toSlot} DELEGATE`
                          : ''}
                        <sup className="px-1">
                          <FontAwesomeIcon icon="external-link-alt" />
                        </sup>
                      </a>
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.blockNumber && (
                  <Info.Container>
                    <Info.Label className="px-2 sm:px-6 py-1.5 whitespace-nowrap">
                      Block Number:
                    </Info.Label>
                    <Info.Description className="px-2 sm:px-6 py-1.5 whitespace-nowrap inline-flex items-center">
                      <a
                        href={`/block/${txInfo.blockNumber}?tx=${txInfo.hash}`}
                        className="hover:text-green inline-flex"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="flex items-center">
                          <span className="block">
                            {txInfo.fromEdenProducer ? EdenLogo : EthLogo}
                          </span>
                          {txInfo.blockNumber}{' '}
                          {txInfo.bundleIndex
                            ? ` - Bundle #${txInfo.bundleIndex}`
                            : ''}
                          <sup className="px-1">
                            <FontAwesomeIcon icon="external-link-alt" />
                          </sup>
                        </span>
                      </a>
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.blockNumber && (
                  <Info.Container>
                    <Info.Label>Timestamp:</Info.Label>
                    <Info.Description className="px-2 sm:px-6 py-4 whitespace-nowrap inline-flex">
                      {moment(txInfo.timestamp * 1e3).format(
                        'D MMM YYYY H:mm:ss'
                      )}
                    </Info.Description>
                  </Info.Container>
                )}
                <Info.Container>
                  <Info.Label>Submission:</Info.Label>
                  <Info.Description>
                    {txInfo.submissions.length > 0
                      ? txInfo.submissions.map((s) => SubmissionBoxes[s])
                      : SubmissionBoxes.unknown}
                  </Info.Description>
                </Info.Container>
                <Info.Container>
                  <Info.Label>Status:</Info.Label>
                  <Info.Description>
                    {txInfo.state === 'mined'
                      ? txInfo.status === 1
                        ? StatusBoxes.success
                        : StatusBoxes.fail
                      : txInfo.state === 'pending'
                      ? txInfo.pendingPools.map((p) => StatusBoxes.pending[p])
                      : StatusBoxes.indexing}
                  </Info.Description>
                </Info.Container>
                {txInfo.erc20Transfers && txInfo.erc20Transfers.length > 0 && (
                  <Info.Container>
                    <td className="px-2 sm:px-6 py-4">Transfers:</td>
                    <td className="px-2 sm:px-6 py-4">
                      {makeInputBox(
                        formatERC20Transfers(txInfo.erc20Transfers)
                      )}
                    </td>
                  </Info.Container>
                )}
                {txInfo.input && txInfo.input.length > 2 && (
                  <Info.Container>
                    <Info.Label className="px-2 sm:px-6 py-4">
                      Input:
                    </Info.Label>
                    <Info.Description className="px-2 sm:px-6 py-4">
                      {makeInputBox(txInfo.input)}
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.senderStake !== null && txInfo.senderStake > 0 && (
                  <Info.Container>
                    <Info.Label>Sender stake:</Info.Label>
                    <Info.Description>
                      {Math.round(txInfo.senderStake).toLocaleString()} EDEN{' '}
                      {txInfo.senderRank ? ` - Rank #${txInfo.senderRank}` : ''}
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.nonce && (
                  <Info.Container>
                    <Info.Label>Nonce:</Info.Label>
                    <Info.Description>
                      {txInfo.nonce.toLocaleString()}
                    </Info.Description>
                  </Info.Container>
                )}

                {isMined && (
                  <Info.Container>
                    <Info.Label>Transaction Index:</Info.Label>
                    <Info.Description>
                      {txInfo.index.toLocaleString()} of{' '}
                      {txInfo.blockTxCount.toLocaleString()} (
                      {Math.round((100 * txInfo.index) / txInfo.blockTxCount)}%
                      of txs in the block above this one)
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.priorityFee !== null ? (
                  <Info.Container>
                    <Info.Label>Priority Fee:</Info.Label>
                    <Info.Description>
                      {txInfo.priorityFee} Gwei
                    </Info.Description>
                  </Info.Container>
                ) : txInfo.gasPrice ? (
                  <Info.Container>
                    <Info.Label>Gas Price:</Info.Label>
                    <Info.Description>
                      {txInfo.gasPrice.toLocaleString()} Gwei
                    </Info.Description>
                  </Info.Container>
                ) : (
                  ''
                )}
                {txInfo.baseFee !== null ? (
                  <Info.Container>
                    <Info.Label>Base Fee:</Info.Label>
                    <Info.Description>
                      {txInfo.baseFee} Gwei{' '}
                      {nextBaseFee && txInfo.state === 'pending'
                        ? ` / Next base-fee: ${nextBaseFee.toLocaleString()} Gwei`
                        : ''}
                    </Info.Description>
                  </Info.Container>
                ) : (
                  ''
                )}
                {isMined && (
                  <Info.Container>
                    <Info.Label>Gas used:</Info.Label>
                    <Info.Description>
                      {txInfo.gasUsed.toLocaleString()} of{' '}
                      {txInfo.gasLimit.toLocaleString()} {' - '}
                      {Math.round((100 * txInfo.gasUsed) / txInfo.gasLimit)}%
                    </Info.Description>
                  </Info.Container>
                )}
                {txInfo.value > 0 && (
                  <Info.Container>
                    <Info.Label>Value:</Info.Label>
                    <Info.Description>
                      {txInfo.value.toLocaleString()} ETH
                    </Info.Description>
                  </Info.Container>
                )}
                {isMined && (
                  <Info.Container>
                    <Info.Label>Fee:</Info.Label>
                    <Info.Description>
                      {(txInfo.minerTip + txInfo.gasCost).toPrecision(2)} ETH
                      (GasCost: {txInfo.gasCost} ETH + MinerTip:{' '}
                      {txInfo.minerTip} ETH)
                    </Info.Description>
                  </Info.Container>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
