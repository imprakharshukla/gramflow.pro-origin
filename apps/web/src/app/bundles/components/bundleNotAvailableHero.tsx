"use client";

import { cn } from "@gramflow/utils";
import { motion } from "framer-motion";
import { fontSerif } from "~/lib/fonts";

export const BundleNotAvailableHero = () => {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={""}
    >
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
    </motion.div>
  );
};
