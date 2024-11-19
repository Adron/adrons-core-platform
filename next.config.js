/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'adrons-core-platform.vercel.app',
          },
        ],
        destination: 'https://adron.tools/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;