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
  webpack(config) {
    config.resolve.alias = {
        ...config.resolve.alias,
        'o1js': require('path').resolve(__dirname, 'node_modules/o1js')
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.optimization.minimizer = [];
    return config;
  }
};

module.exports = nextConfig;
