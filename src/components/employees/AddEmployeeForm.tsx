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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeService } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from 'react';

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

const roles = [
  'employee',
  'admin',
  'manager',
  'team_lead',
];

const employeeFormSchema = z.object({
  // Section 1: Personal Details
  employee_id: z.string().min(1, 'Employee ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  hire_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  pan_number: z.string().optional(),

  // Section 2: Bank Details
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  branch_name: z.string().optional(),
  account_holder_name: z.string().optional(),
  
  // PF, UAN, ESI Details
  pf_number: z.string().optional(),
  uan_number: z.string().optional(),
  esi_number: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface AddEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddEmployeeForm({ onSuccess, onCancel }: AddEmployeeFormProps) {
  const { employee } = useAuth();
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);


  // Compensation table state
  const [compensationRecords, setCompensationRecords] = useState<Array<{ ctc: string; effective_date: string }>>([]);
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);
  const [compensationForm, setCompensationForm] = useState({ ctc: '', effective_date: '' });
  const [editingCompensationIndex, setEditingCompensationIndex] = useState<number | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      role: "employee",
      department: "",
      position: "",
      hire_date: new Date().toISOString().split('T')[0],
      pan_number: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      branch_name: "",
      account_holder_name: "",
      pf_number: "",
      uan_number: "",
      esi_number: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const uploadFile = async (file: File, folder: string, employeeId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}_${folder}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const onSubmit = async (formValues: EmployeeFormValues) => {
    try {
      // Try Edge Function first, fallback to direct creation if it fails
      let userId: string | undefined;

      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('create-employee-user', {
          body: {
            email: formValues.email,
            password: formValues.password,
            first_name: formValues.first_name,
            last_name: formValues.last_name,
            role: formValues.role || 'employee',
          },
        });

        if (fnError) {
          console.error('Edge Function Error:', fnError);

          // Check if it's a duplicate email error from Edge Function
          const errorMessage = fnError.message || JSON.stringify(fnError);
          console.log('Error message:', errorMessage);

          if ((errorMessage.toLowerCase().includes('user') && errorMessage.toLowerCase().includes('already')) ||
            (errorMessage.toLowerCase().includes('duplicate') && errorMessage.toLowerCase().includes('email'))) {
            toast({
              title: "Email Already Exists",
              description: `The email "${formValues.email}" is already registered. Please use a different email address.`,
              variant: "destructive",
            });
            return; // Stop execution
          }

          throw new Error(`Edge function failed: ${fnError.message ?? fnError}`);
        }

        userId = (fnData as any)?.user_id as string | undefined;
      } catch (edgeFunctionError) {
        console.warn('Edge function failed, trying direct signup:', edgeFunctionError);

        // Check if the edge function error was a duplicate email error
        const errorMessage = edgeFunctionError instanceof Error ? edgeFunctionError.message : String(edgeFunctionError);
        if ((errorMessage.toLowerCase().includes('user') && errorMessage.toLowerCase().includes('already')) ||
          (errorMessage.toLowerCase().includes('duplicate') && errorMessage.toLowerCase().includes('email'))) {
          toast({
            title: "Email Already Exists",
            description: `The email "${formValues.email}" is already registered. Please use a different email address.`,
            variant: "destructive",
          });
          return; // Stop execution
        }

        // Fallback: Direct signup (will require admin to re-login)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formValues.email,
          password: formValues.password,
          options: {
            data: {
              first_name: formValues.first_name,
              last_name: formValues.last_name,
              role: formValues.role || 'employee',
            }
          }
        });

        if (authError) {
          // Check if it's a duplicate email error
          if (authError.message.toLowerCase().includes('already registered') ||
            authError.message.toLowerCase().includes('already exists') ||
            authError.message.toLowerCase().includes('duplicate')) {
            toast({
              title: "Email Already Exists",
              description: `The email "${formValues.email}" is already registered. Please use a different email address.`,
              variant: "destructive",
            });
            return; // Stop execution
          }
          throw new Error(`Failed to create user account: ${authError.message}`);
        }

        userId = authData.user?.id;

        toast({
          title: "Note",
          description: "Employee account created. You may need to refresh and login again.",
          variant: "default",
        });
      }

      if (!userId) {
        throw new Error('Failed to get user ID from created account');
      }

      // Upload files if provided
      let aadharUrl: string | null = null;
      let panUrl: string | null = null;
      let salarySlipUrl: string | null = null;

      if (aadharFile) {
        aadharUrl = await uploadFile(aadharFile, 'aadhar', formValues.employee_id);
      }
      if (panFile) {
        panUrl = await uploadFile(panFile, 'pan', formValues.employee_id);
      }
      if (panFile) {
        panUrl = await uploadFile(panFile, 'pan', formValues.employee_id);
      }

      // Get the most recent compensation record (last one in the array)
      const latestCompensation = compensationRecords.length > 0
        ? compensationRecords[compensationRecords.length - 1]
        : null;

      // Create employee record with all the data
      const employeeData: any = {
        employee_id: formValues.employee_id,
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        email: formValues.email,
        phone: formValues.phone || null,
        role: formValues.role || 'employee',
        department: formValues.department,
        position: formValues.position,
        hire_date: formValues.hire_date,
        user_id: userId,
        password_hash: '',
        // Documents
        aadhar_document_url: aadharUrl,
        pan_document_url: panUrl,
        pan_number: formValues.pan_number || null,
        // Compensation - use the latest from compensation records
        current_ctc: latestCompensation ? parseFloat(latestCompensation.ctc) : null,
        ctc_effective_date: latestCompensation ? latestCompensation.effective_date : null,
        // Bank Details
        bank_name: formValues.bank_name || null,
        account_number: formValues.account_number || null,
        ifsc_code: formValues.ifsc_code || null,
        branch_name: formValues.branch_name || null,
        account_holder_name: formValues.account_holder_name || null,
        // PF, UAN, ESI Details
        pf_number: formValues.pf_number || null,
        uan_number: formValues.uan_number || null,
        esi_number: formValues.esi_number || null,
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


      // Save all compensation records to employee_compensation table
      if (compensationRecords.length > 0 && employeeRecord) {
        console.log('Saving', compensationRecords.length, 'compensation records for employee:', employeeRecord.id);
        console.log('Compensation records to save:', compensationRecords);

        const compensationInserts = compensationRecords.map(record => ({
          employee_id: employeeRecord.id,
          ctc: parseFloat(record.ctc),
          effective_date: record.effective_date
        }));

        console.log('Prepared inserts:', compensationInserts);

        const { data: insertedData, error: compensationError } = await supabase
          .from('employee_compensation' as any)
          .insert(compensationInserts)
          .select();

        if (compensationError) {
          console.error('Compensation records creation error:', compensationError);
          // Don't throw error, just log it - employee is already created
          toast({
            title: "Warning",
            description: "Employee created but compensation history may not be saved completely.",
            variant: "default",
          });
        } else {
          console.log('Successfully saved', insertedData?.length || 0, 'compensation records');
        }
      } else {
        console.log('No compensation records to save');
      }

      // Automatically generate salary slips for each compensation record
      if (employeeRecord && compensationRecords.length > 0) {
        try {
          console.log(`Generating ${compensationRecords.length} salary slips for new employee`);
          console.log('Employee record ID:', employeeRecord.id);
          console.log('Employee record employee_id:', employeeRecord.employee_id);
          console.log('Compensation records:', compensationRecords);

          // Create a salary slip for each compensation record
          const salarySlipsToInsert = compensationRecords.map((compensation, index) => {
            // Parse effective_date (YYYY-MM-DD) directly to avoid timezone issues
            const [yearStr, monthStr] = compensation.effective_date.split('-');
            const slipYear = parseInt(yearStr);
            const slipMonth = parseInt(monthStr);

            // Calculate pay period dates based on effective date
            // Note: Using local time for start/end dates then converting to ISO
            const pay_period_start = new Date(slipYear, slipMonth - 1, 1).toISOString();
            const pay_period_end = new Date(slipYear, slipMonth, 0, 23, 59, 59).toISOString();

            // NEW CALCULATION RULES
            const ctc_yearly = parseFloat(compensation.ctc);

            // 1. Employer PF = ₹1,800 per month (₹21,600 yearly)
            const pf_employer = 1800;
            const employer_pf_yearly = 21600;

            // 2. Gross Salary (Yearly) = CTC – 21,600
            const gross_yearly = ctc_yearly - employer_pf_yearly;

            // 3. Gross Salary (Monthly) = Gross (Yearly) / 12
            const gross_monthly = Math.round(gross_yearly / 12);

            // 4. Basic = 50% of Gross Monthly
            const basic_salary = Math.round(gross_monthly * 0.5);

            // 5. HRA = 40% of Basic
            const hra = Math.round(basic_salary * 0.4);

            // 6. Project Allowance = Gross – (Basic + HRA)
            const special_allowance = gross_monthly - (basic_salary + hra);

            // 7. Other allowances are 0
            const transport_allowance = 0; // Conveyance
            const medical_allowance = 0;
            const performance_bonus = 0; // Bonus
            const other_allowances = 0; // LTA, Meal Allowance, etc.

            const gross_earnings = gross_monthly;

            // Calculate deductions
            // 8. Employee PF = ₹1,800
            const pf_employee = 1800;

            // 9. Professional Tax = ₹150
            const professional_tax = 150;

            // 10. Income Tax = 0 (shown as "As applicable")
            const income_tax = 0;

            const total_deductions = pf_employee + professional_tax + income_tax;
            const net_salary = gross_earnings - total_deductions;

            return {
              employee_id: employeeRecord.employee_id,
              employee_name: `${formValues.first_name} ${formValues.last_name}`,
              employee_email: formValues.email,
              department: formValues.department || '',
              position: formValues.position || '',
              month: slipMonth,
              year: slipYear,
              pay_period_start,
              pay_period_end,
              working_days: 22,
              present_days: 22,
              basic_salary,
              hra,
              transport_allowance,
              medical_allowance,
              special_allowance,
              performance_bonus,
              overtime_hours: 0,
              overtime_rate: 0,
              overtime_amount: 0,
              other_allowances,
              gross_earnings,
              pf_employee,
              esi_employee: 0,
              professional_tax,
              income_tax,
              medical_insurance: 0,
              loan_deduction: 0,
              advance_deduction: 0,
              late_deduction: 0,
              other_deductions: 0,
              total_deductions,
              net_salary,
              pf_employer,
              esi_employer: 0,
              status: 'processed' as const,
              generated_date: new Date().toISOString(),
              paid_date: null,
            };
          });

          console.log('Creating salary slip with employee_id:', employeeRecord.employee_id);
          console.log('Employee record:', employeeRecord);
          console.log(`Salary slips data to insert (${salarySlipsToInsert.length} slips):`, salarySlipsToInsert);

          const { data: insertedSlips, error: salarySlipError } = await supabase
            .from('salary_slips')
            .insert(salarySlipsToInsert)
            .select();

          if (salarySlipError) {
            console.error('Error creating salary slips:', salarySlipError);
            console.error('Error details:', JSON.stringify(salarySlipError, null, 2));
            toast({
              title: "Warning",
              description: `Employee created but salary slip generation failed: ${salarySlipError.message}`,
              variant: "default",
            });
          } else {
            console.log(`Successfully created ${insertedSlips?.length || 0} salary slips for employee:`, employeeRecord.employee_id);
            console.log('Inserted slips:', insertedSlips);
            toast({
              title: "Salary Slips Generated",
              description: `${insertedSlips?.length || 0} salary slip(s) created successfully based on compensation effective dates.`,
              variant: "default",
            });
          }
        } catch (slipError) {
          console.error('Error in salary slip generation:', slipError);
          toast({
            title: "Warning",
            description: "Employee created but salary slip generation encountered an error.",
            variant: "default",
          });
        }
      } else {
        console.log('Skipping salary slip generation - missing employeeRecord or no compensation records');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="h-8 w-1 bg-gradient-primary rounded-full" />
            <h3 className="text-lg font-semibold">Personal Details</h3>
          </div>

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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer, Manager" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>

          {/* Document Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aadhar Card</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                  className="flex-1"
                />
                {aadharFile && <FileText className="h-4 w-4 text-green-600" />}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Card</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                  className="flex-1"
                />
                {panFile && <FileText className="h-4 w-4 text-green-600" />}
              </div>
            </div>
          </div>
        </div>

        {/* PAN Number Field */}
        <div className="pt-2">
          <FormField
            control={form.control}
            name="pan_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABCDE1234F" {...field} disabled={isLoading} className="uppercase" maxLength={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Section 2: Compensation Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-gradient-primary rounded-full" />
              <h3 className="text-lg font-semibold">Compensation Details</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCompensationDialogOpen(true);
                setEditingCompensationIndex(null);
                setCompensationForm({ ctc: '', effective_date: '' });
              }}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Compensation
            </Button>
          </div>

          {compensationRecords.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No compensation records added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Compensation" to add CTC details</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CTC</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compensationRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">₹{parseFloat(record.ctc).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{new Date(record.effective_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCompensationIndex(index);
                            setCompensationForm(record);
                            setCompensationDialogOpen(true);
                          }}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newRecords = compensationRecords.filter((_, i) => i !== index);
                            setCompensationRecords(newRecords);
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}


        </div>

        {/* Section 3: Bank Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="h-8 w-1 bg-gradient-primary rounded-full" />
            <h3 className="text-lg font-semibold">Bank Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="account_holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="As per bank records" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., State Bank of India" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ifsc_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SBIN0001234" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branch_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Branch, City Name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* PF, UAN, ESI Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <FormField
              control={form.control}
              name="pf_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TN/ABC/12345/678" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uan_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF UAN</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 100012345678" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="esi_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ESI No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1234567890123456" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-gradient-primary hover:opacity-90">
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

      {/* Compensation Dialog - Outside form but inside Form component */}
      <Dialog open={compensationDialogOpen} onOpenChange={setCompensationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompensationIndex !== null ? 'Edit Compensation' : 'Add Compensation'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CTC Amount</label>
              <Input
                type="number"
                placeholder="e.g., 500000"
                value={compensationForm.ctc}
                onChange={(e) => setCompensationForm({ ...compensationForm, ctc: e.target.value })}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Effective Date</label>
              <Input
                type="date"
                value={compensationForm.effective_date}
                onChange={(e) => setCompensationForm({ ...compensationForm, effective_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompensationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (compensationForm.ctc && compensationForm.effective_date) {
                    if (editingCompensationIndex !== null) {
                      // Edit existing
                      const newRecords = [...compensationRecords];
                      newRecords[editingCompensationIndex] = compensationForm;
                      setCompensationRecords(newRecords);
                    } else {
                      // Add new
                      setCompensationRecords([...compensationRecords, compensationForm]);
                    }
                    setCompensationDialogOpen(false);
                    setCompensationForm({ ctc: '', effective_date: '' });
                    setEditingCompensationIndex(null);
                  }
                }}
              >
                {editingCompensationIndex !== null ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Form >
  );
}