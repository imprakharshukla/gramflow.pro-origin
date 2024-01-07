"use client";

import Image from "next/image";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge as StatusBadge, type Color } from "@tremor/react";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { type CompleteBundles } from "@gramflow/db/prisma/zod";
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

import { isBundleDetailOpenAtom } from "~/stores/dashboardStore";
import Dashboard from "../../page";
import {
  DashboardBundleDetailSheet,
  pillColors,
  sizePillColors,
} from "./dashboardBundleDetailSheet";

export const columns: ColumnDef<CompleteBundles>[] = [
  {
    accessorKey: "image",
    id: "image",
    header: ({ table }) => (
      <div className={"pointer-cursor flex w-40 items-center space-x-4"}>
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
                <Sheet key={row.id}>
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
                        row.original.images[0] ? (
                          <Image
                            alt={"product_image"}
                            src={row.original.images[0]}
                            width={100}
                            height={50}
                            className="rounded-md"
                          />
                        ) : (
                          <p className="mx-auto w-full rounded-md text-center font-medium">
                            No Image
                          </p>
                        )
                      }
                    </div>
                  </SheetTrigger>
                  <DashboardBundleDetailSheet bundle={row.original} />
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
    accessorKey: "bundle_size",
    header: "Size",
    cell: ({ row }) => {
      return (
        <div
          className={"flex flex-col items-center justify-center gap-2 text-xs"}
        >
          <StatusBadge
            size="xs"
            color={sizePillColors[row.original.bundle_size] as Color}
            className={"text-xs font-medium"}
          >
            {row.original.bundle_size.slice(0, 1).toUpperCase() +
              row.original.bundle_size.slice(1).toLowerCase()}
          </StatusBadge>
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
        <div className={"flex items-center justify-center break-all text-xs"}>
          {format(
            new Date(row.original.created_at ?? new Date()),
            "dd/MM/yy, EEE, hh:mm a",
          )}
        </div>
      );
    },
    id: "created_at",
    accessorKey: "createdAt",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div
          className={"flex flex-col items-center justify-center gap-2 text-xs"}
        >
          <StatusBadge
            size="xs"
            color={pillColors[row.original.status] as Color}
            className={"text-xs font-medium"}
          >
            {row.original.status.slice(0, 1) +
              row.original.status.slice(1).toLowerCase()}
          </StatusBadge>
        </div>
      );
    },
  },
  {
    id: "user.name",
    accessorKey: "user.name",
    cell: ({ row }) => {
      return (
        <div className={"flex items-center justify-center text-sm"}>
          {row.original.user?.name}
        </div>
      );
    },
    header: "Name",
  },
  {
    accessorKey: "id",
    header: () => <div className={"w-48 text-center"}>Bundle ID</div>,
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
  {
    accessorKey: "user.instagram_username",
    id: "user.instagram_username",
    header: () => <div className={"w-32 text-center"}>Instagram User</div>,
    cell: ({ row }) => {
      const instagram_user_id = row.original.user?.instagram_username;
      return (
        <div className="flex items-center justify-center space-x-2 text-sm">
          {instagram_user_id && (
            <Link href={`https://instagram.com/${instagram_user_id}`}>
              {instagram_user_id}{" "}
              <span>
                <ExternalLink className={"inline-block"} size={16} />
              </span>
            </Link>
          )}
        </div>
      );
    },
  },
];
