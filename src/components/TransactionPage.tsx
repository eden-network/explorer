import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment';
import Image from 'next/image';

import { formatAddress } from '../modules/formatter';
import { clockSVG, tickSVG, EdenLogo, EthLogo } from '../modules/icons';
import { TxInfo } from '../modules/tx-info';
import { AppConfig } from '../utils/AppConfig';

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

const submissionBoxes = {
  flashbots: (
    <span className="m-1 p-3 rounded-3xl py-2 bg-purple inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Flashbots
    </span>
  ),
  eden: (
    <span className="m-1 p-3 rounded-3xl py-2 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Eden
    </span>
  ),
  ethermine: (
    <span className="m-1 p-3 rounded-3xl py-2 bg-orange inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Ethermine
    </span>
  ),
  unknown: (
    <span className="p-3 rounded-3xl py-2 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      Unknown
    </span>
  ),
};

const statusBoxes = {
  success: (
    <span className="p-3 rounded-3xl py-2 bg-green inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {tickSVG} SUCCESS
    </span>
  ),
  fail: (
    <span className="p-3 rounded-3xl py-2 bg-red inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      <FontAwesomeIcon icon="exclamation-circle" /> FAIL
    </span>
  ),
  indexing: (
    <span className="p-3 rounded-3xl py-2 bg-white inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
      {clockSVG} INDEXING
    </span>
  ),
  pending: {
    public: (
      <span className="m-1 p-3 rounded-3xl py-2 bg-yellow inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN PUBLIC MEMPOOL
      </span>
    ),
    eden: (
      <span className="m-1 p-3 rounded-3xl py-2 bg-purple inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN EDEN MEMPOOL
      </span>
    ),
    ethermine: (
      <span className="m-1 p-3 rounded-3xl py-2 bg-orange inline-block text-xs text-bold text-blue-light shadow-sm font-bold text-center">
        {clockSVG} PENDING IN ETHERMINE MEMPOOL
      </span>
    ),
  },
};

export default function TransactionPage({ txInfo }: { txInfo: TxInfo }) {
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
      return <Image src={_url} width={15} height={15} />;
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
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="min-w-full">
              <tbody className="divide-y divide-blue-light">
                <tr key="Transaction Hash">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Transaction Hash:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
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
                  </td>
                </tr>
                {txInfo.from ? (
                  <tr key="From">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Sender:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
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
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.to ? (
                  <tr key="To">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Recipient:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
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
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.blockNumber ? (
                  <tr key="Block Number">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Block Number:
                    </td>
                    <td className="px-2 sm:px-6 py-2 whitespace-nowrap inline-flex items-center">
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
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.blockNumber ? (
                  <tr key="Timestamp">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Timestamp:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap inline-flex">
                      {moment(txInfo.timestamp * 1e3).format(
                        'D MMM YYYY H:mm:ss'
                      )}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                <tr key="Submission">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Submission:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.submissions.length > 0
                      ? txInfo.submissions.map((s) => submissionBoxes[s])
                      : submissionBoxes.unknown}
                  </td>
                </tr>
                <tr key="Status">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    Status:
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    {txInfo.state === 'mined'
                      ? txInfo.status === 1
                        ? statusBoxes.success
                        : statusBoxes.fail
                      : txInfo.state === 'pending'
                      ? txInfo.pendingPools.map((p) => statusBoxes.pending[p])
                      : statusBoxes.indexing}
                  </td>
                </tr>
                {txInfo.erc20Transfers && txInfo.erc20Transfers.length > 0 ? (
                  <tr key="Transfers">
                    <td className="px-2 sm:px-6 py-4">Transfers:</td>
                    <td className="px-2 sm:px-6 py-4">
                      {makeInputBox(
                        formatERC20Transfers(txInfo.erc20Transfers)
                      )}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.input && txInfo.input.length > 2 ? (
                  <tr key="Input">
                    <td className="px-2 sm:px-6 py-4">Input:</td>
                    <td className="px-2 sm:px-6 py-4">
                      {makeInputBox(txInfo.input)}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.senderStake !== null && txInfo.senderStake > 0 ? (
                  <tr key="Sender stake">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Sender stake:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {Math.round(txInfo.senderStake).toLocaleString()} EDEN{' '}
                      {txInfo.senderRank ? ` - Rank #${txInfo.senderRank}` : ''}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.nonce ? (
                  <tr key="Nonce">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Nonce:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.nonce.toLocaleString()}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.state === 'mined' ? (
                  <tr key="Transaction index">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Transaction index:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.index.toLocaleString()} of{' '}
                      {txInfo.blockTxCount.toLocaleString()} (
                      {Math.round((100 * txInfo.index) / txInfo.blockTxCount)}%
                      of txs in the block above this one)
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.priorityFee !== null ? (
                  <tr key="Priority fee">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Priority Fee:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.priorityFee} Gwei
                    </td>
                  </tr>
                ) : txInfo.gasPrice ? (
                  <tr key="Gas Price">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Gas Price:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.gasPrice.toLocaleString()} Gwei
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.baseFee !== null ? (
                  <tr key="Base fee">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Base Fee:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.baseFee} Gwei{' '}
                      {txInfo.nextBaseFee
                        ? ` / Next base-fee: ${txInfo.nextBaseFee.toLocaleString()} Gwei`
                        : ''}
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.state === 'mined' ? (
                  <tr key="Gas used">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Gas used:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.gasUsed.toLocaleString()} of{' '}
                      {txInfo.gasLimit.toLocaleString()} {' - '}
                      {Math.round((100 * txInfo.gasUsed) / txInfo.gasLimit)}%
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.value > 0 ? (
                  <tr key="Value">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Value:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {txInfo.value.toLocaleString()} ETH
                    </td>
                  </tr>
                ) : (
                  ''
                )}
                {txInfo.state === 'mined' ? (
                  <tr key="Fee">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      Fee:
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      {(txInfo.minerTip + txInfo.gasCost).toPrecision(2)} ETH
                      (GasCost: {txInfo.gasCost} ETH + MinerTip:{' '}
                      {txInfo.minerTip} ETH)
                    </td>
                  </tr>
                ) : (
                  ''
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
