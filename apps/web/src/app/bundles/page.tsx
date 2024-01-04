import React from "react";
import { Redis } from "@upstash/redis";

import { cn } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { fontSerif } from "~/lib/fonts";
import BundleForm from "./components/bundleForm";

export default async function BundlePage() {
  const redis = new Redis({
    url: env.UPSTASH_URL,
    token: env.UPSTASH_TOKEN,
  });
  const areBundlesAvailable = await redis.get<boolean>("bundles");
  if (!areBundlesAvailable) {
    return (
      <div className="p-4 pb-10 pt-10 text-justify md:p-10">
        <div className={cn(fontSerif.className, "text-center")}>
          <div className="flex flex-col gap-y-0.5">
            <p className="md:text-md ">
              ⋆｡°✩ ✮ 𝓐 𝓫𝓾𝓷𝓭𝓵𝓮 𝓶𝓪𝓭𝓮 𝓳𝓾𝓼𝓽 𝓯𝓸𝓻 𝔂𝓸𝓾 ‧₊˚🖇️✩ ₊˚🎧⊹♡
            </p>
          </div>

          <div>
            <p className="text-md mt-4">
              Thank you for your interest in our bundles. We are currently not
              accepting new bundle requests. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5">
      <div className="prose prose dark:prose-invert container">
        <BundleForm />
      </div>
    </div>
  );
}
