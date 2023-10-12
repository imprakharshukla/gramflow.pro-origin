// Importing env files here to validate on build

import "./src/env.mjs";
import "@acme/auth/env.mjs";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AppConfig } from "@acme/utils/config.mjs";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `**.${AppConfig.Domain}}`,
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
    domains: ["localhost", "cdn.discordapp.com", `images.${AppConfig.Domain}`],
  },
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/auth", "@acme/db", "@acme/utils", "@acme/ui"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
