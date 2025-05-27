// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

function MyApp({ Component, pageProps }) {
  useGoogleAnalytics();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;