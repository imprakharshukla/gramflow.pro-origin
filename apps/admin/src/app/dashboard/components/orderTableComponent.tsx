"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sheet } from "@gramflow/ui";
import { columns } from "~/app/dashboard/columns";
import { DataTable, NullableVoidFunction } from "~/app/dashboard/data-table";
import { DashboardOrderDetailSheet } from "./dashboardOrderDetailSheet";
import { SortingState, ColumnFiltersState, PaginationState, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, VisibilityState, Table } from "@tanstack/react-table";
import { subDays } from "date-fns";
import { CompleteOrders } from "@gramflow/db/prisma/zod";
import { DateRange } from "react-day-picker";
import useRestClient from "~/features/hooks/use-rest-client";
import { toast } from "sonner";
import { ActionPanel } from "./table/actionPanel";
import { Status } from "@gramflow/db";

export const OrderTable = () => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [rowDetails, setRowDetails] = useState<CompleteOrders | null>(null);
    const handleRowClick = (row: CompleteOrders) => {
        setIsSheetOpen(true);
        setRowDetails(row);
    };
    const LIMIT = 20;
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [orderData, setOrderData] = useState<CompleteOrders[]>([]);
    const [orderCount, setOrderCount] = useState<number>(-1);
    const [searchTerm, setSearchTerm] = useState("");
    const { client } = useRestClient();
    const [globalFilter, setGlobalFilter] = useState("");
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 90),
        to: new Date(),
    });

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });

    const { isLoading, error, isFetching, refetch, isRefetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
        client?.order.getOrders.useInfiniteQuery(
            ["orders", pageIndex, pageSize, dateRange, searchTerm],
            ({ pageParam = 1 }) => {
                return {
                    query: {
                        page: pageParam.toString(),
                        pageSize: pageSize.toString(),
                        from:
                            dateRange?.from?.valueOf().toString() ??
                            subDays(new Date(), 30).valueOf().toString(),
                        to:
                            dateRange?.to?.valueOf().toString() ??
                            new Date().valueOf().toString(),
                        searchTerm: searchTerm.length > 0 ? searchTerm : undefined,
                    },
                };
            },
            {

                getNextPageParam: (lastPage, allPages) => {
                    const nextPage =
                        lastPage.body.orders.length === LIMIT ? allPages.length + 1 : undefined;
                    return nextPage;
                },
                onSuccess: (data) => {
                    setOrderData(data.pages.flatMap((page) => page.body.orders));
                    console.log({ count: data.pages.flatMap((page) => page.body.count)[0] })
                    setOrderCount(data.pages.flatMap((page) => page.body.count)[0] ?? -1);
                },
                onError: (error) => {
                    console.error(error);
                    toast.error("Error fetching orders");
                }
                // refetchInterval: 10000,
            },

        );

    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize],
    );

    useEffect(() => {
        //* We monitor the input ref, and as soon as any value is entered, we fetch all the data and filter on the front end */
        if (searchInputRef.current) {
            searchInputRef.current.addEventListener('input', (e) => {
                setSearchTerm((e?.target as HTMLInputElement).value);
            })
        }
    }, [searchInputRef]);



    const getSelectedRows = (statusFilter?: Status) => {
        //select the order_ids from the selected rows
        const order_ids_index = Object.keys(rowSelection).filter(() => {
            return "1";
        });
        if (statusFilter) {
            order_ids_index.map((order_index) => {
                // @ts-ignore
                if (orderData[order_index].status !== statusFilter) {
                    order_ids_index.splice(order_ids_index.indexOf(order_index), 1);
                }
            })
        }
        const order_ids: string[] = [];
        order_ids_index.map((order_index) => {
            // @ts-ignore
            order_ids.push(orderData[order_index].id);
        });
        return order_ids;
    };

    const table = useReactTable({
        data: orderData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'auto',
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            // sorting,
            globalFilter,
            columnVisibility,
            pagination,
            columnFilters,
            rowSelection,
        },
    });


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
        >
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <DashboardOrderDetailSheet order={rowDetails} />
            </Sheet>
            <ActionPanel<CompleteOrders>
                table={table}
                dateRange={dateRange}
                setDateRange={setDateRange}
                refetchData={refetch}
                isLoading={isLoading || isFetching || isRefetching}
                isFetching={isFetching}
                isRefetching={isRefetching}
                searchInputRef={searchInputRef}
                /* Fix this @TODO */
                advancedDisabled={false}
                getSelectedOrderIds={getSelectedRows}
                loading={isLoading || isFetching || isRefetching}
                setRowSelection={setRowSelection}
                data={orderData}
                rowSelection={rowSelection}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
            />
            {table.getFilteredSelectedRowModel().rows.length > 0 &&
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    variants={{
                        visible: { opacity: 1, y: 10 },
                        hidden: { opacity: 0, y: 0 }
                    }}
                >
                    <RowSelectionComponent table={table} />
                </motion.div>
            }
            <DataTable<CompleteOrders, string> onRowClick={handleRowClick} columns={columns}
                table={table}
                data={orderData}
                dataCount={orderCount}
                isLoading={isLoading}
                isFetching={isFetching}
                isRefetching={isRefetching}
                hasNextPage={hasNextPage ?? false}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                pageIndex={pageIndex}
                pageSize={pageSize}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                refetchData={refetch}
                hiddenColumns={[
                    "user.email",
                    "user.phone_no",
                    "user.name",
                    "awb"
                ]}
            />
        </motion.div>
    );
};



function RowSelectionComponent<TData>({ table }: {
    table: Table<TData>
}) {
    return (
        <p className="h-10 py-2 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ">
            {
                table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="flex items-center justify-center gap-x-3">
                        <p className={""}>
                            {
                                table.getFilteredSelectedRowModel().rows.length
                            }{" "}
                            selected
                        </p>
                        <p>
                            {"₹ " +
                                table.getFilteredSelectedRowModel().rows.reduce(
                                    (acc, row) => {
                                        return (
                                            acc +
                                            Number(
                                                // @ts-ignore
                                                row.original.price
                                            )
                                        );
                                    },
                                    0,
                                )
                            }
                        </p>
                    </div>
                )
            }
        </p>
    )
}