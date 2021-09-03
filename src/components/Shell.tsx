import Head from 'next/head';

import Header from './Header';

export default function Shell(props) {
  return (
    <div className="min-h-screen bg-blue-light">
      <Head>
        <title>Eden Network Explorer</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="py-10 text-white">
        <main>{props.children}</main>
      </div>
    </div>
  );
}
