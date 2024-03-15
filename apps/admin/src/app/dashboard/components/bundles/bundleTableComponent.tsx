"use client";

import { motion } from "framer-motion";

import { DataTable } from "~/app/dashboard/components/bundles/bundle-data-table";
import { columns } from "~/app/dashboard/components/bundles/bundlesColumn";
import { BundleSwitch } from "./bundleSwitch";
import { useState } from "react";
import { CompleteBundles } from "@gramflow/db/prisma/zod";
import { DashboardBundleDetailSheet } from "./dashboardBundleDetailSheet";
import { Sheet } from "@gramflow/ui";

export const BundlesTable = ({
  areBundlesAvailable,
}: {
  areBundlesAvailable: boolean;
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rowDetails, setRowDetails] = useState<CompleteBundles | null>(null);
  const handleRowClick = (row: CompleteBundles) => {
    setIsSheetOpen(true);
    setRowDetails(row);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DashboardBundleDetailSheet bundle={rowDetails} />
      </Sheet>
      <BundleSwitch areBundlesAvailable={areBundlesAvailable} />
      <DataTable onRowClick={handleRowClick} columns={columns} />
    </motion.div>
  );
};
