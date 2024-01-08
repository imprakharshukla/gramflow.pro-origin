"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { addDays, format, set, subDays } from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { date } from "zod";

import { CompleteBundles, type CompleteOrders } from "@gramflow/db/prisma/zod";
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

import DashboardConfirmModal from "../dashboardConfirmModal";
import DashboardBundlesBulkOptionsSelectComponent from "./dashboardBundlesBulkSelectComponent";
// import DashboardBulkCsvDownloadButton from "../../components/dashboardBulkCsvDownloadButton";
// import DashboardConfirmModal from "../../components/dashboardConfirmModal";
import DashboardBundlesSelectedRowDisplayCard from "./dashboardBundlesSelectedRowDisplayCard";

type SearchParamKey = keyof typeof SearchParams;

export const SearchParams = {
  Order_ID: "id",
  Email: "user.email",
  Name: "user.name",
  Username: "user.instagram_username",
  Phone_Number: "user.phone_number",
};
interface DataTablePaginationProps<TData> {
  table: TsTable<TData>;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export type NullableVoidFunction = (() => void) | null;
interface ResponseType {
  orders: CompleteBundles[];
  count: number;
}
export function DataTable<TData, TValue>({
  columns,
  searchBundleId,
}: DataTableProps<TData, TValue> & {
  searchBundleId: string | null | undefined;
}) {
  const { user } = useUser();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [advancedDisabled, setAdvancedDisabled] = useState(true);

  const [showConfimation, setShowConfirmation] = useState(false);

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
  const [selectedStatus, setSelectedStatus] = useState<Status | "All">("All");
  const [searchParam, setSearchParam] = useState(SearchParams.Order_ID);

  const fetchData = async (options: {
    pageIndex: number;
    pageSize: number;
    search: string;
  }) => {
    const response = await fetch(
      `/api/bundles?page=${pageIndex}&pageSize=${pageSize}&search=${options.search}`,
    );
    if (response.ok) {
      const data = (await response.json()) as ResponseType;
      //filter the rows that have been accepted and created into orders
      const filteredData = data.orders.filter((order) => {
        return order.status === Status.PENDING;
      });
      return {
        rows: filteredData,
        pageCount: Math.ceil(filteredData.length / options.pageSize),
      };
    } else {
      throw new Error("Something went wrong");
    }
  };

  const dataQuery = useQuery(
    ["allBundles", fetchDataOptions],
    () => fetchData(fetchDataOptions),
    { keepPreviousData: true },
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    if (searchTerm === "") {
      setPagination({ pageIndex: 0, pageSize: 20 });
      dataQuery.refetch();
    } else {
      fetchDataOptions.search = searchTerm;
      dataQuery.refetch();
    }
  }, [searchTerm]);
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data: dataQuery.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: dataQuery.data?.pageCount ?? -1,
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
    if (selectedStatus !== "All") {
      table
        .getAllColumns()
        .filter((column) => column.id === "status")
        .map((column) => {
          column.setFilterValue(selectedStatus);
        });
    } else {
      table
        .getAllColumns()
        .filter((column) => column.id === "status")
        .map((column) => {
          column.setFilterValue("");
        });
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
      order_ids.push(dataQuery.data?.rows[order_index].id);
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

  useEffect(() => {
    if (searchBundleId) {
      setSearchTerm(searchBundleId);
      toast.info(`Finding ${searchParam} ${searchBundleId}`);
      table.getColumn(searchParam)?.setFilterValue(searchBundleId);
    }
  }, [searchBundleId]);

  useEffect(() => {
    table
      .getAllColumns()
      .filter(
        (column) =>
          // column.id === "awb" ||
          column.id === "user.phone_number" || column.id === "user.email",
      )
      .map((column) => {
        column.toggleVisibility(false);
      });
  }, [table]);
  return (
    <div>
      <DashboardConfirmModal
        showConfimation={showConfimation}
        setShowConfirmation={setShowConfirmation}
        confirmMessage={confirmMessage}
        onConfirmFunction={onConfirmFunction}
      ></DashboardConfirmModal>
      <Card className={"flex w-fit items-center justify-center lg:hidden"}>
        <DashboardBundlesSelectedRowDisplayCard
          data={dataQuery.data?.rows}
          rowSelection={rowSelection}
        />
      </Card>

      <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex w-full items-center gap-2">
            <Select
              onValueChange={(value) => {
                setSearchParam(value);
              }}
            >
              <SelectTrigger className="w-1/2">
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
              <SelectTrigger className="w-1/2">
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
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder={`Search with ${Object.keys(SearchParams)
              .find((key) => SearchParams[key] === searchParam)
              ?.replace("_", " ")}`}
            value={
              (table.getColumn(searchParam)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              setSearchTerm(event.target.value);
              table.getColumn(searchParam)?.setFilterValue(event.target.value);
            }}
            className="order-2 w-full md:order-1"
          />
        </div>
        <div
          className={"order-1 mb-4 flex items-center gap-1 md:order-2 md:mb-0"}
        >
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            disabled={dataQuery.isLoading || dataQuery.isFetching}
            onClick={async () => {
              setLoading(true);
              await dataQuery.refetch();
              setLoading(false);
            }}
            variant="outline"
          >
            {!(loading || dataQuery.isLoading || dataQuery.isFetching) ? (
              <RefreshCcw className={"text-sm"} size={18} />
            ) : (
              <Loader />
            )}
          </Button>

          <>
            <Card className={"hidden items-center justify-center lg:flex "}>
              <DashboardBundlesSelectedRowDisplayCard
                data={dataQuery.data?.rows}
                rowSelection={rowSelection}
              ></DashboardBundlesSelectedRowDisplayCard>
            </Card>
            <DashboardBundlesBulkOptionsSelectComponent
              advancedDisabled={advancedDisabled}
              getSelectedOrderIds={getSelectedOrderIds}
              setConfirmMessage={setConfirmMessage}
              setOnConfirmFunction={setOnConfirmFunction}
              setShowConfirmation={setShowConfirmation}
              setRowSelection={setRowSelection}
              data={dataQuery.data?.rows}
              setPickupDialogOpen={setPickupDialogOpen}
              setLoading={setLoading}
            ></DashboardBundlesBulkOptionsSelectComponent>
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
                    {dataQuery.data?.rows.length === 0
                      ? "No orders"
                      : "Loading..."}
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
