import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.112",
    "two-biodiversity-guards-caribbean.trycloudflare.com",
  ],
};

export default withSerwist(nextConfig);