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
import { RequiredLabel } from "@/components/ui/required-label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeService, Employee } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2, FileText, ExternalLink, Plus, Edit, Trash2, User, Briefcase, Building, GraduationCap, Award } from "lucide-react";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  // Section 1: Personal Details
  employee_id: z.string().min(1, 'Employee ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  hire_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  status: z.string().min(1, 'Status is required'),
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

type EditEmployeeFormValues = z.infer<typeof editEmployeeFormSchema>;

interface EditEmployeeFormProps {
  employee: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditEmployeeForm({ employee, onSuccess, onCancel }: EditEmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  // Education certificate states
  const [tenthCertFile, setTenthCertFile] = useState<File | null>(null);
  const [interCertFile, setInterCertFile] = useState<File | null>(null);
  const [degreeCertFile, setDegreeCertFile] = useState<File | null>(null);

  // Professional certificate states
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Track existing document URLs (for delete functionality)
  const [aadharUrl, setAadharUrl] = useState<string | null>((employee as any).aadhar_document_url || null);
  const [panUrl, setPanUrl] = useState<string | null>((employee as any).pan_document_url || null);
  const [tenthCertUrl, setTenthCertUrl] = useState<string | null>((employee as any).tenth_certificate_url || null);
  const [interCertUrl, setInterCertUrl] = useState<string | null>((employee as any).inter_certificate_url || null);
  const [degreeCertUrl, setDegreeCertUrl] = useState<string | null>((employee as any).degree_certificate_url || null);
  const [resumeUrl, setResumeUrl] = useState<string | null>((employee as any).resume_url || null);

  // Compensation table state
  const [compensationRecords, setCompensationRecords] = useState<Array<{ ctc: string; effective_date: string }>>([]);
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);
  const [compensationForm, setCompensationForm] = useState({ ctc: '', effective_date: '' });
  const [editingCompensationIndex, setEditingCompensationIndex] = useState<number | null>(null);

  // Delete document helper
  const handleDeleteDocument = async (docType: 'aadhar' | 'pan' | 'tenth' | 'inter' | 'degree' | 'resume') => {
    const urlMap = {
      aadhar: aadharUrl,
      pan: panUrl,
      tenth: tenthCertUrl,
      inter: interCertUrl,
      degree: degreeCertUrl,
      resume: resumeUrl
    };
    const fieldMap = {
      aadhar: 'aadhar_document_url',
      pan: 'pan_document_url',
      tenth: 'tenth_certificate_url',
      inter: 'inter_certificate_url',
      degree: 'degree_certificate_url',
      resume: 'resume_url'
    };

    const url = urlMap[docType];
    if (!url) return;

    try {
      // Extract file path from URL and delete from storage
      const urlParts = url.split('/storage/v1/object/public/employee-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('employee-documents').remove([filePath]);
      }

      // Update database to remove the URL
      const { error } = await supabase
        .from('employees')
        .update({ [fieldMap[docType]]: null })
        .eq('id', employee.id);

      if (error) throw error;

      // Update local state
      switch (docType) {
        case 'aadhar': setAadharUrl(null); break;
        case 'pan': setPanUrl(null); break;
        case 'tenth': setTenthCertUrl(null); break;
        case 'inter': setInterCertUrl(null); break;
        case 'degree': setDegreeCertUrl(null); break;
        case 'resume': setResumeUrl(null); break;
      }

      toast({ title: "Success", description: "Document deleted successfully" });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const handleViewDocument = async (url: string) => {
    try {
      const urlParts = url.split('/storage/v1/object/public/employee-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { data, error } = await supabase.storage
          .from('employee-documents')
          .createSignedUrl(filePath, 60);
        if (error) throw error;
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to open document", variant: "destructive" });
    }
  };
  // Load existing compensation records from database
  useEffect(() => {
    const loadCompensationRecords = async () => {
      if (employee.id) {
        console.log('Loading compensation records for employee:', employee.id);

        const { data, error } = await supabase
          .from('employee_compensation' as any)
          .select('*')
          .eq('employee_id', employee.id)
          .order('effective_date', { ascending: true });

        console.log('Compensation query result:', { data, error });

        if (!error && data && data.length > 0) {
          console.log('Found', data.length, 'compensation records in database');
          const records = data.map((record: any) => ({
            ctc: record.ctc.toString(),
            effective_date: record.effective_date
          }));
          setCompensationRecords(records);
        } else {
          console.log('No compensation records in database, using fallback from employee table');
          // Fallback to employee table data if no records in compensation table
          const empData = employee as any;
          if (empData.current_ctc && empData.ctc_effective_date) {
            setCompensationRecords([{
              ctc: empData.current_ctc.toString(),
              effective_date: empData.ctc_effective_date.split('T')[0]
            }]);
          }
        }
      }
    };

    loadCompensationRecords();
  }, [employee]);

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeFormSchema),
    defaultValues: {
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      role: (employee as any).role || '',
      department: employee.department,
      position: employee.position,
      hire_date: employee.hire_date.split('T')[0],
      status: employee.status,
      pan_number: employee.pan_number || '',
      bank_name: (employee as any).bank_name || '',
      account_number: (employee as any).account_number || '',
      ifsc_code: (employee as any).ifsc_code || '',
      branch_name: (employee as any).branch_name || '',
      account_holder_name: (employee as any).account_holder_name || '',
      pf_number: (employee as any).pf_number || '',
      uan_number: (employee as any).uan_number || '',
      esi_number: (employee as any).esi_number || '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  const uploadFile = async (file: File, folder: string, employeeId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      // Use folder path for filename but replace slashes with underscores to avoid nested paths in filename
      const sanitizedFolder = folder.replace(/\//g, '_');
      const fileName = `${employeeId}_${sanitizedFolder}_${Date.now()}.${fileExt}`;
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

  const onSubmit = async (formValues: EditEmployeeFormValues) => {
    try {
      // Upload new files if provided
      let aadharUrl: string | null | undefined = (employee as any).aadhar_document_url;
      let panUrl: string | null | undefined = (employee as any).pan_document_url;
      let tenthCertUrl: string | null | undefined = (employee as any).tenth_certificate_url;
      let interCertUrl: string | null | undefined = (employee as any).inter_certificate_url;
      let degreeCertUrl: string | null | undefined = (employee as any).degree_certificate_url;
      let resumeUrlValue: string | null | undefined = (employee as any).resume_url;

      if (aadharFile) {
        aadharUrl = await uploadFile(aadharFile, 'aadhar', formValues.employee_id);
      }
      if (panFile) {
        panUrl = await uploadFile(panFile, 'pan', formValues.employee_id);
      }
      if (tenthCertFile) {
        tenthCertUrl = await uploadFile(tenthCertFile, 'certificates/tenth', formValues.employee_id);
      }
      if (interCertFile) {
        interCertUrl = await uploadFile(interCertFile, 'certificates/inter', formValues.employee_id);
      }
      if (degreeCertFile) {
        degreeCertUrl = await uploadFile(degreeCertFile, 'certificates/degree', formValues.employee_id);
      }
      if (resumeFile) {
        resumeUrlValue = await uploadFile(resumeFile, 'professional/resume', formValues.employee_id);
      }

      // Get the most recent compensation record (last one in the array)
      const latestCompensation = compensationRecords.length > 0
        ? compensationRecords[compensationRecords.length - 1]
        : null;

      // Prepare update data
      const updateData: any = {
        ...formValues,
        aadhar_document_url: aadharUrl,
        pan_document_url: panUrl,
        tenth_certificate_url: tenthCertUrl,
        inter_certificate_url: interCertUrl,
        degree_certificate_url: degreeCertUrl,
        resume_url: resumeUrlValue,
        pan_number: formValues.pan_number || null,
        // Use compensation records instead of form fields
        current_ctc: latestCompensation ? parseFloat(latestCompensation.ctc) : null,
        ctc_effective_date: latestCompensation ? latestCompensation.effective_date : null,
        // PF, UAN, ESI Details
        pf_number: formValues.pf_number || null,
        uan_number: formValues.uan_number || null,
        esi_number: formValues.esi_number || null,
      };

      await employeeService.updateEmployee(employee.id, updateData);

      // IMPORTANT: If employee_id has changed, update all existing salary slips with the new employee_id
      if (formValues.employee_id !== employee.employee_id) {
        console.log(`Employee ID changed from ${employee.employee_id} to ${formValues.employee_id}, updating related records...`);
        try {
          // Update salary_slips
          const { error: updateSlipsError } = await supabase
            .from('salary_slips')
            .update({
              employee_id: formValues.employee_id,
              employee_name: `${formValues.first_name} ${formValues.last_name}`,
              employee_email: formValues.email,
              department: formValues.department || '',
              position: formValues.position || '',
            })
            .eq('employee_id', employee.employee_id);

          if (updateSlipsError) {
            console.error('Error updating salary slips employee_id:', updateSlipsError);
          } else {
            console.log('Successfully updated salary slips with new employee_id');
          }

          // Update salary_structures
          const { error: updateStructuresError } = await supabase
            .from('salary_structures')
            .update({
              employee_id: formValues.employee_id,
              employee_name: `${formValues.first_name} ${formValues.last_name}`,
              employee_email: formValues.email,
              department: formValues.department || '',
              position: formValues.position || '',
            })
            .eq('employee_id', employee.employee_id);

          if (updateStructuresError) {
            console.error('Error updating salary structures employee_id:', updateStructuresError);
          } else {
            console.log('Successfully updated salary structures with new employee_id');
          }

          // Update documents (if any are assigned to this employee)
          const { error: updateDocsError } = await supabase
            .from('documents')
            .update({
              employee_id: formValues.employee_id,
              employee_name: `${formValues.first_name} ${formValues.last_name}`,
            })
            .eq('employee_id', employee.employee_id);

          if (updateDocsError) {
            console.error('Error updating documents employee_id:', updateDocsError);
          } else {
            console.log('Successfully updated documents with new employee_id');
          }

          // Show warning if any updates failed
          if (updateSlipsError || updateStructuresError || updateDocsError) {
            toast({
              title: "Warning",
              description: "Employee ID updated but some related records may not have been updated completely.",
              variant: "default",
            });
          }
        } catch (updateError) {
          console.error('Error updating related records:', updateError);
          toast({
            title: "Warning",
            description: "Employee ID updated but some related records may not have been updated.",
            variant: "default",
          });
        }
      }

      // Sync compensation records to database
      if (compensationRecords.length > 0) {
        // 1. Get original compensation records to identify deletions
        const { data: originalCompData } = await supabase
          .from('employee_compensation' as any)
          .select('*')
          .eq('employee_id', employee.id);

        // 2. Delete existing compensation records for this employee
        await supabase
          .from('employee_compensation' as any)
          .delete()
          .eq('employee_id', employee.id);

        // 3. Insert all current compensation records
        const compensationInserts = compensationRecords.map(record => ({
          employee_id: employee.id,
          ctc: parseFloat(record.ctc),
          effective_date: record.effective_date
        }));

        const { error: compensationError } = await supabase
          .from('employee_compensation' as any)
          .insert(compensationInserts);

        if (compensationError) {
          console.error('Compensation records update error:', compensationError);
          toast({
            title: "Warning",
            description: "Employee updated but compensation history may not be saved completely.",
            variant: "default",
          });
        } else {
          // 4. Sync Salary Slips
          try {
            // Identify months/years that should exist based on NEW compensation records
            const newSlipKeys = compensationRecords.map(record => {
              const [yearStr, monthStr] = record.effective_date.split('-');
              return `${parseInt(yearStr)}-${parseInt(monthStr)}`;
            });

            // Identify months/years that existed in ORIGINAL records
            const originalSlipKeys = (originalCompData || []).map((record: any) => {
              const [yearStr, monthStr] = record.effective_date.split('-');
              return `${parseInt(yearStr)}-${parseInt(monthStr)}`;
            });

            // Determine which slips to DELETE (present in original but not in new)
            const slipsToDelete = originalSlipKeys.filter(key => !newSlipKeys.includes(key));

            if (slipsToDelete.length > 0) {
              console.log('Deleting salary slips for:', slipsToDelete);
              for (const key of slipsToDelete) {
                const [year, month] = key.split('-').map(Number);
                // Use formValues.employee_id since we've already updated all slips with the new ID
                await supabase
                  .from('salary_slips')
                  .delete()
                  .eq('employee_id', formValues.employee_id)
                  .eq('month', month)
                  .eq('year', year);
              }
            }

            // Determine which slips to UPSERT (all present in new records)
            for (const record of compensationRecords) {
              const [yearStr, monthStr] = record.effective_date.split('-');
              const slipYear = parseInt(yearStr);
              const slipMonth = parseInt(monthStr);

              const pay_period_start = new Date(slipYear, slipMonth - 1, 1).toISOString();
              const pay_period_end = new Date(slipYear, slipMonth, 0, 23, 59, 59).toISOString();

              // NEW CALCULATION RULES
              const ctc_yearly = parseFloat(record.ctc);

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
              const professional_tax = 200;

              // 10. Income Tax = 0 (shown as "As applicable")
              const income_tax = 0;

              const total_deductions = pf_employee + professional_tax + income_tax;
              const net_salary = gross_earnings - total_deductions;

              // Check if slip exists (use the NEW employee_id from formValues)
              const { data: existingSlips } = await supabase
                .from('salary_slips')
                .select('id')
                .eq('employee_id', formValues.employee_id) // Use the updated employee_id
                .eq('month', slipMonth)
                .eq('year', slipYear);

              const slipData = {
                employee_id: formValues.employee_id, // Use the updated employee_id
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

              if (existingSlips && existingSlips.length > 0) {
                // Update existing
                await supabase
                  .from('salary_slips')
                  .update(slipData)
                  .eq('id', existingSlips[0].id);
              } else {
                // Insert new
                await supabase
                  .from('salary_slips')
                  .insert([slipData]);
              }
            }
          } catch (slipError) {
            console.error('Error syncing salary slips:', slipError);
            // Don't block the UI, just log
          }
        }
      }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Employment</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Banking & PF</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal Info */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>Employee ID</RequiredLabel>
                        <FormControl>
                          <Input placeholder="EMP-001" {...field} disabled={isLoading} />
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
                        <RequiredLabel>First Name</RequiredLabel>
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
                        <RequiredLabel>Last Name</RequiredLabel>
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
                        <RequiredLabel>Email</RequiredLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" type="email" {...field} disabled={isLoading} />
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
                          <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="9876543210"
                            {...field}
                            disabled={isLoading}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Employment */}
          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <RequiredLabel>Department</RequiredLabel>
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
                        <RequiredLabel>Position</RequiredLabel>
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
                        <RequiredLabel>Hire Date</RequiredLabel>
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
                        <RequiredLabel>Status</RequiredLabel>
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

                {/* Compensation Details */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Compensation Details</h4>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Banking & PF */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Banking & PF Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold">PF & ESI Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Identity Documents
                </CardTitle>
                <p className="text-sm text-muted-foreground">Upload your PAN and Aadhar cards</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhar Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Aadhar Card</span>
                      {aadharUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {aadharUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(aadharUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('aadhar')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {aadharFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {aadharFile.name}
                      </div>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">PAN Card</span>
                      {panUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {panUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(panUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('pan')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {panFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {panFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational Documents
                </CardTitle>
                <p className="text-sm text-muted-foreground">Upload your educational certificates</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 10th Certificate */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">10th Certificate</span>
                      {tenthCertUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {tenthCertUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(tenthCertUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('tenth')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setTenthCertFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {tenthCertFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {tenthCertFile.name}
                      </div>
                    )}
                  </div>

                  {/* Intermediate Certificate */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Intermediate Certificate</span>
                      {interCertUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {interCertUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(interCertUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('inter')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setInterCertFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {interCertFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {interCertFile.name}
                      </div>
                    )}
                  </div>

                  {/* Degree Certificate */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Degree Certificate</span>
                      {degreeCertUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {degreeCertUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(degreeCertUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('degree')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDegreeCertFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {degreeCertFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {degreeCertFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Certificates */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Professional Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume / CV */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Resume / CV</span>
                      {resumeUrl && (
                        <span className="text-xs border border-green-500 text-green-600 px-2 py-0.5 rounded-full">Uploaded</span>
                      )}
                    </div>
                    {resumeUrl ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDocument(resumeUrl)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => handleDeleteDocument('resume')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    )}
                    {resumeFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        {resumeFile.name}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Upload PDF or Word document</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                Updating...
              </>
            ) : (
              'Update Employee'
            )}
          </Button>
        </div>
      </form>

      {/* Compensation Dialog */}
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
    </Form>
  );
}
