"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
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

import useAuthToken from "~/features/hooks/use-auth-token";
import { DatePickerWithRange } from "~/features/ui/components/dateRangePicker";
import DashboardBulkOptionsSelectComponent from "./components/dashboadBulkOptionsSelect";
import DashboardBulkCsvDownloadButton from "./components/dashboardBulkCsvDownloadButton";
import DashboardConfirmModal from "./components/dashboardConfirmModal";
import DashboardSelectedRowDisplayCard from "./components/dashboardSelectedRowDisplayCard";
type SearchParamKey = keyof typeof SearchParams;

export const SearchParams = {
    Order_ID: "id",
    AWB: "awb",
    Email: "user.email",
    Name: "user.name",
    Username: "user.instagram_username",
    Phone_Number: "user.phone_number",
    Bundle: "bundle",
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
    const { user } = useUser();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const [advancedDisabled, setAdvancedDisabled] = useState(true);

    const [showConfirmation, setShowConfirmation] = useState(false);

    const [loading, setLoading] = useState(false);

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
    const fetchDataOptions = {
        pageIndex,
        pageSize,
        search: "",
    };
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<Status | "All" | "Bundle">("All");
    const [searchParam, setSearchParam] = useState(SearchParams.Order_ID);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const { mutate: createPickupMutation, isLoading: createPickupLoading } =
        useMutation(
            async (data: { pickup_date: Date; expected_package_count: number }) => {
                const response = await fetch("/api/pickup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ order_ids: getSelectedOrderIds(), ...data }),
                });
                if (response.ok) {
                    return response.json();
                } else {
                    const error = await response.json();
                    console.log(error);
                    throw new Error(error.error);
                }
            },
            {
                onSuccess: (data) => {
                    toast.success("Pickup request created successfully");
                    setPickupDialogOpen(false);
                },
                onError: (error: any) => {
                    toast.error("" + error);
                },
            },
        );

    const { token } = useAuthToken();
    const client = initQueryClient(orderContract, {
        baseUrl: "http://localhost:3002/api",
        baseHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    //@TODO rename the query to something more meaningful
    const { data, isLoading, error, isFetching, refetch, isRefetching } =
        client.getOrders.useQuery(
            ["allOrders", pageIndex, pageSize, dateRange, searchTerm],
            {
                query: {
                    page: pageIndex.toString(),
                    pageSize: pageSize.toString(),
                    from:
                        dateRange?.from?.valueOf().toString() ??
                        subDays(new Date(), 30).valueOf().toString(),
                    to:
                        dateRange?.to?.valueOf().toString() ??
                        new Date().valueOf().toString(),
                    searchTerm: searchTerm.length > 0 ? searchTerm : undefined,
                },
            },
            {
                // refetchInterval: 10000,
            },
        );

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    useEffect(() => {
        if (searchTerm === "") {
            toast.info("No search term set")
            setPagination({ pageIndex: 0, pageSize: 20 });
        } else {
            toast.info("Search term set:" + searchTerm);
        }
        refetch();
    }, [searchTerm]);
    useEffect(() => {
        refetch();
    }, [pageIndex, pageSize]);
    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize],
    );

    const table = useReactTable({
        data: data?.body?.orders ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        getPaginationRowModel: getPaginationRowModel(),
        pageCount: data?.body?.count ?? -1,
        manualPagination: true,
        onPaginationChange: setPagination,
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
            user &&
            user.primaryEmailAddress &&
            AppConfig.MasterEmails.includes(user.primaryEmailAddress.emailAddress)
        ) {
            setAdvancedDisabled(false);
        } else {
            setAdvancedDisabled(true);
        }
    }, [user]);

    useEffect(() => {
        if (selectedStatus === "bundle") {
            // set the table to only show the bundles
            setSearchTerm("bundle");
        } else if (selectedStatus === "All") {
            table.resetColumnFilters();
            table.resetGlobalFilter();
        } else {
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
            order_ids.push(data?.body.orders[order_index].id);
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

    useEffect(() => {
        toast.info("Refetching Data")
    }, [isRefetching])
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
                    data={data?.body?.orders}
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
                            <SelectTrigger className="w-fit">
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
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder="Filter Status" />
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
                            onClickFunction={() => {
                                console.log({ dateRange });
                                refetch();
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
                        className="order-2 w-fit md:order-1"
                    />
                </div>
                <div></div>
                <div
                    className={"order-1 mb-4 flex items-center gap-1 md:order-2 md:mb-0"}
                >
                    <Button
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        disabled={isLoading || isFetching}
                        onClick={async () => {
                            setLoading(true);
                            // await queryClient.refetchQueries(["allOrders"]);
                            refetch();
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
                                data={data?.body?.orders}
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
                            data={data?.body?.orders}
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
                                        onClick={() => {
                                            createPickupMutation({
                                                pickup_date: date,
                                                expected_package_count: estimatedPackageCount,
                                            });
                                        }}
                                    >
                                        {createPickupLoading ? (
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
                    <Table>
                        <TableHeader>
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
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        onClick={() => onRowClick && onRowClick(row.original)}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
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
                                            ? "Loading..."
                                            : error
                                                ? "An error occurred"
                                                : "No data found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="my-4 py-5">
                    <DataTablePagination table={table}></DataTablePagination>
                </div>
            </div>
        </div>
    );
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="hidden flex-1 text-sm text-muted-foreground md:block">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="hidden text-sm font-medium md:block">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50, 100, 200].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
