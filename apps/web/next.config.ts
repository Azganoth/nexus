import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const IS_DEV = process.env.NODE_ENV !== "production";

const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
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
              font-src 'self' data:;
              form-action 'self';
              frame-ancestors 'none';
              img-src 'self' blob: data: ${process.env.NEXT_PUBLIC_API_URL};
              object-src 'none';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              script-src-attr 'none';
              style-src 'self' 'unsafe-inline';
              connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL} https://*.r2.cloudflarestorage.com;
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
  images: {
    dangerouslyAllowSVG: true,
    // Disable any scripts (mitigates XSS attacks through svgs)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "pub-f4942703ba94414ab97ca08e29bff222.r2.dev",
        pathname: "/**",
      },
    ],
  },
} satisfies NextConfig;

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
