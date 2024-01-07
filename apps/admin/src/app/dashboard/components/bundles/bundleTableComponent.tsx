"use client";

import { motion } from "framer-motion";

import { DataTable } from "~/app/dashboard/components/bundles/bundle-data-table";
import { columns } from "~/app/dashboard/components/bundles/bundlesColumn";

export const BundlesTable = ({
  searchBundleId,
}: {
  searchBundleId?: string | null | undefined;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <DataTable columns={columns} searchBundleId={searchBundleId} />
    </motion.div>
  );
};
