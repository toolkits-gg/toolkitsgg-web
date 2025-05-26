import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './loader.js',
  },
};

export default nextConfig;
