export default function StakerHeroStats({
  rank,
  outOf,
  staked,
}: {
  rank: number;
  outOf: number;
  staked: number;
}) {
  return (
    <div className="mt-10 pb-12 sm:pb-16">
      <div className="relative">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <dl className="rounded-lg bg-green shadow-lg sm:grid sm:grid-cols-2 text-blue shadow-lg">
              <div className="flex flex-col border-b border-blue p-6 text-center sm:border-0 sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Rank
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  #{rank + 1} / {outOf}
                </dd>
              </div>
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  EDEN Staked
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {staked.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
