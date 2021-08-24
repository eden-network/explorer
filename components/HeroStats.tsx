export default function HeroStats({ hashRate, stakers, staked }: { hashRate: number, stakers: number, staked: number }) {
  return (
    <div className="mt-10 pb-12 sm:pb-16">
      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <dl className="rounded-lg bg-green shadow-lg sm:grid sm:grid-cols-3 text-blue shadow-lg">
              <div className="flex flex-col border-b border-blue p-6 text-center sm:border-0 sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Participating hash rate
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {hashRate.toFixed(2)}%
                </dd>
              </div>
              <div className="flex flex-col border-t border-b border-blue p-6 text-center sm:border-0 sm:border-l sm:border-r">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Unique Stakers
                </dt>
                <dd className="order-1 text-5xl font-extrabold text-blue">
                  {stakers.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-col border-t border-blue p-6 text-center sm:border-0 sm:border-l">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-light">
                  Totak EDEN Staked
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
  )
}
