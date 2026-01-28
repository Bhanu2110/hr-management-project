import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const leaveFormSchema = z.object({
  leave_type: z.string().min(1, "Leave type is required"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),
  is_half_day: z.boolean().default(false),
  half_day_type: z.enum(["first_half", "second_half"]).optional(),
  reason: z.string().min(1, "Reason is required"),
}).refine((data) => {
  // For half-day leave, start and end date must be the same
  if (data.is_half_day) {
    return data.start_date.getTime() === data.end_date.getTime();
  }
  return data.end_date >= data.start_date;
}, {
  message: "For half-day leave, start and end date must be the same",
  path: ["end_date"],
}).refine((data) => {
  // If half-day is selected, half_day_type must be provided
  if (data.is_half_day) {
    return !!data.half_day_type;
  }
  return true;
}, {
  message: "Please select 1st Half or 2nd Half",
  path: ["half_day_type"],
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

interface LeaveApplicationFormProps {
  onLeaveSubmitted?: () => void;
}

export function LeaveApplicationForm({ onLeaveSubmitted }: LeaveApplicationFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { employee } = useAuth();
  const { toast } = useToast();

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leave_type: "",
      start_date: undefined,
      end_date: undefined,
      is_half_day: false,
      half_day_type: undefined,
      reason: "",
    },
  });

  const isHalfDay = form.watch("is_half_day");
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");

  // Auto-sync end_date when half-day is enabled and start_date changes
  useEffect(() => {
    if (isHalfDay && startDate) {
      form.setValue("end_date", startDate, { shouldValidate: true });
    }
  }, [isHalfDay, startDate, form]);

  // Reset end_date if it's before the new start_date
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      form.setValue("end_date", undefined, { shouldValidate: true });
    }
  }, [startDate, endDate, form]);

  const calculateDays = (startDate: Date, endDate: Date, isHalfDay: boolean) => {
    if (isHalfDay) {
      return 0.5; // Half-day = 4 hours = 0.5 days
    }
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const onSubmit = async (values: LeaveFormValues) => {
    if (!employee?.id) {
      toast({
        title: "Error",
        description: "Employee information not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const days = calculateDays(values.start_date, values.end_date, values.is_half_day);
      
      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          employee_id: employee.id,
          leave_type: values.is_half_day 
            ? `${values.leave_type} (${values.half_day_type === 'first_half' ? '1st Half' : '2nd Half'})` 
            : values.leave_type,
          start_date: format(values.start_date, 'yyyy-MM-dd'),
          end_date: format(values.end_date, 'yyyy-MM-dd'),
          days,
          reason: values.reason,
          status: 'pending'
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      handleClose();
      onLeaveSubmitted?.();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          handleClose();
        }
      }}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_half_day"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Auto-set end date to start date when half-day is selected
                        if (checked && startDate) {
                          form.setValue("end_date", startDate);
                        }
                        // Clear half_day_type when unchecked
                        if (!checked) {
                          form.setValue("half_day_type", undefined);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Half-Day Leave
                    </FormLabel>
                    <FormDescription>
                      Apply for 4 hours (0.5 day) leave on a single date
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isHalfDay && (
              <FormField
                control={form.control}
                name="half_day_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Half-Day Type</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <label 
                          className={cn(
                            "flex items-center gap-3 rounded-md border p-4 cursor-pointer flex-1 transition-colors",
                            field.value === "first_half" 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="half_day_type"
                            value="first_half"
                            checked={field.value === "first_half"}
                            onChange={() => field.onChange("first_half")}
                            className="h-4 w-4 accent-primary"
                          />
                          <div>
                            <div className="font-medium">1st Half</div>
                            <div className="text-sm text-muted-foreground">Morning session</div>
                          </div>
                        </label>
                        <label 
                          className={cn(
                            "flex items-center gap-3 rounded-md border p-4 cursor-pointer flex-1 transition-colors",
                            field.value === "second_half" 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="half_day_type"
                            value="second_half"
                            checked={field.value === "second_half"}
                            onChange={() => field.onChange("second_half")}
                            className="h-4 w-4 accent-primary"
                          />
                          <div>
                            <div className="font-medium">2nd Half</div>
                            <div className="text-sm text-muted-foreground">Afternoon session</div>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date {isHalfDay && "(Same as start)"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild disabled={isHalfDay}>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled={isHalfDay}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              isHalfDay && "opacity-60 cursor-not-allowed"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide reason for leave request..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
