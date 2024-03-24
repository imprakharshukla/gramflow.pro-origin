"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@gramflow/db/types";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@gramflow/ui";
import useBundleQueryClient from "~/features/hooks/use-bundle-query-client";

export default function DashboardBundlesBulkOptionsSelectComponent({
  advancedDisabled,
  getSelectedOrderIds,
  setConfirmMessage,
  setOnConfirmFunction,
  setShowConfirmation,
  setRowSelection,
  data,
  setLoading,
  setPickupDialogOpen,
}: {
  advancedDisabled: boolean;
  getSelectedOrderIds: () => string[];
  setConfirmMessage: Dispatch<SetStateAction<string>>;
  setOnConfirmFunction: any;
  setShowConfirmation: Dispatch<SetStateAction<boolean>>;
  setRowSelection: Dispatch<SetStateAction<{}>>;
  data: any;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setPickupDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bundleQueryClient = useBundleQueryClient();
  const {
    mutate: deleteBundleMutate,
    isLoading: deleteOrderLoading,
    error: deleteOrderError,
  } = bundleQueryClient.deleteBundles.useMutation({
    onSuccess: async () => {
      toast.success("Done!");
      await queryClient.invalidateQueries({
        queryKey: ["allBundles"],
      });
      setRowSelection({});
    },
    onError: (e) => {
      toast.error(`Error ${e}`);
    }
  });

  const wrapConfirmFunction = (func: any) => {
    return () => {
      setOnConfirmFunction(() => func); // Set the function to execute on confirm click
      setShowConfirmation(true);
    };
  };

  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const selectStatusOrders = (status: Status) => {
    //filter all the orders by status and select them
    setRowSelection({});
    for (let i = 0; i < data.length; i++) {
      if (data[i].status === status) {
        setRowSelection((prevState) => {
          return {
            ...prevState,
            [i]: true,
          };
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"outline"}>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Select all...</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {
                //get all the status in an array and map it
                Object.values(Status).map((status) => {
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => {
                        // select the checkbox of all the orders which are manifested on the table
                        selectStatusOrders(status as Status);
                      }}
                    >
                      {status}
                    </DropdownMenuItem>
                  );
                })
              }
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={advancedDisabled}
          className="text-red-600 dark:text-red-300"
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you REALLY sure you want to DELETE ${selected.length} orders?`,
            );
            setShowConfirmation(true);
            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                const selected = getSelectedOrderIds();
                deleteBundleMutate({ query: { bundle_ids: selected.join(",") } });
              }),
            );
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
