import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta name="google-site-verification" content="1lM1ljGc3DT3pPl1rMmrZgr01LwlF38rPmRx6KcY8IE" />
        <meta charSet="utf-8" />
        
        {/* 基本的なファビコン設定 */}
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        
        {/* Apple用 */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        
        {/* Android用 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Microsoft用 */}
        <meta name="msapplication-TileColor" content="#0078d4" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* テーマカラー */}
        <meta name="theme-color" content="#0078d4" />
        
        {/* その他のファビコン関連 */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0078d4" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}