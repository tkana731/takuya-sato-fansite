/** @type {import('next').NextConfig} */
const nextConfig = {
  // 既存の設定を保持
  reactStrictMode: true,

  // 画像最適化の設定
  images: {
    domains: ['api.vercel.com'], // Vercelのプレースホルダー画像用
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // URLリライトの設定
  async rewrites() {
    return [
      // _appファイルの参照を変更
      {
        source: '/_next/static/chunks/pages/main-:hash.js',
        destination: '/_next/static/chunks/pages/_app-:hash.js',
      },
      // APIエンドポイントをより中立的な名前にリライト
      {
        source: '/data/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // アセットプレフィックスの設定（オプション）
  // assetPrefix: '/safe-assets',

  // webpack設定（安全なバージョン）
  webpack: (config, { dev }) => {
    // 本番ビルドのみに適用
    if (!dev) {
      // チャンクファイル名のハッシュ部分を短くする
      config.output.chunkFilename = 'static/chunks/[name].[chunkhash:8].js';

      // CSSファイル名も同様に変更
      config.plugins.forEach(plugin => {
        if (plugin.constructor.name === 'MiniCssExtractPlugin') {
          plugin.options.chunkFilename = 'static/css/[name].[contenthash:8].css';
        }
      });
    }

    return config;
  },
};

export default nextConfig;