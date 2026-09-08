import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@district-ops/api-client", "@district-ops/ui"],
};

export default nextConfig;
