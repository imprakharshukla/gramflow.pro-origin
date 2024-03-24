"use client";

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
} from "@gramflow/ui";
import { AppConfig } from "@gramflow/utils";

import {
    pillColors,
} from "./components/dashboardOrderDetailSheet";

export const columns: ColumnDef<CompleteOrders>[] = [
    {
        accessorKey: "check",
        id: "check",
        header: ({ table }) => (
            <div className={"pointer-cursor flex items-center space-x-4"}>
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
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
                        </div>
                    }
                </div>


            );
        },
    },
    {
        accessorKey: "image",
        id: "image",
        header: "Products",
        cell: ({ row }) => {
            return (
                <div className="w-24">
                    {
                        <div className={"flex"}>
                            <div className={"relative"}>
                                <img
                                    alt={"product_image"}
                                    src={row.original.images[0]}
                                    width={100}
                                    height={100}
                                    className="rounded-md"
                                />
                                {
                                    row.original.images.length > 1 &&
                                    <Badge variant={"secondary"} className="absolute rounded-full top-2 right-2">
                                        {`${row.original.images.length}`}
                                    </Badge>
                                }
                            </div>
                        </div>
                    }
                </div>
            );
        },
    },
    {
        id: "user.name",
        accessorKey: "user.name",
        cell: ({ row }) => {
            return (
                <div className={"flex items-center justify-start text-sm"}>
                    {row.original.user?.name}
                </div>
            );
        },
        header: "Name",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return (
                <div
                    className={"flex flex-col items-center justify-center text-xs gap-2"}
                >
                    {row.original.bundles && (
                        <StatusBadge
                            size="xs"
                            color={"fuchsia" as Color}
                            className={"text-xs font-medium"}
                        >
                            Bundle
                        </StatusBadge>
                    )}
                    <StatusBadge
                        size="xs"
                        color={pillColors[row.original.status] as Color}
                        className={"text-xs font-medium"}
                    >
                        {(row.original.status.slice(0, 1) +
                            row.original.status.slice(1).toLowerCase()).replaceAll("_", " ")}

                    </StatusBadge>
                </div>
            );
        },
    },
    {
        accessorKey: "price",
        header: () => <div className={"w-16"}>Price</div>,
        cell: ({ row }) => {
            // fetch the price from the instagram_post_urls in which they are like this: https://www.instagram.com/p/CPQX0Y3nZ6I/?price=100 by adding all the prices of all the products in the array
            return (
                <div className={"flex items-center justify-center break-keep text-sm"}>
                    ₹ {new Intl.NumberFormat("en-IN").format(row.original.price)}
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
    // {
    //     id: "awb",
    //     header: "AWB",
    //     accessorKey: "awb",
    //     cell: ({ row }) => {
    //         return (
    //             <div className={"flex items-center justify-center text-sm"}>
    //                 {row.original.awb}
    //             </div>
    //         );
    //     },
    // },
    // {
    //     id: "user.phone_number",
    //     accessorKey: "phone_number",
    //     cell: ({ row }) => {
    //         return (
    //             <div className={"flex items-center justify-center text-sm"}>
    //                 {row.original.user?.phone_no}
    //             </div>
    //         );
    //     },
    // },
    // {
    //     id: "user.email",
    //     accessorKey: "email",
    //     cell: ({ row }) => {
    //         return (
    //             <div className={"flex items-center justify-center text-sm"}>
    //                 {row.original.user?.email}
    //             </div>
    //         );
    //     },
    // },
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
        id: "user.instagram_username",
        header: () => <div className={"w-32"}>Instagram User</div>,
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
