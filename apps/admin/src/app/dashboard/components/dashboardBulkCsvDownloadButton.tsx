"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@gramflow/ui";

import { type NullableVoidFunction } from "../data-table";

export const downloadBulkOrderFiles = async (
  order_ids: string[],
  setLoading: Dispatch<SetStateAction<boolean>>,
) => {
  try {
    setLoading(true);
    const selected = order_ids;
    return fetch(
      `http://localhost:3002/api/document/shipment?order_ids=${selected.join(
        ",",
      )}`,
      {
        method: "GET",
        headers: {
          responseType: "blob",
        },
      },
    )
      .then((res) => res.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((href) => {
        Object.assign(document.createElement("a"), {
          href,
          download: `${new Date().toDateString() +
            " " +
            new Date().toLocaleTimeString() +
            "_shipment"
            }.csv`,
        }).click();
      });
  } catch (e) {
    toast.error(`Error ${e}`);
  } finally {
    setLoading(false);
  }
};

export default function DashboardBulkCsvDownloadButton({
  advandcedDisabled,
  getSelectedOrderIds,
  setShowConfirmation,
  setOnConfirmFunction,
}: {
  advandcedDisabled: boolean;
  getSelectedOrderIds: () => string[];
  setConfirmMessage: Dispatch<SetStateAction<string>>;
  setShowConfirmation: Dispatch<SetStateAction<boolean>>;
  setOnConfirmFunction: Dispatch<SetStateAction<NullableVoidFunction>>;
}) {
  const wrapConfirmFunction = (func: any) => {
    return () => {
      setOnConfirmFunction(() => func); // Set the function to execute on confirm click
      setShowConfirmation(true);
    };
  };

  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={advandcedDisabled}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={async () => {
        const selected = getSelectedOrderIds();
        if (selected.length === 0) {
          toast.error("Please select at least one order to create shipment");
          return;
        }
        setShowConfirmation(false);
        setOnConfirmFunction(
          wrapConfirmFunction(async () => {
            const order_ids = getSelectedOrderIds();
            await downloadBulkOrderFiles(order_ids, setLoading);
          }),
        );
      }}
      variant="outline"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && <FileDown className="h-4 w-4" />}
    </Button>
  );
}
