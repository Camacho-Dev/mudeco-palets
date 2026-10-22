import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.17.30.60",
    "172.17.30.60:3000",
    "10.200.200.100",
    "10.200.200.100:3000",
  ],
};

export default nextConfig;
