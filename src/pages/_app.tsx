/* eslint-disable react/jsx-props-no-spreading */
import 'tailwindcss/tailwind.css';
import NextNprogress from 'nextjs-progressbar';

import Header from '../layout/Header';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <NextNprogress
        color="#29D"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
