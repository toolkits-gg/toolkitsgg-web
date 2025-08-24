import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    browserDebugInfoInTerminal: false,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    taint: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1ig3kkc8hj9hz.cloudfront.net',
        port: '',
        pathname: '/**/*',
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
