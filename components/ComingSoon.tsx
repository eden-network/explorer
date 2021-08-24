import Head from 'next/head'
import Header from '../components/Header'

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-blue-light">
      <Head>
        <title>Eden Network Explorer</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="py-10 text-white">
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Coming Soon
              </h2>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
