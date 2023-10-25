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
  transpilePackages: ["@gramflow/auth", "@gramflow/db", "@gramflow/utils", "@gramflow/ui"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: true,
    // serverComponentsExternalPackages: ["@prisma/client"],
  },
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  //     config.plugins = [...config.plugins, new PrismaPlugin()];
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return config;
  // },
};

export default config;
