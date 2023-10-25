"use client";

import Image from "next/image";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Badge,
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetTrigger,
} from "@gramflow/ui";
import { AppConfig } from "@gramflow/utils";

import {
  DashboardOrderDetailSheet,
  orderStatus,
  pillColors,
} from "./components/dashboardOrderDetailSheet";

export const columns: ColumnDef<CompleteOrders>[] = [
  {
    accessorKey: "image",
    header: ({ table }) => (
      <div className={"flex w-40 items-center space-x-4"}>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <p className={"ml-4"}>Product</p>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div>
          {
            <div className={"flex"}>
              <Checkbox
                className={"mr-4"}
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />

              <div className={"relative"}>
                <Sheet key={row.id} >
                  <SheetTrigger asChild className={""}>
                    <div>
                      {/*// row.original.images.map((image, index) => (*/}
                      {/*// <Image*/}
                      {/*//     key={index}*/}
                      {/*//     className={`absolute top-0 left-0 mt-${6 * index} ml-${6 * index} hover:shadow-outline cursor-pointer`}*/}
                      {/*//     src={image}*/}
                      {/*//     alt={`product_image_${index}`}*/}
                      {/*//     width={100}*/}
                      {/*//     height={100}*/}
                      {/*//     style={{zIndex: row.original.images.length - index}}*/}
                      {/*//   />*/}
                      {/*// ))*/}
                      {
                        //todo do something to display multiple images
                        row.original.images[0] && (
                          <Image
                            alt={"product_image"}
                            src={row.original.images[0]}
                            width={100}
                            height={100}
                            className="rounded-md"
                          />
                        )
                      }
                    </div>
                  </SheetTrigger>
                  <DashboardOrderDetailSheet order={row.original} />
                </Sheet>
              </div>
            </div>
          }
        </div>
      );
    },

    minSize: 800,
  },
  {
    accessorKey: "number_of_items",
    header: () => <div className={"w-12"}>No. of Items</div>,
    cell: ({ row }) => {
      return (
        <div className={"flex items-center justify-center"}>
          {row.original.images.length}
        </div>
      );
    },
  },
  {
    header: ({ column }) => {
      return (
        <Button
          className={"w-32"}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className={"flex items-center justify-center"}>
          {format(
            new Date(row.original.created_at ?? new Date()),
            "dd/MM/yy, hh:mm a",
          )}
        </div>
      );
    },
    accessorKey: "createdAt",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
     
      return (
        <div className={"flex items-center justify-center"}>
          <StatusBadge
            size="xs"
            color={pillColors[row.original.status] as Color}
            className={"text-xs font-medium"}
          >
            {row.original.status}
          </StatusBadge>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      // fetch the price from the instagram_post_urls in which they are like this: https://www.instagram.com/p/CPQX0Y3nZ6I/?price=100 by adding all the prices of all the products in the array
      const price = row.original.instagram_post_urls.reduce((acc, curr) => {
        const url = new URL(curr);
        const priceValue = url.searchParams.get("price");
        const parsedPrice = Number(priceValue);
        return acc + (isNaN(parsedPrice) ? 0 : parsedPrice); // Add parsed price to accumulator
      }, 0);
      return (
        <div className={"flex items-center justify-center"}>₹ {price}</div>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: "Name",
  },
  {
    accessorKey: "id",
    header: () => <div className={"w-48"}>Order ID</div>,
    cell: ({ row }) => {
      const input = row.original.id;
      let short = input;
      const parts = input.split("-");
      if (parts.length === 5) {
        short = parts[0] + "...." + parts[4]; // Keep the first and last sections
      }
      return (
        <div className={"flex items-center justify-center"}>
          <Popover>
            <PopoverTrigger>{short}</PopoverTrigger>
            <PopoverContent>
              <div className={"flex flex-col space-y-3"}>
                <p className={"break-all text-sm text-muted-foreground"}>
                  {row.original.id}
                </p>
                <Link
                  href={`${AppConfig.BaseOrderUrl}/order/${row.original.id}`}
                >
                  <Button variant={"outline"}>Open Link</Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
  {
    accessorKey: "user.instagram_username",
    id: "instagram_username",
    header: () => <div className={"w-32"}>Instagram User</div>,
    cell: ({ row }) => {
      const instagram_user_id = row.original.user?.instagram_username;
      return (
        <div className="flex items-center justify-center space-x-2">
          <Link href={`https://instagram.com/${instagram_user_id}`}>
            {instagram_user_id}{" "}
            <span>
              <ExternalLink className={"inline-block"} size={16} />
            </span>
          </Link>
        </div>
      );
    },
  },
];
