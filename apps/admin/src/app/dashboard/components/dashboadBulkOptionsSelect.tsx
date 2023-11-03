"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";

import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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

import { downloadBulkOrderFiles } from "./dashboardBulkCsvDownloadButton";

export default function DashboardBulkOptionsSelectComponent({
  advancedDisabled,
  getSelectedOrderIds,
  setConfirmMessage,
  setOnConfirmFunction,
  setShowConfirmation,
  setRowSelection,
  data,
  setLoading,
}: {
  advancedDisabled: boolean;
  getSelectedOrderIds: () => string[];
  setConfirmMessage: Dispatch<SetStateAction<string>>;
  setOnConfirmFunction: any;
  setShowConfirmation: Dispatch<SetStateAction<boolean>>;
  setRowSelection: Dispatch<SetStateAction<{}>>;
  data: any;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    mutate: createShipmentMutate,
    isLoading: createShipmentLoading,
    error: createShipmentError,
  } = useMutation(
    async (order_ids: string[]) => {
      const res = await fetch("/api/ship", {
        method: "POST",
        body: JSON.stringify({ order_ids }),
      });
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    },
    {
      onSuccess: () => {
        console.log("Success");
        toast.success("Shipment Created");
      },
      onError: (e) => {
        console.log("Error");
        toast.error(`Error creating shipment ${e}`);
      },
    },
  );

  const {
    mutate: sendShippedEmailMutate,
    isLoading: sendShippedEmailLoading,
    error: sendShippedEmailError,
  } = useMutation(
    async ({ order_ids }: { order_ids: string[] }) => {
      const res = await fetch(`/api/order?order_ids=${order_ids.join(",")}`, {
        method: "OPTIONS",
      });
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    },
    {
      onSuccess: () => {
        console.log("Success");
        toast.success("Email sent");
      },
      onError: (e) => {
        console.log("Error");
        toast.error(`Error sending email ${e}`);
      },
    },
  );

  const {
    mutate: updateOrderMutate,
    isLoading: updateOrderLoading,
    error: updateOrderError,
  } = useMutation(
    async (params: { order_ids: string[]; status: Status; del: boolean }) => {
      const { order_ids, status, del } = params;

      const res = await fetch(
        `/api/order?order_ids=${order_ids.join(
          ",",
        )}&status=${status}&delete=${del}`,
        {
          method: "PUT",
        },
      );
      if (!res.ok) {
        throw new Error(res.status.toString());
      }

      return res.json();
    },
    {
      onSuccess: async () => {
        console.log("Success");
        toast.success("Done!");
        await queryClient.invalidateQueries({
          queryKey: ["allOrders"],
        });
        //set selected rows to empty
        // @ts-ignore
        setRowSelection({});
      },
      onError: (e) => {
        console.log("Error");
        toast.error(`Error ${e}`);
      },
    },
  );

  const {
    mutate: syncOrdersMutate,
    isLoading: syncOrdersLoading,
    error: syncOrdersError,
  } = useMutation(
    async (params: { order_ids: string[] }) => {
      toast("Syncing...");
      const { order_ids } = params;
      const res = await fetch(`/api/ship?order_ids=${order_ids.join(",")}`, {
        method: "OPTIONS",
      });
      if (!res.ok) {
        throw new Error(res.status.toString());
      }

      return res.json();
    },
    {
      onSuccess: async () => {
        console.log("Synced");
        toast.success("Syncing Done!");
        await queryClient.invalidateQueries({
          queryKey: ["allOrders"],
        });
        //set selected rows to empty
        // @ts-ignore
        setRowSelection({});
      },
      onError: (e) => {
        console.log("Error Syncing");
        toast.error(`Error ${e}`);
      },
    },
  );

  const wrapConfirmFunction = (func: any) => {
    return () => {
      setOnConfirmFunction(() => func); // Set the function to execute on confirm click
      setShowConfirmation(true);
    };
  };

  useEffect(() => {
    setLoading(
      createShipmentLoading || updateOrderLoading || syncOrdersLoading,
    );
  }, [createShipmentLoading, updateOrderLoading, syncOrdersLoading]);

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

  const updateOrders = ({
    order_ids,
    status,
    del,
  }: {
    order_ids: string[];
    status: Status;
    del: boolean;
  }) => {
    updateOrderMutate({
      order_ids,
      status,
      del: del,
    });
  };
  return (
    <DropdownMenu>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Selection">
            <CommandItem
              onSelect={() => {
                router.push(`/new`);
                setOpen(false);
              }}
            >
              Create Order
            </CommandItem>
            {Object.keys(Status).map((status) => {
              return (
                <CommandItem
                  onSelect={() => {
                    selectStatusOrders(status as Status);
                    setOpen(false);
                  }}
                  key={status}
                >
                  Select all{" "}
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}{" "}
                  orders.
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Themes">
            <CommandItem
              onSelect={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              Light
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              Dark
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Orders">
            {Object.keys(Status).map((status) => {
              return (
                <CommandItem
                  onSelect={() => {
                    updateOrders({
                      order_ids: getSelectedOrderIds(),
                      status: status as Status,
                      del: false,
                    });
                    setOpen(false);
                  }}
                  key={status}
                >
                  Mark order(s) as{" "}
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                  .
                </CommandItem>
              );
            })}
            <CommandItem
              onSelect={() => {
                updateOrders({
                  order_ids: getSelectedOrderIds(),
                  status: Status.PENDING,
                  del: true,
                });
                setOpen(false);
              }}
            >
              Delete Order
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Shipping">
            <CommandItem
              onSelect={() => {
                const selected = getSelectedOrderIds();
                createShipmentMutate(selected);
                setOpen(false);
              }}
            >
              Create Shipment(s)
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const selected = getSelectedOrderIds();
                setTheme("light");
                router.push(`/label?order_ids=${selected.join(",")}`);
              }}
            >
              Print Labels
            </CommandItem>
            <CommandItem
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSelect={async () => {
                const selected = getSelectedOrderIds();
                setOpen(false);
                toast("Downloading...");
                await downloadBulkOrderFiles(selected, setLoading);
              }}
            >
              Download Bulk CSV
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const selected = getSelectedOrderIds();
                syncOrdersMutate({ order_ids: selected });
                setOpen(false);
              }}
            >
              Sync
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <DropdownMenuTrigger>
        <Button variant={"outline"}>Bulk Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to create shipments for ${selected.length} orders?`,
            );
            setOnConfirmFunction(
              wrapConfirmFunction(() => createShipmentMutate(selected)),
            );
            setShowConfirmation(true);
          }}
        >
          Create Shipments
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            syncOrdersMutate({ order_ids: selected });
          }}
        >
          Sync
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setShowConfirmation(true);
            setConfirmMessage(
              `Are you sure you want to create labels for ${selected.length} orders?`,
            );
            setOnConfirmFunction(() => {
              setTheme("light");
              router.push(`/label?order_ids=${selected.join(",")}`);
            });
          }}
        >
          Create Labels
        </DropdownMenuItem>
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
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to mark ${selected.length} order as shipped?`,
            );
            setShowConfirmation(true);

            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                updateOrderMutate({
                  order_ids: selected,
                  status: Status.SHIPPED,
                  del: false,
                });
              }),
            );
          }}
        >
          Mark as Shipped
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to mark ${selected.length} order as manifested?`,
            );
            setShowConfirmation(true);

            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                updateOrderMutate({
                  order_ids: getSelectedOrderIds(),
                  status: Status.MANIFESTED,
                  del: false,
                });
              }),
            );
          }}
        >
          Mark as Manifested
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to mark ${selected.length} order as delivered?`,
            );
            setShowConfirmation(true);

            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                updateOrderMutate({
                  order_ids: getSelectedOrderIds(),
                  status: Status.DELIVERED,
                  del: false,
                });
              }),
            );
          }}
        >
          Mark as Delivered
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error(
                "Please select at least one order to create shipment",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to mark ${selected.length} order as cancelled?`,
            );
            setShowConfirmation(true);

            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                updateOrderMutate({
                  order_ids: getSelectedOrderIds(),
                  status: Status.CANCELLED,
                  del: false,
                });
              }),
            );
          }}
        >
          Mark as Cancelled
        </DropdownMenuItem>
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
                updateOrderMutate({
                  order_ids: getSelectedOrderIds(),
                  status: Status.PENDING,
                  del: true,
                });
              }),
            );
          }}
        >
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={advancedDisabled}
          onClick={() => {
            const selected = getSelectedOrderIds();
            if (selected.length === 0) {
              toast.error("Please select at least one order to email users.");
              return;
            }
            setConfirmMessage(
              `Are you REALLY sure you want to send emails to ${selected.length} users?`,
            );
            setShowConfirmation(true);
            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                sendShippedEmailMutate({
                  order_ids: getSelectedOrderIds(),
                });
              }),
            );
          }}
        >
          {/* fix this */}
          Send Shipped Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
