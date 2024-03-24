import * as React from "react";
import { addDays, format, subDays } from "date-fns";
import { SetStateAction } from "jotai";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@gramflow/ui";
import { DateRange } from "react-day-picker";
import { Button } from "@gramflow/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@gramflow/ui";
import { cn } from "@gramflow/utils";
import { fontSans } from "~/lib/fonts";

export function DatePickerWithRange({
    className,
    date,
    setDate,
    onClickFunction,
}: {
    className?: string;
    date: DateRange | undefined;
    setDate: React.Dispatch<SetStateAction<DateRange>>;
    onClickFunction: () => void;
}) {
    const [PopoverOpen, setPopoverOpen] = React.useState(false);
    return (
        <div className={cn("grid gap-2", className, fontSans.className)}>
            <Popover open={PopoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        className={fontSans.className}
                        numberOfMonths={2}
                    />
                    <div className="p-3 w-full flex justify-end">
                        <Button onClick={() => {
                            setPopoverOpen(false);
                            onClickFunction();
                        }}>Search</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
