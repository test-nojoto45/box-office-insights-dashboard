
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  return (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
    </Button>
  );
};
