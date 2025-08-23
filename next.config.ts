import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    browserDebugInfoInTerminal: false,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
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
};

export default nextConfig;
