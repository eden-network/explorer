export default function StakerHeroStats({
  slotDelegate,
  edenStaked,
  stakerRank,
  txCount,
}: {
  slotDelegate: number;
  edenStaked: number;
  stakerRank: number;
  txCount: number;
}) {
  const fieldsLen = [slotDelegate, edenStaked, stakerRank, txCount].filter(
    (val) => val !== null
  ).length;
  return (
    <div className="mt-10 pb-12 sm:pb-16">
      <div className="relative">
        <div className="relative max-w-30xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <dl
              className={`rounded-lg bg-green sm:grid 'sm:grid-cols-2' ${`sm:grid-cols-${fieldsLen.toString()}`} text-blue shadow-lg`}
            >
              {stakerRank !== null ? (
                <div className="flex flex-col border-b border-blue p-6 text-center sm:border-0 sm:border-r">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                    Staker Rank
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-blue">
                    {stakerRank !== null ? `#${stakerRank + 1}` : '-'}
                  </dd>
                </div>
              ) : (
                ''
              )}
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  EDEN Staked
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {Math.round(edenStaked).toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Sent transactions
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {txCount.toLocaleString()}
                </dd>
              </div>
              {slotDelegate !== null ? (
                <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                    Delegate for slot
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-blue">
                    #{slotDelegate.toLocaleString()}
                  </dd>
                </div>
              ) : (
                ''
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
