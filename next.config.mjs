/** @type {import('next').NextConfig} */
const nextConfig = {
  // 既存の設定を保持
  reactStrictMode: true,

  // 画像最適化の設定を追加
  images: {
    domains: ['api.vercel.com'], // Vercelのプレースホルダー画像用
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;