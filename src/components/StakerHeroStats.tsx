export default function StakerHeroStats({
  edenTxCount,
  edenStaked,
  allTxCount,
  stakerRank,
}: {
  edenTxCount: number;
  edenStaked: number;
  allTxCount: number;
  stakerRank: number;
}) {
  return (
    <div className="mt-10 pb-12 sm:pb-16">
      <div className="relative">
        <div className="relative max-w-30xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <dl className="rounded-lg bg-green sm:grid sm:grid-cols-4 text-blue shadow-lg">
              <div className="flex flex-col border-b border-blue p-6 text-center sm:border-0 sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Rank
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {stakerRank !== -1 ? `#${stakerRank + 1}` : '∞'}
                </dd>
              </div>
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
                  Sent txs in EDEN blocks
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {edenTxCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Proportion of sent txs in EDEN blocks
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {allTxCount === 1e4 ? '+' : ''}
                  {Math.round((edenTxCount / (allTxCount || 1)) * 100)}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
