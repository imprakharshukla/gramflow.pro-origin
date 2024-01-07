import React from "react";
import { Redis } from "@upstash/redis";
import { motion } from "framer-motion";
import { HelpCircle, ShareIcon } from "lucide-react";

import { Button } from "@gramflow/ui";
import { cn } from "@gramflow/utils";

import { env } from "~/env.mjs";
import { fontSerif } from "~/lib/fonts";
import BundleForm from "./components/bundleForm";
import { BundleNotAvailableHero } from "./components/bundleNotAvailableHero";
import { FAQSectionDrawer } from "./components/faqSectionDrawer";

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
    <div className="mt-5 px-4">
      <div className="mt-4 flex items-end justify-end">
        <FAQSectionDrawer
          faqItems={[
            {
              question: "What is a bundle?",
              answer:
                "A bundle is box created just for you where you can request your style and aesthetic.",
            },
            {
              question: "Why should I get a bundle?",
              answer:
                "Bundles are a great way include variety in your wardrobe. You can get a bundle for a specific occasion or just to try out new styles. If you were looking to get a new wardrobe or extend your existing one, a bundle is a great way to start.",
            },
            {
              question: "How much does a bundle cost?",
              answer:
                "A bundle comes in different sizes and prices. You can choose between a small (₹3K-₹4K), medium (₹4K-₹6K), large (₹6K-₹10) and a extra large (>₹12K) bundle.",
            },
            {
              question: "How many items are there in a bundle?",
              answer:
                "A bundle comes with the following number of items: small (3-4), medium (4-7), large (7-12) and a extra large (>12).",
            },
          ]}
        >
          <Button
            // onClick={handleShareButton}
            size={"sm"}
            className="flex w-fit space-x-2"
            variant={"outline"}
          >
            <span>FAQs</span>
            <HelpCircle className="h-4 w-4" />
          </Button>
        </FAQSectionDrawer>
      </div>
      <div className="prose dark:prose-invert container flex flex-col">
        <BundleForm />
      </div>
    </div>
  );
}
