// Importing env files here to validate on build
import "./src/env.mjs";
import "@gramflow/auth/env.mjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

import { AppConfig } from "@gramflow/utils/config.mjs";

console.log(`images.${AppConfig.Domain}`);

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
        hostname: `**.${AppConfig.Domain}`,
      },
      {
        protocol: "https",
        hostname: `${AppConfig.Domain}`,
      },
      {
        protocol: "https",
        hostname: `utfs.io`,
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
    domains: ["localhost", "cdn.discordapp.com", `images.${AppConfig.Domain}`, `${AppConfig.Domain}`],
  },
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@gramflow/db", "@gramflow/utils", "@gramflow/ui"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
