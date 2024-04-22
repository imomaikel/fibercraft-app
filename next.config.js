/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      hostname: 'cdn.discordapp.com',
      protocol: 'https',
    }, {
      hostname: '*.cloudfront.net',
      protocol: 'https',
    }],
  },
};

module.exports = nextConfig;
