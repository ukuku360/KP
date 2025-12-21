/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@politics/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "*.kakaousercontent.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  output: "standalone",
};

module.exports = nextConfig;
