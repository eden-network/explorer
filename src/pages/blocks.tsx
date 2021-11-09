/* eslint-disable react/button-has-type */
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';

import AutoCompleteInput from '../components/AutocompleteInput';
import Blocks from '../components/Blocks';
import Chip from '../components/Chip';
import EndlessPagination from '../components/EndlessPagination';
import useLocalStorage from '../hooks/useLocalStorage.hook';
import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';
import { getBlockInsightAndCache } from '../modules/eden-block-insight';
import { getBlocksPaged } from '../modules/getters';
import { AppConfig } from '../utils/AppConfig';

const { minerAlias } = AppConfig;

const PER_PAGE = 10;

const MINERS = Object.values(minerAlias);

const LocalStorageKey = 'block-list-miner-filters';

export default function BlocksPage({ blocks }) {
  const router = useRouter();
  const [beforeEpoch, setbeforeEpoch] = useState(() => {
    return router.query.beforeEpoch ?? new Date().getTime() / 1e3;
  });

  const [miners, setMiners] = useLocalStorage(LocalStorageKey, []);
  const [inputValue, setInputValue] = useState('');
  const [selectedVal, setSelectedVal] = useState('');

  const handleChangeSelectedVal = (v) => {
    setSelectedVal(v);
  };

  const getMinerArry = () => {
    const addressArray = new Set<string>();
    miners.forEach((miner) => {
      let isAddrInList = false;
      Object.keys(minerAlias).forEach((key) => {
        if (minerAlias[key] === miner) {
          addressArray.add(key);
          isAddrInList = true;
        }
      });
      if (!isAddrInList) {
        addressArray.add(miner);
      }
    });
    return Array.from(addressArray);
  };

  const getMinerQueryString = () => {
    let res = '';
    getMinerArry().forEach((v) => {
      res += `&miner=${v}`;
    });
    return res;
  };

  const updateQuery = ({
    epoch = router.query.beforeEpoch,
    pageNum = null,
  }: {
    epoch?: string | string[] | undefined | number | null;
    pageNum?: number | undefined | null;
  }) => {
    let url = `/blocks`;
    let firstSignedOff = false;
    if (epoch) {
      url = url.concat(`?beforeEpoch=${epoch}`);
      firstSignedOff = true;
    }
    if (pageNum) {
      if (!firstSignedOff) {
        firstSignedOff = true;
        url = url.concat(`?p=${pageNum}`);
      } else {
        url = url.concat(`&p=${pageNum}`);
      }
    }
    if (miners.length > 0 && !firstSignedOff) url = url.concat('?');
    url = url.concat(getMinerQueryString());

    router.push(url, null, { scroll: false });
  };

  useEffect(() => {
    updateQuery({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miners]);

  const reset = () => {
    updateQuery({});
  };

  const nextClick = () => {
    updateQuery({
      pageNum: router.query.p === undefined ? 2 : Number(router.query.p) + 1,
    });
  };

  const prevClick = () => {
    updateQuery({
      pageNum: router.query.p === undefined ? 1 : Number(router.query.p) - 1,
    });
  };

  const handleChangeDate = (date) => {
    const epoch = Math.ceil(date.getTime() / 1e3);
    updateQuery({ epoch });
    setbeforeEpoch(epoch);
  };

  const handleInputChangeRaw = (e) => {
    const date = moment(e.target.value, 'MMMM d, yyyy h:mm aa');

    if (date.isValid()) {
      handleChangeDate(date);
    }
  };

  const selectedTime = useMemo(
    () => new Date(Number(beforeEpoch) * 1000),
    [beforeEpoch]
  );

  const handleResetBeforeEpoch = useCallback(() => {
    updateQuery({});
    setbeforeEpoch(new Date().getTime() / 1e3);
  }, [router]);

  const addMiner = (value) => {
    setSelectedVal('');
    setInputValue('');
    const minerAddresses = getMinerArry();
    if (value && value.trim().length > 0) {
      if (!miners.includes(value) && !minerAddresses.includes(value)) {
        setMiners([...miners, value]);
      }
    }
  };

  const getSelectedVal = (value) => {
    setInputValue(value);
    addMiner(value);
  };

  const getChanges = (value) => {
    setInputValue(value);
  };

  const removeMiner = (value) => {
    const res = miners.filter((v) => v !== value);
    setMiners(res);
  };

  const handleResetMiners = () => {
    setMiners([]);
  };

  const handleClickSearch = () => {
    addMiner(inputValue);
  };

  return (
    <Shell
      meta={
        <Meta
          title="Block List"
          description="Eden Network Explorer Block List Page"
        />
      }
    >
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="p-3 flex-1 sm:p-6 flex flex-col justify-between">
            <div className="w-100 grid sm:grid-cols-2 gap-4 px-2">
              <div className="flex items-center">
                <AutoCompleteInput
                  label="Miner"
                  handleChangeSelectedVal={handleChangeSelectedVal}
                  selectedVal={selectedVal}
                  className="flex-1"
                  pholder="Search by miner label or address..."
                  data={MINERS}
                  onSelected={getSelectedVal}
                  onChange={getChanges}
                  handleEnterKeyDown={() => {
                    addMiner(inputValue);
                  }}
                />
                <button
                  onClick={handleClickSearch}
                  className="ml-1 px-2 py-1 text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
                >
                  <FontAwesomeIcon icon="search" />
                </button>
              </div>
              <div className="flex items-center md:ml-auto">
                <p className="text-gray-500 text-sm mr-3">Before:</p>
                <DatePicker
                  selected={selectedTime}
                  onChange={handleChangeDate}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  onChangeRaw={handleInputChangeRaw}
                />
                <button
                  onClick={handleResetBeforeEpoch}
                  className="ml-1 px-2 py-1 text-sm font-medium rounded-md betterhover:hover:bg-green betterhover:hover:text-blue cursor-pointer select-none betterhover:disabled:opacity-50 betterhover:disabled:bg-blue-light betterhover:disabled:text-white"
                >
                  <FontAwesomeIcon icon="sync" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              {miners.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  className="mr-2 mt-2"
                  closeIcon
                  handleClick={removeMiner}
                />
              ))}
              {miners.length > 0 && (
                <Chip label="Clear All" handleClick={handleResetMiners} />
              )}
            </div>
            <div className="flex-1 mt-4">
              <Blocks blocks={blocks} />
            </div>
            <EndlessPagination
              end={blocks.length < PER_PAGE}
              currentPage={router.query.p ? Number(router.query.p) : 1}
              nextClick={nextClick}
              prevClick={prevClick}
              reset={reset}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const page = context.query.p ?? 1;
  const beforeEpoch = context.query.beforeEpoch || null;
  try {
    const skip = (page - 1) * PER_PAGE;
    const blocks = await getBlocksPaged({
      fromActiveProducerOnly: true,
      beforeTimestamp: beforeEpoch,
      num: PER_PAGE,
      start: skip,
    });
    const blocksWithInsight = await Promise.all(
      blocks.map(async (block) => {
        try {
          const blockInsight = await getBlockInsightAndCache(block.number);
          return {
            bundledTxs: blockInsight.transactions.filter(
              (tx) => tx.bundleIndex !== null
            ).length,
            stakerTxs: blockInsight.transactions.filter(
              (tx) => tx.senderStake >= 100
            ).length,
            slotTxs: blockInsight.transactions.filter(
              (tx) => tx.toSlot !== false
            ).length,
            bundledTxsCallSuccess: blockInsight.bundledTxsCallSuccess,
            timestamp: block.timestamp,
            author: block.author,
            number: block.number,
          };
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
          return block;
        }
      })
    );
    return {
      props: {
        blocks: blocksWithInsight,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        blocks: [],
      },
    };
  }
}
