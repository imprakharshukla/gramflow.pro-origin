"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";

import { columns } from "~/app/dashboard/columns";
import { DataTable } from "~/app/dashboard/data-table";
import { searchOrderIdAtom } from "~/stores/dashboardStore";

export const OrderTable = ({
  searchOrderId,
}: {
  searchOrderId: string | null | undefined;
}) => {
  const [_, setSearchOrderIdVal] = useAtom(searchOrderIdAtom);
  if (searchOrderId) {
    setSearchOrderIdVal(searchOrderId);
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <DataTable columns={columns} />
    </motion.div>
  );
};
