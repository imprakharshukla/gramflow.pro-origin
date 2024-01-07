import React from "react";
import { Redis } from "@upstash/redis";
import { motion } from "framer-motion";

import { cn } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { fontSerif } from "~/lib/fonts";
import BundleForm from "./components/bundleForm";
import { BundleNotAvailableHero } from "./components/bundleNotAvailableHero";

export default async function BundlePage() {
  const redis = new Redis({
    url: env.UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
  });
  let areBundlesAvailable = false;
  console.log({ env: env.ENV });
  if (env.ENV === "dev") {
    areBundlesAvailable = true;
  } else {
    areBundlesAvailable = (await redis.get<boolean>("bundles")) ?? false;
    console.log({ areBundlesAvailable });
  }
  if (!areBundlesAvailable) {
    return <BundleNotAvailableHero />;
  }
  return (
    <div className="mt-5">
      <div className="prose dark:prose-invert container">
        <BundleForm />
      </div>
    </div>
  );
}
