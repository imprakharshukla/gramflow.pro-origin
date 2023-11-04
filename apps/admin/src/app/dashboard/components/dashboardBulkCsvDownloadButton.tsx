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
  const toastId = toast.loading("Downloading CSV file...");
  try {
    setLoading(true);

    const res = await fetch(`/api/ship`, {
      method: "PUT",
      body: JSON.stringify({ order_ids }),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    //get text of the response
    const text = await res.text();
    const isResponseAUrl = z.string().url().safeParse(text);
    if (isResponseAUrl.success) {
      window.open(isResponseAUrl.data);
    } else {
      toast.error(text);
    }
    return text;
  } catch (e) {
    toast.error(e);
  } finally {
    toast.dismiss(toastId);
    setLoading(false);
  }
};

export default function DashboardBulkCsvDownloadButton({
  advandcedDisabled,
  getSelectedOrderIds,
  setConfirmMessage,
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
        setConfirmMessage(
          `Are you sure you want to download CSV file for ${selected.length} orders?`,
        );
        setShowConfirmation(true);
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
