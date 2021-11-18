import { useMemo } from 'react';

// const stats = [
//   { name: 'Total Subscribers', stat: '71,897' },
//   { name: 'Avg. Open Rate', stat: '58.16%' },
//   { name: 'Avg. Click Rate', stat: '24.57%' },
// ];

const abbreviateNumber = (num: number): string => {
  const value = Math.floor(num);
  if (value >= 1000) {
    const suffixes = ['', 'k', 'M', 'B', 'T'];
    const suffixNum = Math.floor(value.toString().length / 3);
    const shortValue = Math.floor(value / 1000 ** suffixNum);
    return `${shortValue}${suffixes[suffixNum]}+`;
  }
  if (value >= 100) {
    return `${Math.floor(value / 50) * 50}+`;
  }
  if (value >= 10) {
    return `${Math.floor(value / 10) * 10}+`;
  }
  return value.toString();
};

export default function StakedDistributionSummary({
  data,
  staked,
  stakers,
  topStakedAmount,
}) {
  const stats = useMemo(() => {
    return [
      { name: 'Top', stat: abbreviateNumber(topStakedAmount) },
      { name: 'Average', stat: abbreviateNumber(staked / stakers) },
      { name: '95th %', stat: abbreviateNumber(data[95]) },
      { name: '75th %', stat: abbreviateNumber(data[75]) },
      { name: '50th %', stat: abbreviateNumber(data[50]) },
    ];
  }, [data, staked, stakers, topStakedAmount]);

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 rounded-lg bg-green overflow-hidden shadow divide-y divide-blue-light md:grid-cols-5 md:divide-y-0 md:divide-x">
        {stats.map((item) => (
          <div key={item.name} className="px-1 py-2 sm:p-3">
            <dt className="text-base font-normal text-blue-light text-center">
              {item.name}
            </dt>
            <dd className="mt-1 justify-between items-baseline md:block lg:flex w-full">
              <div className="items-baseline text-2xl font-semibold text-blue w-full text-center">
                {item.stat}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
