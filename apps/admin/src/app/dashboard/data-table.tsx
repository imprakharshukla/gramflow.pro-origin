"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion"

import {
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type Table as TsTable,
} from "@tanstack/react-table";
import { initQueryClient } from "@ts-rest/react-query";
import { addDays, format, set, subDays } from "date-fns";
import { useAtom } from "jotai";
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    RefreshCcw,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { orderContract } from "@gramflow/contract";
import { type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
    Badge,
    Button,
    Calendar,
    Card,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Loader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@gramflow/ui";
import { AppConfig, cn } from "@gramflow/utils";
import { DatePickerWithRange } from "~/features/ui/components/dateRangePicker";
import DashboardBulkOptionsSelectComponent from "./components/dashboadBulkOptionsSelect";
import DashboardBulkCsvDownloadButton from "./components/dashboardBulkCsvDownloadButton";
import DashboardConfirmModal from "./components/dashboardConfirmModal";
import DashboardSelectedRowDisplayCard from "./components/dashboardSelectedRowDisplayCard";
import useSessionWithLoading from "~/features/hooks/use-session-auth";
import useOrderQueryClient from "~/features/hooks/use-order-query-client";
type SearchParamKey = keyof typeof SearchParams;
import { useInView } from "react-intersection-observer";
import { useCallback } from "react";
import useAuthToken from "~/features/hooks/use-auth-token";
import useRestClient from "~/features/hooks/use-rest-client";
import { Status } from "@prisma/client";

export const SearchParams = {
    Order_ID: "id",
    AWB: "awb",
    Email: "user.email",
    Name: "user.name",
    Username: "user.instagram_username",
    Phone_Number: "user.phone_no",
};

interface DataTablePaginationProps<TData> {
    table: TsTable<TData>;
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    onRowClick?: (row: TData) => void;
}

export type NullableVoidFunction = (() => void) | null;

interface ResponseType {
    orders: CompleteOrders[];
    count: number;
}

export function DataTable<TData, TValue>({
    columns,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const { loading: isAuthLoading, session } = useSessionWithLoading();
    const { token: authToken, error: authTokenError, loading: isAuthTokenLoading } = useAuthToken();
    const { ref, inView } = useInView();
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const LIMIT = 20;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [orderData, setOrderData] = useState<CompleteOrders[]>([]);
    const [orderCount, setOrderCount] = useState<number>(-1);

    const [advancedDisabled, setAdvancedDisabled] = useState(true);

    const [showConfirmation, setShowConfirmation] = useState(false);

    const [loading, setLoading] = useState(false);
    const { client } = useRestClient();
    const [onConfirmFunction, setOnConfirmFunction] =
        useState<NullableVoidFunction>(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    useEffect(() => {
        setEstimatedPackageCount(getSelectedOrderIds().length);
    }, [rowSelection]);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<Status | "All" | "Bundle">("All");
    const [searchParam, setSearchParam] = useState(SearchParams.Order_ID);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });


    const { isLoading, error, isFetching, refetch: refetchOrderData, isRefetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
        client?.order.getOrders.useInfiniteQuery(
            ["orders", pageIndex, pageSize, dateRange, searchTerm],
            ({ pageParam = 1 }) => {
                return {
                    headers: {
                        authorization: `Bearer ${authToken}`
                    },
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
                enabled: authToken !== null, // Assuming authToken check is done inside the async function
                // refetchInterval: 10000,
            },
        );

    const totalDBRowCount = orderCount
    const totalFetched = orderData.length


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
                    totalFetched <= totalDBRowCount &&
                    authToken
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


    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    useEffect(() => {
        if (searchTerm === "") {
            setPagination({ pageIndex: 0, pageSize: 20 });
        }
        if (authToken)
            refetchOrderData();
    }, [searchTerm, authToken]);
    useEffect(() => {
        if (authToken)
            refetchOrderData();
    }, [pageIndex, pageSize, authToken]);
    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize],
    );


    const table = useReactTable({
        data: orderData ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        // getPaginationRowModel: getPaginationRowModel(),
        // pageCount: orderCount,
        manualPagination: true,
        // onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnVisibility,
            pagination,
            columnFilters,
            rowSelection,
        },
    });

    useEffect(() => {
        if (
            session &&
            session.user?.email && AppConfig.AdminEmails.includes(session.user?.email)
        ) {
            setAdvancedDisabled(false);
        } else {
            setAdvancedDisabled(true);
        }
    }, [session]);
    useEffect(() => {
        if (authToken) {
            refetchOrderData()
        }
    }, [pageIndex, pageSize]);

    useEffect(() => {
        if (selectedStatus === "bundle") {
            // set the table to only show the bundles
            setSearchTerm("bundle");
        } else if (selectedStatus === "All") {
            if (searchTerm === "bundle") {
                setSearchTerm("")
            }
            table.resetColumnFilters();
            table.resetGlobalFilter();
        } else {
            if (searchTerm === "bundle") {
                setSearchTerm("")
            }
            table
                .setColumnFilters([
                    {
                        id: "status",
                        value: selectedStatus,
                    },
                ])
        }
    }, [selectedStatus]);

    const getSelectedOrderIds = () => {
        //select the order_ids from the selected rows
        const order_ids_index = Object.keys(rowSelection).filter(() => {
            return "1";
        });
        const order_ids: string[] = [];
        order_ids_index.map((order_index) => {
            // @ts-ignore
            order_ids.push(orderData[order_index].id);
        });
        return order_ids;
    };

    const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
    const [date, setDate] = useState<Date>(
        new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
    );
    const [estimatedPackageCount, setEstimatedPackageCount] = useState(
        getSelectedOrderIds().length,
    );

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        table
            .getAllColumns()
            .filter(
                (column) =>
                    column.id === "awb" ||
                    column.id === "user.phone_number" ||
                    column.id === "user.email" || column.id === "user.instagram_username",
            )
            .map((column) => {
                column.toggleVisibility(false);
            });
    }, [table]);
    return (
        <div>
            <DashboardConfirmModal
                showConfimation={showConfirmation}
                setShowConfirmation={setShowConfirmation}
                confirmMessage={confirmMessage}
                onConfirmFunction={onConfirmFunction}
            ></DashboardConfirmModal>
            <Card className={"flex w-fit items-center justify-center lg:hidden"}>
                <DashboardSelectedRowDisplayCard
                    data={orderData}
                    rowSelection={rowSelection}
                />
            </Card>

            <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    <div className="flex w-full flex-wrap items-center gap-2">
                        <Select
                            onValueChange={(value) => {
                                setSearchParam(value);
                            }}
                        >
                            <SelectTrigger className="w-1/4 lg:w-fit">
                                <SelectValue placeholder="Search by" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(SearchParams).map(
                                    (searchParam: SearchParamKey) => (
                                        <SelectItem
                                            key={searchParam}
                                            value={SearchParams[searchParam]}
                                        >
                                            {searchParam.replace("_", " ")}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(value: Status | "All") => {
                                setSelectedStatus(value);
                            }}
                        >
                            <SelectTrigger className="w-1/4 lg:w-fit">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(Status).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.slice(0, 1).toUpperCase() +
                                            status.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                                <SelectItem key={"All"} value={"All"}>
                                    All
                                </SelectItem>
                                <SelectItem
                                    key={searchParam}
                                    value={"bundle"}
                                >
                                    Bundle
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <DatePickerWithRange
                            className="w-fit"
                            onClickFunction={() => {
                                refetchOrderData();
                            }}
                            date={dateRange}
                            setDate={setDateRange}
                        />
                    </div>
                    <Input
                        placeholder={`Search with ${Object.keys(SearchParams)
                            .find((key) => SearchParams[key] === searchParam)
                            ?.replace("_", " ")}`}
                        ref={searchInputRef}
                        value={
                            (table.getColumn(searchParam)?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            table.getColumn(searchParam)?.setFilterValue(event.target.value);
                        }}
                        className="order-2 lg:w-fit w-full md:order-1"
                    />
                </div>
                <div
                    className={"order-1 mb-4 flex items-center gap-1 md:order-2 md:mb-0"}
                >
                    <Button
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        disabled={isLoading || isFetching}
                        onClick={async () => {
                            setLoading(true);
                            refetchOrderData();
                            setLoading(false);
                        }}
                        variant="outline"
                    >
                        {!(loading || isLoading || isFetching || isRefetching) ? (
                            <RefreshCcw className={"text-sm"} size={18} />
                        ) : (
                            <Loader />
                        )}
                    </Button>

                    <>
                        <Card className={"hidden items-center justify-center lg:flex"}>
                            <DashboardSelectedRowDisplayCard
                                data={orderData}
                                rowSelection={rowSelection}
                            ></DashboardSelectedRowDisplayCard>
                        </Card>
                        <DashboardBulkOptionsSelectComponent
                            advancedDisabled={advancedDisabled}
                            getSelectedOrderIds={getSelectedOrderIds}
                            setConfirmMessage={setConfirmMessage}
                            setOnConfirmFunction={setOnConfirmFunction}
                            setShowConfirmation={setShowConfirmation}
                            setRowSelection={setRowSelection}
                            data={orderData}
                            setPickupDialogOpen={setPickupDialogOpen}
                            setLoading={setLoading}
                        ></DashboardBulkOptionsSelectComponent>
                        <Dialog onOpenChange={setPickupDialogOpen} open={pickupDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create a Pickup Request</DialogTitle>
                                    <DialogDescription>
                                        Select a date on which you want to pickup the orders.
                                    </DialogDescription>
                                    <div className="grid gap-4 py-4">
                                        <Label>Pickup Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[280px] justify-start text-left font-normal",
                                                        !date && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? (
                                                        format(date, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    disabled={[
                                                        {
                                                            before: new Date(
                                                                new Date().toLocaleString("en-US", {
                                                                    timeZone: "Asia/Kolkata",
                                                                }),
                                                            ),
                                                            after: new Date(
                                                                new Date(
                                                                    new Date().getTime() +
                                                                    7 * 24 * 60 * 60 * 1000,
                                                                ).toLocaleString("en-US", {
                                                                    timeZone: "Asia/Kolkata",
                                                                }),
                                                            ),
                                                        },
                                                        new Date().getHours() >= 14 ? new Date() : null,
                                                    ]}
                                                    selected={date}
                                                    onSelect={setDate}
                                                    initialFocus
                                                    timeZone="Asia/Kolkata"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Label>Estimated Package Count</Label>
                                        <Input
                                            className={cn(
                                                "w-[280px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground",
                                            )}
                                            type="number"
                                            value={estimatedPackageCount}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                if (value !== "0") {
                                                    setEstimatedPackageCount(Number(value));
                                                    // Update the state or perform any other necessary actions
                                                }
                                            }}
                                            placeholder="Estimated Package Count"
                                        />
                                    </div>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        // @TODO fix this
                                        onClick={() => {
                                            // createPickupMutation({
                                            //     pickup_date: date,
                                            //     expected_package_count: estimatedPackageCount,
                                            // });
                                        }}
                                    >
                                        {true ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Create Pickup"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {table.getFilteredSelectedRowModel().rows.length > 0 && (
                            <DashboardBulkCsvDownloadButton
                                advandcedDisabled={advancedDisabled}
                                getSelectedOrderIds={getSelectedOrderIds}
                                setConfirmMessage={setConfirmMessage}
                                setShowConfirmation={setShowConfirmation}
                                setOnConfirmFunction={setOnConfirmFunction}
                            ></DashboardBulkCsvDownloadButton>
                        )}
                    </>
                </div>
            </div>
            <div>
                <div className="rounded-md border">
                    {/* <InfiniteScroll
                        dataLength={table.getRowModel().rows.length}
                        next={() => {
                            if (table.getPageCount() > pageIndex + 1) {
                                setPagination({
                                    pageIndex: pageIndex + 1,
                                    pageSize,
                                });
                            }
                        }}
                        hasMore={table.getPageCount() > pageIndex + 1}
                        loader={<div><Loader /></div>}
                    > */}
                    {/* ({flatData.length} of {totalDBRowCount} rows fetched) */}

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
                                            //apply the ref to the last row to trigger the fetchNextPage function using index
                                            ref={(table.getRowModel().rows.length === index + 1 ? ref : null)}
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
                                            {isLoading || isFetching
                                                ? <div className="flex items-center justify-center w-full"><Loader /></div>
                                                : error
                                                    ? "An error occurred"
                                                    : "No data found"}
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
                    totalFetched === totalDBRowCount &&
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

