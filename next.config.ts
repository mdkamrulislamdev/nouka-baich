import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: [
    "three",
    "three-stdlib",
    "@react-three/fiber",
    "@react-three/drei",
  ],
};

export default nextConfig;
