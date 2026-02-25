import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8002/:path*",
      },
      {
        source: "/assets/download/:path*",
        destination: "http://127.0.0.1:8002/assets/download/:path*"
      }
    ];
  },
};

export default nextConfig;
