import { DEV_API_URL, PROD_API_URL } from "@repo/shared/constants";
import type { NextConfig } from "next";

const IS_DEV = process.env.NODE_ENV !== "production";
const API_URL = IS_DEV ? DEV_API_URL : PROD_API_URL;

export default {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              base-uri 'self';
              font-src 'self';
              form-action 'self';
              frame-ancestors 'none';
              img-src 'self' blob: data: ${API_URL};
              object-src 'none';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              script-src-attr 'none';
              style-src 'self' 'unsafe-inline';
              connect-src 'self' ${API_URL};
              upgrade-insecure-requests
            `.replace(/\s{2,}/g, ""),
          },
          !IS_DEV && {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          !IS_DEV && {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          !IS_DEV && {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ].filter((header) => !!header),
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} satisfies NextConfig;
