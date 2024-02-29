"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQueryState } from "nuqs";

import { CompleteOrders } from "@gramflow/db/prisma/zod";
import { Sheet } from "@gramflow/ui";

import { columns } from "~/app/dashboard/columns";
import { DataTable } from "~/app/dashboard/data-table";
import { DashboardOrderDetailSheet } from "./dashboardOrderDetailSheet";

export const OrderTable = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rowDetails, setRowDetails] = useState<CompleteOrders | null>(null);
  const handleRowClick = (row: CompleteOrders) => {
    setIsSheetOpen(true);
    setRowDetails(row);
  };

  const [name, setName] = useQueryState("name");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DashboardOrderDetailSheet order={rowDetails} />
      </Sheet>
      <DataTable onRowClick={handleRowClick} columns={columns} />
    </motion.div>
  );
};
