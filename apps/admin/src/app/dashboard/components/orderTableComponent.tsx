"use client";

import { motion } from "framer-motion";
import { columns } from "~/app/dashboard/columns";
import { DataTable } from "~/app/dashboard/data-table";

export const OrderTable = ({}: {}) => {
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
