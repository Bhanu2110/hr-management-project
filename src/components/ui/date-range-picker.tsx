import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    month?: Date
    onMonthChange?: (date: Date) => void
    isMonthFiltered?: boolean
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
    month,
    onMonthChange,
    isMonthFiltered,
}: DatePickerWithRangeProps) {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(month || new Date());

    const handleMonthChange = (newMonth: Date) => {
        setCurrentMonth(newMonth);
        if (onMonthChange) {
            onMonthChange(newMonth);
        }
    };

    const getDisplayText = () => {
        if (date?.from) {
            if (date.to) {
                return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
            }
            return format(date.from, "LLL dd, y");
        }
        if (isMonthFiltered && currentMonth) {
            return format(currentMonth, "MMMM yyyy");
        }
        return "Pick a date";
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover modal={false}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && !isMonthFiltered && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {getDisplayText()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" preventFocusSteal>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        month={currentMonth}
                        onMonthChange={handleMonthChange}
                        className="pointer-events-auto"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
