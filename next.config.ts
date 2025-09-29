import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // This is to prevent the "Module not found: Can't resolve 'electron'" error.
    // This can happen when using libraries that have optional electron dependencies.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      electron: false
    };
    
    return config;
  }
};

module.exports = nextConfig;
