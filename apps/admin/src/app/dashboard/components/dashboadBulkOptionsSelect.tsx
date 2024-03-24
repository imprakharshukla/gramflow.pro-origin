"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@gramflow/db/types";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { fontSans } from "~/lib/fonts";
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
import useRestClient from "~/features/hooks/use-rest-client";

export default function DashboardBulkOptionsSelectComponent({
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
  const { client } = useRestClient();
  const queryClient = useQueryClient()


  const [isFileDownloadLoading, setIsFileDownloadLoading] = useState(false);
  const {
    mutate: createShipmentMutate,
    isLoading: createShipmentLoading,
    error: createShipmentError,
  } = client.ship.createShipment.useMutation({
    onSuccess: async () => {
      toast.success("Shipment Created");

      const order_ids = getSelectedOrderIds();
      // filter those order which are accepted only
      // @ts-ignore
      const acceptedOrders = data.filter((order: any) => {
        return order_ids.includes(order.id);
      });
      // get the order ids of those orders
      // @ts-ignore
      const acceptedOrderIds = acceptedOrders.map((order) => order.id);
      // filter the rejected orders from the selected orders
      const acceptedSelectedOrderIds = order_ids.filter((order_id) => {
        return acceptedOrderIds.includes(order_id);
      });

      syncOrdersMutate({
        body: {
          order_ids: acceptedSelectedOrderIds.join(","),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
    onError: (e) => {
      console.log("Error");
      toast.error(`Error creating shipment ${e}`);
    },
  });

  const fetchLabelPDF = async () => {
    try {
      setIsFileDownloadLoading(true);
      const selected = getSelectedOrderIds();
      return fetch(
        `http://localhost:3002/api/document/label?order_ids=${selected.join(
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
              "_shipping"
              }.pdf`,
          }).click();
        });
    } catch (e) {
      toast.error(`Error ${e}`);
    } finally {
      setIsFileDownloadLoading(false);
    }
  };

  const {
    mutate: mergeOrderMutate,
    isLoading: mergeOrderLoading,
    error: mergeOrderError,
  } = client.order.mergeOrders.useMutation({
    onSuccess: async () => {
      toast.success("Done!");
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      //set selected rows to empty
      // @ts-ignore
      setRowSelection({});
    },
    onError: (e) => {
      console.log("Error");
      toast.error(`Error ${e}`);
    },
  });

  const {
    mutate: syncOrdersMutate,
    isLoading: syncOrdersLoading,
    error: syncOrdersError,
  } = client.ship.syncShipments.useMutation({
    onSuccess: async () => {
      toast.success("Done!");
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },

    onError: (e) => {
      console.log("Error");
      toast.error(`Error ${e}`);
    },
  });

  const {
    mutate: deleteOrderMutate,
    isLoading: deleteOrderLoading,
    error: deleteOrderError,
  } = client.order.deleteOrders.useMutation({
    onSuccess: async () => {
      toast.success("Done!");
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      //set selected rows to empty
      // @ts-ignore
      setRowSelection({});
    },
    onError: (e) => {
      console.log("Error");
      toast.error(`Error ${e}`);
    },
  });

  const {
    mutate: updateOrderMutate,
    isLoading: updateOrderLoading,
    error: updateOrderError,
  } = client.order.updateOrders.useMutation({
    onSuccess: async () => {
      toast.success("Done!");
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      //set selected rows to empty
      // @ts-ignore
      setRowSelection({});
    },
    onError: (e) => {
      console.log("Error");
      toast.error(`Error ${e}`);
    },
  });

  const wrapConfirmFunction = (func: any) => {
    return () => {
      setOnConfirmFunction(() => func); // Set the function to execute on confirm click
      setShowConfirmation(true);
    };
  };

  useEffect(() => {
    setLoading(
      createShipmentLoading ||
      updateOrderLoading ||
      isFileDownloadLoading ||
      mergeOrderLoading ||
      syncOrdersLoading ||
      deleteOrderLoading,
    );
  }, [
    createShipmentLoading,
    updateOrderLoading,
    isFileDownloadLoading,
    mergeOrderLoading,
    syncOrdersLoading,
    deleteOrderLoading,
  ]);

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

  const getShippingCostForOrder = () => {
    let shippingCost = 0;
    //get selected orders
    const selectedOrders = getSelectedOrderIds();
    //filter all the orders by status and select them
    for (let i = 0; i < data.length; i++) {
      if (selectedOrders.includes(data[i].id)) {
        shippingCost += data[i].shipping_cost;
      }
    }
    return shippingCost;
  };

  const updateOrders = ({
    order_ids,
    status,
  }: {
    order_ids: string[];
    status: Status;
  }) => {
    updateOrderMutate({
      body: {
        order_ids: order_ids[0] ?? "",
        update: {
          status,
        },
      },
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
                deleteOrderMutate({
                  query: {
                    order_ids: getSelectedOrderIds().join(","),
                  },
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
                setPickupDialogOpen(true);
                setOpen(false);
              }}
            >
              Create Pickup
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const totalShippingCost = getShippingCostForOrder();
                toast(`The total shipping cost is ₹${totalShippingCost}`, {
                  action: {
                    label: "Create",
                    onClick: () => {
                      const selected = getSelectedOrderIds();
                      createShipmentMutate({
                        body: {
                          order_ids: selected.join(","),
                        },
                      });
                    },
                  },
                });
                setOpen(false);
              }}
            >
              Create Shipment(s)
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const selected = getSelectedOrderIds();
                setTheme("light");
                fetchLabelPDF();
              }}
            >
              Print Labels
            </CommandItem>
            <CommandItem
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSelect={async () => {
                // @TODO fix this
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
                // @TODO create this mutation
                syncOrdersMutate({ body: { order_ids: selected.join(",") } });
                setOpen(false);
              }}
            >
              Sync
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <DropdownMenuTrigger>
        <Button variant={"outline"}>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={fontSans.className}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
              wrapConfirmFunction(() => {
                const totalShippingCost = getShippingCostForOrder();
                toast(`The total shipping cost is ₹${totalShippingCost}`, {
                  action: {
                    label: "Create",
                    onClick: () => {
                      const selected = getSelectedOrderIds();
                      createShipmentMutate({
                        body: { order_ids: selected.join(",") },
                      });
                    },
                  },
                });
              }),
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
            syncOrdersMutate({ body: { order_ids: selected.join(",") } });
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
            setOnConfirmFunction(() => {
              //   setTheme("light");
              fetchLabelPDF();
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
            if (selected.length < 2) {
              toast.error("Please select at least two orders to merge");
              return;
            }
            setConfirmMessage(
              `Are you REALLY sure you want to merge ${selected.length} orders?`,
            );
            setShowConfirmation(true);
            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                toast.success("Hello Working");
                mergeOrderMutate({
                  body: {
                    order_ids: getSelectedOrderIds().join(","),
                  },
                });
                setOpen(false);
              }),
            );
          }}
        >
          Merge Orders
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
            setConfirmMessage(
              `Are you sure you want to mark ${selected.length} order as shipped?`,
            );
            setShowConfirmation(true);

            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                updateOrderMutate({
                  body: {
                    order_ids: selected.join(","),
                    update: {
                      status: Status.SHIPPED,
                    },
                  },
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
                  body: {
                    order_ids: selected.join(","),
                    update: {
                      status: Status.MANFIFESTED,
                    },
                  },
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
                  body: {
                    order_ids: selected.join(","),
                    update: {
                      status: Status.DELIVERED,
                    },
                  },
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
                  body: {
                    order_ids: selected.join(","),
                    update: {
                      status: Status.CANCELLED,
                    },
                  },
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
                deleteOrderMutate({
                  query: {
                    order_ids: getSelectedOrderIds().join(","),
                  },
                });
                setOpen(false);
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
              toast.error(
                "Please select at least one order to create a pickup.",
              );
              return;
            }
            setConfirmMessage(
              `Are you sure you want to create a pickup for ${selected.length} orders?`,
            );
            setShowConfirmation(true);
            setOnConfirmFunction(
              wrapConfirmFunction(() => {
                setPickupDialogOpen(true);
                setOpen(false);
              }),
            );
          }}
        >
          Create Pickup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
