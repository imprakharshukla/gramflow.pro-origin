"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useUser } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw,
} from "lucide-react";
import { z } from "zod";

import { type CompleteOrders } from "@gramflow/db/prisma/zod";
import {
  Button,
  Card,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Input,
  Loader,
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
import { AppConfig } from "@gramflow/utils";

import DashboardBulkOptionsSelectComponent from "./components/dashboadBulkOptionsSelect";
import DashboardBulkCsvDownloadButton from "./components/dashboardBulkCsvDownloadButton";
import DashboardConfirmModal from "./components/dashboardConfirmModal";
import DashboardSelectedRowDisplayCard from "./components/dashboardSelectedRowDisplayCard";

interface DataTablePaginationProps<TData> {
  table: TsTable<TData>;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export type NullableVoidFunction = (() => void) | null;
interface ResponseType {
  orders: CompleteOrders[];
  count: number;
}
export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
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

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  };

  const fetchData = async (options: {
    pageIndex: number;
    pageSize: number;
  }) => {
    const response = await fetch(
      `/api/admin?page=${pageIndex}&pageSize=${pageSize}`,
    );
    if (response.ok) {
      const data = (await response.json()) as ResponseType;
      return {
        rows: data.orders,
        pageCount: Math.ceil(data.count / options.pageSize),
      };
    } else {
      throw new Error("Something went wrong");
    }
  };

  const dataQuery = useQuery(
    ["allOrders", fetchDataOptions],
    () => fetchData(fetchDataOptions),
    { keepPreviousData: true },
  );

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
    state: {
      sorting,
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

  return (
    <div>
      <DashboardConfirmModal
        showConfimation={showConfimation}
        setShowConfirmation={setShowConfirmation}
        confirmMessage={confirmMessage}
        onConfirmFunction={onConfirmFunction}
      ></DashboardConfirmModal>
      <Card className={"flex w-fit items-center justify-center lg:hidden"}>
        <DashboardSelectedRowDisplayCard
          data={dataQuery.data?.rows}
          rowSelection={rowSelection}
        />
      </Card>

      <div className="flex flex-col py-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Filter Order IDs..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="order-2 max-w-sm md:order-1"
        />
        <div
          className={
            "order-1 mb-4 flex items-center gap-x-3 md:order-2 md:mb-0"
          }
        >
          {(loading || dataQuery.isLoading || dataQuery.isFetching) && (
            <Loader />
          )}

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
            {<RefreshCcw className="h-4 w-4" />}
          </Button>

          <>
            <Card className={"hidden items-center justify-center lg:flex "}>
              <DashboardSelectedRowDisplayCard
                data={dataQuery.data?.rows}
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
              data={dataQuery.data?.rows}
              setLoading={setLoading}
            ></DashboardBulkOptionsSelectComponent>
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
