/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = process.cwd();
    return config;
  },
  allowedDevOrigins: ['3000-firebase-forestagro-12-1763891697850.cluster-aic6jbiihrhmyrqafasatvzbwe.cloudworkstations.dev'],
};

export default nextConfig;
