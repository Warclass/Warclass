import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /swagger-ui-react/ },
    ];
    return config;
  },
};

export default nextConfig;
