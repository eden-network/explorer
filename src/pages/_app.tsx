/* eslint-disable react/jsx-props-no-spreading */
import 'tailwindcss/tailwind.css';
import NextNprogress from 'nextjs-progressbar';

import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../config/fontawsome';

function MyApp({ Component, pageProps }) {
  return (
    <>
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
