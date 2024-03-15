import { Redis } from "@upstash/redis/nodejs";

import { env } from "~/env.mjs";
import { BundlesTable } from "../components/bundles/bundleTableComponent";

export default function BundlesPage() {
  // const redis = new Redis({
  //   url: env.UPSTASH_URL,
  //   token: env.UPSTASH_TOKEN,
  // });
  // const areBundlesAvailable = (await redis.get<boolean>("bundles")) ?? false;
  // @TODO complete this
  return (
    <>
      <BundlesTable areBundlesAvailable={true} />
    </>
  );
}
