"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import {
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    Table as TableType,
} from "@tanstack/react-table";

import {
    Badge,
    Card,
    Loader,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@gramflow/ui";
import DashboardSelectedRowDisplayCard from "./components/dashboardSelectedRowDisplayCard";
import { useCallback } from "react";



export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    dataCount?: number;
    pageIndex: number;
    pageSize: number;
    onRowClick?: (row: TData) => void;
    isLoading: boolean;
    isFetching: boolean,
    isRefetching: boolean,
    hasNextPage: boolean,
    fetchNextPage: () => void,
    isFetchingNextPage: boolean,
    columnFilters: ColumnFiltersState,
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>,
    refetchData: () => void,
    hiddenColumns?: string[];
    rowSelection: {};
    setRowSelection: Dispatch<SetStateAction<{}>>;
    globalFilter: string;
    table: TableType<TData>;
    setGlobalFilter: Dispatch<SetStateAction<string>>;
}

export type NullableVoidFunction = (() => void) | null;

export function DataTable<TData, TValue>({
    columns,
    data,
    dataCount,
    onRowClick,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    hiddenColumns,
    rowSelection,
    table,
}: DataTableProps<TData, TValue>) {
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const totalDBRowCount = dataCount ?? 0
    const totalFetched = data.length


    // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement
                console.log({ totalDBRowCount, totalFetched, scrollHeight, scrollTop, clientHeight, diff: scrollHeight - scrollTop - clientHeight < 500 })
                //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
                if (
                    scrollHeight - scrollTop - clientHeight < 500 &&
                    !isFetching &&
                    totalFetched <= totalDBRowCount
                ) {
                    fetchNextPage()
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
    )

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current)
    }, [fetchMoreOnBottomReached])



    // useEffect(() => {
    //     if (searchTerm === "") {
    //         setPagination({ pageIndex: 0, pageSize: 20 });
    //     }
    //     refetchData();
    // }, [searchTerm]);
    // useEffect(() => {
    //     refetchData();
    // }, [pageIndex, pageSize]);





    // useEffect(() => {
    //     if (
    //         session &&
    //         session.user?.email && AppConfig.AdminEmails.includes(session.user?.email)
    //     ) {
    //         setAdvancedDisabled(false);
    //     } else {
    //         setAdvancedDisabled(true);
    //     }
    // }, [session]);

    // useEffect(() => {
    //     refetchData()
    // }, [pageIndex, pageSize]);

    // const getSelectedRows = (statusFilter?: Status) => {
    //     //select the order_ids from the selected rows
    //     const order_ids_index = Object.keys(rowSelection).filter(() => {
    //         return "1";
    //     });
    //     if (statusFilter) {
    //         order_ids_index.map((order_index) => {
    //             // @ts-ignore
    //             if (orderData[order_index].status !== statusFilter) {
    //                 order_ids_index.splice(order_ids_index.indexOf(order_index), 1);
    //             }
    //         })
    //     }
    //     const order_ids: string[] = [];
    //     order_ids_index.map((order_index) => {
    //         // @ts-ignore
    //         order_ids.push(orderData[order_index].id);
    //     });
    //     return order_ids;
    // };

    // const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
    // const [date, setDate] = useState<Date>(
    //     new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
    // );



    useEffect(() => {
        console.log({ hiddenColumns })
        table
            .getAllColumns()
            .filter(
                (column) =>
                    hiddenColumns &&
                    hiddenColumns.includes(column.columnDef.id as string),
            )
            .map((column) => {
                column.toggleVisibility(false);
            });
    }, [table]);

    return (
        <div>
            <Card className={"flex w-fit items-center justify-center lg:hidden"}>
                <DashboardSelectedRowDisplayCard
                    data={data}
                    rowSelection={rowSelection}
                />
            </Card>
            <div>
                <div className="rounded-md border">

                    <div
                        className="no-scrollbar w-full overflow-x-scroll"
                        onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
                        ref={tableContainerRef}
                        style={{
                            overflowY: "scroll",
                            position: 'relative',
                            height: '600px',
                        }}
                    >
                        <Table>
                            <TableHeader >
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext(),
                                                        )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>

                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            className=""
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} onClick={() => {
                                                    if (cell.column.id === "image") { onRowClick && onRowClick(row.original) }
                                                }}>

                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                    ))
                                ) : (

                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {
                                                (isLoading || isFetching || isFetchingNextPage)
                                                    ? <div className="flex items-center justify-center w-full"><Loader /></div>
                                                    :
                                                    "No data found"
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                    </div>
                </div>
                {isFetchingNextPage &&
                    <div className="flex items-center justify-center my-5">
                        <Loader />
                    </div>
                }
                {
                    !hasNextPage &&
                    <div className="flex items-center justify-center my-5">
                        <Badge variant={"outline"} className="">
                            All rows fetched
                        </Badge>
                    </div>
                }
            </div>
        </div >
    );
}

