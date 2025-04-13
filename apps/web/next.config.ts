import { NextConfig } from "next";

export default {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} satisfies NextConfig;
