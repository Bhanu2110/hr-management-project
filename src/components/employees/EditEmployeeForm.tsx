import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeService, Employee } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const departments = [
  'Engineering',
  'Marketing',
  'Human Resources',
  'Finance',
  'Sales',
  'Operations',
  'IT',
  'Customer Support',
];

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
];

const editEmployeeFormSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  hire_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  phone_number: z.string().optional(),
  pan_number: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeFormSchema>;

interface EditEmployeeFormProps {
  employee: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditEmployeeForm({ employee, onSuccess, onCancel }: EditEmployeeFormProps) {
  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeFormSchema),
    defaultValues: {
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      hire_date: employee.hire_date.split('T')[0], // Convert to date format
      phone_number: employee.phone_number || '',
      pan_number: employee.pan_number || '',
      status: employee.status,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (formValues: EditEmployeeFormValues) => {
    try {
      await employeeService.updateEmployee(employee.id, formValues);

      toast({
        title: "Success",
        description: "Employee updated successfully.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="EMP-001" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pan_number"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>PAN Number</FormLabel>
              <FormControl>
                <Input placeholder="ABCDE1234F" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Software Engineer" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hire_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Employee'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
