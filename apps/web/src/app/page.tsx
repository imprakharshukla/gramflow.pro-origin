import { Redis } from "@upstash/redis";

import { env } from "~/env.mjs";
import HeroSection from "~/features/ui/components/heroSection";

export default async function HomePage() {
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
  return (
    <HeroSection
      props={{
        areBundlesAvailable: areBundlesAvailable,
      }}
    />
  );
}
