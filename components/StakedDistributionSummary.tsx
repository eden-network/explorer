import { useMemo } from "react";

const stats = [
  { name: 'Total Subscribers', stat: '71,897' },
  { name: 'Avg. Open Rate', stat: '58.16%' },
  { name: 'Avg. Click Rate', stat: '24.57%' },
]

export default function StakedDistributionSummary({ data, staked, stakers, topStakedAmount }) {
  const stats = useMemo(() => {
    return [
      { name: 'Top', stat: Math.floor(topStakedAmount).toLocaleString() },
      { name: 'Average', stat: Math.floor(staked / stakers).toLocaleString() },
      { name: '95th %', stat: Math.floor(data[95]).toLocaleString() },
      { name: '75th %', stat: Math.floor(data[75]).toLocaleString() },
      { name: '50th %', stat: Math.floor(data[50]).toLocaleString() }
    ]
  }, [data, staked, stakers, topStakedAmount]);

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 rounded-lg bg-green overflow-hidden shadow divide-y divide-blue-light md:grid-cols-5 md:divide-y-0 md:divide-x">
        {stats.map((item) => (
          <div key={item.name} className="px-1 py-2 sm:p-3">
            <dt className="text-base font-normal text-blue-light">{item.name}</dt>
            <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-blue">
                {item.stat}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}