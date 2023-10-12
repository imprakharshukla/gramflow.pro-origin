"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { columns } from "~/app/dashboard/columns";
import { DataTable } from "~/app/dashboard/data-table";

export const OrderTable = () => {
  const { isLoaded, user } = useUser();

  return (
    <div className="mt-4">
      <DataTable columns={columns} />
    </div>
  );
};
