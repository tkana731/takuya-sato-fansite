/**
 * 最終的な解決策 - next.config.mjs
 * @type {import('next').NextConfig}
 */
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

  // アセットプレフィックスの設定 - すべてのファイルのベースURLが変更される
  assetPrefix: '/assets',

  // URLリライトの設定 - 広告ブロッカーを回避する
  async rewrites() {
    return [
      // 静的ファイルへのアクセスを可能にする
      {
        source: '/assets/_next/:path*',
        destination: '/_next/:path*',
      },
      // APIエンドポイントをリダイレクト
      {
        source: '/api-data/:path*',
        destination: '/api/:path*',
      }
    ];
  },

  // ヘッダーの設定 - キャッシュコントロールを追加
  async headers() {
    return [
      {
        // すべての静的アセットにキャッシュ制御ヘッダーを追加
        source: '/assets/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;