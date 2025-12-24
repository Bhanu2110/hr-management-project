import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  isMonthFiltered?: boolean;
}

export function DatePicker({ date, setDate, className, month, onMonthChange, isMonthFiltered }: DatePickerProps) {
  const getDisplayText = () => {
    if (date) {
      return format(date, "PPP"); // Show full date when a specific date is selected
    }
    if (isMonthFiltered && month) {
      return format(month, "MMMM yyyy"); // Show month name when filtering by month
    }
    return "Pick a date";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && !isMonthFiltered && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month}
          onMonthChange={onMonthChange}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
