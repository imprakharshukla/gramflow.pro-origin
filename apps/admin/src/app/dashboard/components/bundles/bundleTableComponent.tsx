"use client";

import { motion } from "framer-motion";

import { DataTable } from "~/app/dashboard/components/bundles/bundle-data-table";
import { columns } from "~/app/dashboard/components/bundles/bundlesColumn";
import { BundleSwitch } from "./bundleSwitch";

export const BundlesTable = async ({
  areBundlesAvailable,
}: {
  areBundlesAvailable: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <BundleSwitch areBundlesAvailable={areBundlesAvailable} />
      <DataTable columns={columns} searchBundleId={null} />
    </motion.div>
  );
};
