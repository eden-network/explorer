export default function HeroStats({
  stakers,
  staked,
}: {
  stakers: number;
  staked: number;
}) {
  return (
    <div className="mt-6 pb-6 sm:pb-8">
      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <dl className="rounded-lg bg-green sm:grid sm:grid-cols-2 text-blue shadow-lg">
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Active Stakers
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {stakers.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-col border-t border-blue p-6 text-center sm:border-0 sm:border-l">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Total EDEN Staked
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
