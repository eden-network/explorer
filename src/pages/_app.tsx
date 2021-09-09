/* eslint-disable react/jsx-props-no-spreading */
import 'tailwindcss/tailwind.css';
import NextNprogress from 'nextjs-progressbar';

import Banner from '../layout/Banner';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Banner>
        <span>
          The subgraph that powers the Explorer is currently behind in syncing
          -- data may be out of date!
        </span>
      </Banner>
      <Header />
      <NextNprogress
        color="#CAFF00"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow
      />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
