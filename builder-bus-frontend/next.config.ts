import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3102/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3102/api/:path*',
      },
    ];
  },
};

export default nextConfig;
