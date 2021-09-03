/* eslint-disable react/jsx-props-no-spreading */
import 'tailwindcss/tailwind.css';
import Header from '../layout/Header';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
