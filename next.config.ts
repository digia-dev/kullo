import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
