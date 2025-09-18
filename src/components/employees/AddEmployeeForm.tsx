import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
import { employeeService } from "@/services/api";
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

const employeeFormSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  pan_number: z.string().min(10, 'PAN number must be 10 characters').max(10, 'PAN number must be 10 characters').regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  hire_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  form16_file: z.any().optional(),
  financial_year: z.string().min(1, "Financial year is required"),
  quarter: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'), // New password field
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface AddEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddEmployeeForm({ onSuccess, onCancel }: AddEmployeeFormProps) {
  const { employee } = useAuth();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      pan_number: "",
      department: "",
      position: "",
      hire_date: new Date().toISOString().split('T')[0], // Default to today
      form16_file: undefined,
      financial_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      quarter: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (formValues: EmployeeFormValues) => {
    try {
      // Try Edge Function first, fallback to direct creation if it fails
      let userId: string | undefined;
      
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('create-employee-user', {
          body: {
            email: formValues.email,
            password: formValues.password, // Use the new password field
            first_name: formValues.first_name,
            last_name: formValues.last_name,
            role: 'employee',
          },
        });

        if (fnError) {
          throw new Error(`Edge function failed: ${fnError.message ?? fnError}`);
        }

        userId = (fnData as any)?.user_id as string | undefined;
      } catch (edgeFunctionError) {
        console.warn('Edge function failed, trying direct signup:', edgeFunctionError);
        
        // Fallback: Direct signup (will require admin to re-login)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formValues.email,
          password: formValues.password, // Use the new password field
          options: {
            data: {
              first_name: formValues.first_name,
              last_name: formValues.last_name,
              role: 'employee',
            }
          }
        });

        if (authError) {
          throw new Error(`Failed to create user account: ${authError.message}`);
        }

        userId = authData.user?.id;
        
        // Note: Admin will need to re-login after this
        toast({
          title: "Note",
          description: "Employee account created. You may need to refresh and login again.",
          variant: "default",
        });
      }

      if (!userId) {
        throw new Error('Failed to get user ID from created account');
      }

      // Create employee record with the auth user ID
      const employeeData = {
        employee_id: formValues.employee_id,
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        email: formValues.email,
        pan_number: formValues.pan_number.toUpperCase(),
        department: formValues.department,
        position: formValues.position,
        hire_date: formValues.hire_date,
        user_id: userId,
        password_hash: '' // Placeholder to satisfy not-null constraint. Review database schema for password_hash column.
      };

      console.log('Creating employee with data:', employeeData);
      
      const { data: employeeRecord, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (error) {
        console.error('Employee creation error:', error);
        throw new Error(error.message);
      }

      // Handle Form 16 upload if file is provided
      if (formValues.form16_file && formValues.form16_file.length > 0) {
        const file = formValues.form16_file[0];
        const fileName = `form16_${employeeRecord.id}_${formValues.financial_year}.pdf`;
        const filePath = `form16/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Form 16 upload error:', uploadError);
          // Don't fail the entire process, just warn
          toast({
            title: "Warning",
            description: "Employee created but Form 16 upload failed. You can upload it later.",
            variant: "destructive",
          });
        } else {
          // Save Form 16 record to database
          const { error: form16Error } = await supabase
            .from('form16_documents')
            .insert([{
              employee_id: employeeRecord.id,
              file_name: fileName,
              file_path: filePath,
              file_size: file.size,
              financial_year: formValues.financial_year,
              quarter: formValues.quarter || null,
              uploaded_by: employee?.id, // Current admin's ID
            }]);

          if (form16Error) {
            console.error('Form 16 record creation error:', form16Error);
          }
        }
      }

      toast({
        title: "Success",
        description: `Employee added successfully. They can now login using their email address and the password you set.`,
        duration: 5000,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to add employee",
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
          name="password"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Set employee password" type="password" {...field} disabled={isLoading} />
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
                <Input 
                  placeholder="ABCDE1234F" 
                  {...field} 
                  disabled={isLoading}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={10}
                />
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                  <Input placeholder="e.g., Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hire_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hire Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="financial_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Financial Year (for Form 16)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="2023-2024" 
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
            name="form16_file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Form 16 Document (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onChange(e.target.files)}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Upload employee's Form 16 document (PDF, DOC, DOCX)
                </p>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="quarter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quarter</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (April - June)</SelectItem>
                    <SelectItem value="Q2">Q2 (July - September)</SelectItem>
                    <SelectItem value="Q3">Q3 (October - December)</SelectItem>
                    <SelectItem value="Q4">Q4 (January - March)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                Adding...
              </>
            ) : (
              'Add Employee'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
