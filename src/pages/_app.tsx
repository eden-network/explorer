/* eslint-disable react/jsx-props-no-spreading */
import 'tailwindcss/tailwind.css';
import NextNprogress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';

import Footer from '../layout/Footer';
import Header from '../layout/Header';

import '../config/fontawsome';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/_app.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* <Banner>
        <span>
          The subgraph that powers the Explorer is currently behind in syncing
          -- data may be out of date!
        </span>
      </Banner> */}
      <Header />
      <NextNprogress
        color="#CAFF00"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow
      />
      <ToastContainer
        icon={false}
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
