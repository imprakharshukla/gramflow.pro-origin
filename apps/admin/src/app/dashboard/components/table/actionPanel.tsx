import { Status } from "@gramflow/db/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Label, Popover, PopoverTrigger, PopoverContent, DialogFooter, LoadingButton, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Button, Loader, Calendar, CardContent } from "@gramflow/ui";
import { cn } from "@gramflow/utils";
import { format, addDays } from "date-fns";
import { RefreshCcw, CalendarIcon, ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import useRestClient from "~/features/hooks/use-rest-client";
import { DatePickerWithRange } from "~/features/ui/components/dateRangePicker";
import { NullableVoidFunction } from "../../data-table";
import DashboardBulkOptionsSelectComponent from "../dashboadBulkOptionsSelect";
import DashboardBulkCsvDownloadButton from "../dashboardBulkCsvDownloadButton";
import DashboardSelectedRowDisplayCard from "../dashboardSelectedRowDisplayCard";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import DashboardConfirmModal from "../dashboardConfirmModal";
import { motion } from "framer-motion"
import { debounce } from "lodash"
import { fontSans } from "~/lib/fonts";
export function ActionPanel<TData>({
    table,
    dateRange,
    setDateRange,
    refetchData,
    isLoading,
    isFetching,
    isRefetching,
    advancedDisabled,
    getSelectedOrderIds,
    loading,
    setRowSelection,
    data,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    searchInputRef,
    config,
}: {
    table: Table<TData>;
    dateRange: DateRange;
    setDateRange: Dispatch<SetStateAction<DateRange>>;
    refetchData: () => void;
    isLoading: boolean;
    isFetching: boolean;
    isRefetching: boolean;
    advancedDisabled: boolean;
    globalFilter: string;
    setGlobalFilter: Dispatch<SetStateAction<string>>,
    getSelectedOrderIds: () => string[];
    loading: boolean;
    searchInputRef: React.Ref<HTMLInputElement> | null;
    setRowSelection: Dispatch<SetStateAction<{}>>;
    data: TData[];
    rowSelection: {};
    config?: {
        isBulkActionDisabled: boolean;
        isCsvDownloadDisabled: boolean;
    }
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [onConfirmFunction, setOnConfirmFunction] =
        useState<NullableVoidFunction>(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    return (
        <>
            <DashboardConfirmModal
                showConfimation={showConfirmation}
                setShowConfirmation={setShowConfirmation}
                confirmMessage={confirmMessage}
                onConfirmFunction={onConfirmFunction}
            ></DashboardConfirmModal>
            <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 md:grid-rows-1 gap-2 py-4">
                <div className="flex md:flex-row flex-col gap-2">
                    <div className="justify-self-start">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Filter <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={fontSans.className} align="start">
                                {
                                    Object.keys(Status).map((status) => (
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            className="capitalize"
                                            checked={table.getColumn("status")?.getFilterValue() === status}
                                            onCheckedChange={(value) => {
                                                table.getColumn("status")?.setFilterValue(value ? status : undefined)
                                            }}
                                        >
                                            {status.slice(0, 1).toUpperCase() +
                                                status.slice(1).toLowerCase().replaceAll("_", " ")}
                                        </DropdownMenuCheckboxItem>
                                    ))
                                }
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <DatePickerWithRange
                        className="w-fit"
                        onClickFunction={() => {
                            refetchData();
                        }}
                        date={dateRange}
                        setDate={setDateRange}
                    />
                </div>

                <div className="flex md:flex-row flex-col justify-start gap-2 md:justify-self-end justify-self-start">
                    <Input
                        placeholder={`Search Orders`}
                        ref={searchInputRef}
                        onChange={(event) => {
                            // debounce(() => {
                            setGlobalFilter(event.target.value);
                            // }, 200);

                        }}
                        className="w-fit"
                    />

                    <div className="flex items-center gap-2">
                        <DashboardBulkOptionsSelectComponent
                            advancedDisabled={advancedDisabled}
                            getSelectedOrderIds={getSelectedOrderIds}
                            setConfirmMessage={setConfirmMessage}
                            setOnConfirmFunction={setOnConfirmFunction}
                            setShowConfirmation={setShowConfirmation}
                            setRowSelection={setRowSelection}
                            data={data}
                            setPickupDialogOpen={setPickupDialogOpen}
                            setLoading={setLocalLoading}
                        ></DashboardBulkOptionsSelectComponent>

                        <Button
                            disabled={isLoading || isFetching}
                            onClick={async () => {
                                refetchData();
                            }}
                            variant="outline"
                        >
                            {!(loading || isLoading || isFetching || isRefetching) ? (
                                <RefreshCcw className={"text-sm"} size={16} />
                            ) : (
                                <Loader size={16} />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className={"flex items-center gap-1 md:justify-self-end md:gap-2 md:flex-row-reverse"}
            >
                <>
                    <PickupComponent rowSelection={rowSelection} pickupDialogOpen={pickupDialogOpen} setPickupDialogOpen={setPickupDialogOpen} order_ids={getSelectedOrderIds()} />
                    {/* {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <DashboardBulkCsvDownloadButton
                            advandcedDisabled={advancedDisabled}
                            getSelectedOrderIds={getSelectedOrderIds}
                            setConfirmMessage={setConfirmMessage}
                            setShowConfirmation={setShowConfirmation}
                            setOnConfirmFunction={setOnConfirmFunction}
                        ></DashboardBulkCsvDownloadButton>
                    )} */}
                </>
            </div>
        </>

    )
}



const PickupComponent = ({
    pickupDialogOpen,
    rowSelection,
    setPickupDialogOpen,
    order_ids
}: {
    rowSelection: {};
    pickupDialogOpen: boolean;
    setPickupDialogOpen: (value: boolean) => void;
    order_ids: string[]
}) => {
    const [expectedPackageCount, setExpectedPackageCount] = useState(rowSelection ? Object.keys(rowSelection).length : 0);
    useEffect(() => {
        if (pickupDialogOpen) {
            setExpectedPackageCount(rowSelection ? Object.keys(rowSelection).length : 0)
        }
    }, [pickupDialogOpen])
    const [date, setDate] = useState<Date>(
        new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
    );
    const { client } = useRestClient()
    const { mutate: createPickupMutate, isLoading: isCreatePickupMutating } = client.ship.createPickup.useMutation()
    return (
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
                                        new Date().getHours() >= 14 ? new Date() : addDays(new Date(), 1),
                                    ]}
                                    selected={date}
                                    onDayClick={setDate}
                                    initialFocus
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
                            value={expectedPackageCount}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (value !== "0") {
                                    setExpectedPackageCount(Number(value));
                                }
                            }}
                            placeholder="Estimated Package Count"
                        />
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <LoadingButton
                        loading={isCreatePickupMutating}
                        onClick={() => {
                            createPickupMutate({
                                body: {
                                    expected_package_count: expectedPackageCount,
                                    pickup_date: format(date, "yyyy-MM-dd"),
                                    order_ids: order_ids,
                                }
                            })
                        }}
                    >
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}