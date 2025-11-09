import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Download, 
  Send, 
  Edit, 
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Calculator,
  FileSpreadsheet,
  Trash2
} from "lucide-react";
import { SalarySlip, SalaryStructure, SalaryCreateRequest, MONTHS, SALARY_STATUS_COLORS } from "@/types/salary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalarySlipView } from "./SalarySlipView";

interface SalaryManagementProps {
  employees?: Array<{
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  }>;
}

export function SalaryManagement({ employees = [] }: SalaryManagementProps) {
  const [activeTab, setActiveTab] = useState("salary-slips");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStructureDialogOpen, setIsStructureDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [editingSlip, setEditingSlip] = useState<SalarySlip | null>(null);
  const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SalaryCreateRequest>>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    working_days: 22,
    present_days: 22,
    basic_salary: 0,
    hra: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    special_allowance: 0,
    performance_bonus: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    other_allowances: 0,
    pf_employee: 0,
    esi_employee: 0,
    professional_tax: 0,
    income_tax: 0,
    medical_insurance: 0,
    loan_deduction: 0,
    advance_deduction: 0,
    late_deduction: 0,
    other_deductions: 0,
    paid_date: undefined,
  });

  // Fetch employees from database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('status', 'active')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        setDbEmployees(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      }
    };

    fetchEmployees();
  }, []);

  // Fetch salary slips from database
  useEffect(() => {
    fetchSalarySlips();
  }, []);

  const fetchSalarySlips = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_slips')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
     const mappedData: SalarySlip[] = (data || []).map((item: any) => ({
        ...item,
        medical_insurance: item.medical_insurance ?? 0,
      }));
      
      setSalarySlips(mappedData);
    } catch (error) {
      console.error('Error fetching salary slips:', error);
      toast.error('Failed to load salary slips');
    }
  };

  // Mock salary slip data
  const mockSalarySlips: SalarySlip[] = [
    {
      id: "1",
      employee_id: "EMP001",
      employee_name: "John Doe",
      employee_email: "john.doe@company.com",
      department: "Engineering",
      position: "Software Developer",
      month: 11,
      year: 2024,
      pay_period_start: "2024-11-01T00:00:00Z",
      pay_period_end: "2024-11-30T23:59:59Z",
      working_days: 22,
      present_days: 22,
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 5000,
      overtime_hours: 8,
      overtime_rate: 500,
      overtime_amount: 4000,
      other_allowances: 1000,
      gross_earnings: 93500,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 8500,
      medical_insurance: 0,
      loan_deduction: 0,
      advance_deduction: 0,
      late_deduction: 0,
      other_deductions: 0,
      total_deductions: 10500,
      net_salary: 83000,
      pf_employer: 1800,
      esi_employer: 0,
      status: "paid",
      generated_date: "2024-11-25T10:00:00Z",
      paid_date: "2024-11-30T10:00:00Z",
      created_at: "2024-11-25T10:00:00Z",
      updated_at: "2024-11-30T10:00:00Z",
    },
    {
      id: "2",
      employee_id: "EMP002",
      employee_name: "Jane Smith",
      employee_email: "jane.smith@company.com",
      department: "Marketing",
      position: "Marketing Manager",
      month: 11,
      year: 2024,
      pay_period_start: "2024-11-01T00:00:00Z",
      pay_period_end: "2024-11-30T23:59:59Z",
      working_days: 22,
      present_days: 20,
      basic_salary: 60000,
      hra: 24000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 15000,
      performance_bonus: 8000,
      overtime_hours: 0,
      overtime_rate: 600,
      overtime_amount: 0,
      other_allowances: 2000,
      gross_earnings: 112500,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 12000,
      medical_insurance: 0,
      loan_deduction: 5000,
      advance_deduction: 0,
      late_deduction: 1000,
      other_deductions: 0,
      total_deductions: 20000,
      net_salary: 92500,
      pf_employer: 1800,
      esi_employer: 0,
      status: "processed",
      generated_date: "2024-11-25T10:00:00Z",
      created_at: "2024-11-25T10:00:00Z",
      updated_at: "2024-11-25T10:00:00Z",
    },
  ];

  // Mock salary structure data
  const mockSalaryStructures: SalaryStructure[] = [
    {
      id: "1",
      employee_id: "EMP001",
      employee_name: "John Doe",
      employee_email: "john.doe@company.com",
      department: "Engineering",
      position: "Software Developer",
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 0,
      overtime_amount: 0,
      other_allowances: 0,
      pf_employee: 1800,
      pf_employer: 1800,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 200,
      income_tax: 8500,
      medical_insurance: 0,
      loan_deduction: 0,
      other_deductions: 0,
      gross_salary: 83500,
      total_deductions: 10500,
      net_salary: 73000,
      effective_date: "2024-01-01T00:00:00Z",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      employee_id: "EMP002",
      employee_name: "Jane Smith",
      employee_email: "jane.smith@company.com",
      department: "Marketing",
      position: "Marketing Manager",
      basic_salary: 60000,
      hra: 24000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 15000,
      performance_bonus: 0,
      overtime_amount: 0,
      other_allowances: 0,
      pf_employee: 1800,
      pf_employer: 1800,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 200,
      income_tax: 12000,
      medical_insurance: 0,
      loan_deduction: 0,
      other_deductions: 0,
      gross_salary: 102500,
      total_deductions: 14000,
      net_salary: 88500,
      effective_date: "2024-01-01T00:00:00Z",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  const filteredSalarySlips = salarySlips.filter((slip) => {
    const matchesSearch = 
      slip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || slip.status === filterStatus;
    const matchesMonth = filterMonth === "all" || slip.month.toString() === filterMonth;
    const matchesYear = slip.year.toString() === filterYear;
    
    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  const filteredSalaryStructures = mockSalaryStructures.filter((structure) => {
    const matchesSearch = 
      structure.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateSalarySlip = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setIsLoading(true);
    try {
      // Find the selected employee
      const employee = dbEmployees.find(emp => emp.employee_id === selectedEmployee);
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Calculate overtime amount
      const overtime_amount = (formData.overtime_hours || 0) * (formData.overtime_rate || 0);

      // Calculate gross earnings
      const gross_earnings = 
        (formData.basic_salary || 0) +
        (formData.hra || 0) +
        (formData.transport_allowance || 0) +
        (formData.medical_allowance || 0) +
        (formData.special_allowance || 0) +
        (formData.performance_bonus || 0) +
        overtime_amount +
        (formData.other_allowances || 0);

      // Calculate total deductions
      const total_deductions = 
        (formData.pf_employee || 0) +
        (formData.esi_employee || 0) +
        (formData.professional_tax || 0) +
        (formData.income_tax || 0) +
        (formData.medical_insurance || 0) +
        (formData.loan_deduction || 0) +
        (formData.advance_deduction || 0) +
        (formData.late_deduction || 0) +
        (formData.other_deductions || 0);

      // Calculate net salary
      const net_salary = gross_earnings - total_deductions;

      // Calculate pay period dates
      const year = formData.year || new Date().getFullYear();
      const month = formData.month || new Date().getMonth() + 1;
      const pay_period_start = new Date(year, month - 1, 1).toISOString();
      const pay_period_end = new Date(year, month, 0, 23, 59, 59).toISOString();

      // Prepare salary slip data
      const salarySlipData = {
        employee_id: employee.employee_id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        employee_email: employee.email,
        department: employee.department || '',
        position: employee.position || '',
        month: formData.month || new Date().getMonth() + 1,
        year: formData.year || new Date().getFullYear(),
        pay_period_start,
        pay_period_end,
        working_days: formData.working_days || 22,
        present_days: formData.present_days || 22,
        basic_salary: formData.basic_salary || 0,
        hra: formData.hra || 0,
        transport_allowance: formData.transport_allowance || 0,
        medical_allowance: formData.medical_allowance || 0,
        special_allowance: formData.special_allowance || 0,
        performance_bonus: formData.performance_bonus || 0,
        overtime_hours: formData.overtime_hours || 0,
        overtime_rate: formData.overtime_rate || 0,
        overtime_amount,
        other_allowances: formData.other_allowances || 0,
        gross_earnings,
        pf_employee: formData.pf_employee || 0,
        esi_employee: formData.esi_employee || 0,
        professional_tax: formData.professional_tax || 0,
        income_tax: formData.income_tax || 0,
        medical_insurance: formData.medical_insurance || 0,
        loan_deduction: formData.loan_deduction || 0,
        advance_deduction: formData.advance_deduction || 0,
        late_deduction: formData.late_deduction || 0,
        other_deductions: formData.other_deductions || 0,
        total_deductions,
        net_salary,
        pf_employer: formData.pf_employee || 0, // Usually same as employee PF
        esi_employer: formData.esi_employee || 0, // Usually same as employee ESI
        status: 'draft' as const,
        generated_date: new Date().toISOString(),
        paid_date: formData.paid_date || null,
      };

      // Insert into database
      const { error } = await supabase
        .from('salary_slips')
        .insert([salarySlipData]);

      if (error) throw error;

      toast.success("Salary slip generated successfully!");
      fetchSalarySlips(); // Refresh the list
      setIsCreateDialogOpen(false);
      setSelectedEmployee("");
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        working_days: 22,
        present_days: 22,
        basic_salary: 0,
        hra: 0,
        transport_allowance: 0,
        medical_allowance: 0,
        special_allowance: 0,
        performance_bonus: 0,
        overtime_hours: 0,
        overtime_rate: 0,
        other_allowances: 0,
        pf_employee: 0,
        esi_employee: 0,
        professional_tax: 0,
        income_tax: 0,
        medical_insurance: 0,
        loan_deduction: 0,
        advance_deduction: 0,
        late_deduction: 0,
        other_deductions: 0,
        paid_date: undefined,
      });
    } catch (error: any) {
      console.error('Error creating salary slip:', error);
      toast.error(error.message || "Failed to generate salary slip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSalary = (id: string) => {
    console.log("Processing salary with ID:", id);
  };

  const handlePaySalary = (id: string) => {
    console.log("Paying salary with ID:", id);
  };

  const handleDeleteSalarySlip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary slip?')) return;

    try {
      const { error } = await supabase
        .from('salary_slips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Salary slip deleted successfully');
      fetchSalarySlips();
    } catch (error) {
      console.error('Error deleting salary slip:', error);
      toast.error('Failed to delete salary slip');
    }
  };

  const handleViewSalarySlip = (slip: SalarySlip) => {
    setViewingSlip(slip);
    setIsViewDialogOpen(true);
  };

  const handleDownloadSlip = () => {
    if (viewingSlip) {
      toast.success('Downloading salary slip...');
      // TODO: Implement PDF download functionality
    }
  };

  const handleUpdateSalarySlip = async () => {
    if (!editingSlip) {
      toast.error("No salary slip selected for editing");
      return;
    }

    setIsLoading(true);
    try {
      // Calculate overtime amount
      const overtime_amount = (formData.overtime_hours || 0) * (formData.overtime_rate || 0);

      // Calculate gross earnings
      const gross_earnings = 
        (formData.basic_salary || 0) +
        (formData.hra || 0) +
        (formData.transport_allowance || 0) +
        (formData.medical_allowance || 0) +
        (formData.special_allowance || 0) +
        (formData.performance_bonus || 0) +
        overtime_amount +
        (formData.other_allowances || 0);

      // Calculate total deductions
      const total_deductions = 
        (formData.pf_employee || 0) +
        (formData.esi_employee || 0) +
        (formData.professional_tax || 0) +
        (formData.income_tax || 0) +
        (formData.medical_insurance || 0) +
        (formData.loan_deduction || 0) +
        (formData.advance_deduction || 0) +
        (formData.late_deduction || 0) +
        (formData.other_deductions || 0);

      // Calculate net salary
      const net_salary = gross_earnings - total_deductions;

      // Calculate pay period dates
      const year = formData.year || editingSlip.year;
      const month = formData.month || editingSlip.month;
      const pay_period_start = new Date(year, month - 1, 1).toISOString();
      const pay_period_end = new Date(year, month, 0, 23, 59, 59).toISOString();

      // Prepare update data
      const updateData = {
        month: formData.month || editingSlip.month,
        year: formData.year || editingSlip.year,
        pay_period_start,
        pay_period_end,
        working_days: formData.working_days || editingSlip.working_days,
        present_days: formData.present_days || editingSlip.present_days,
        basic_salary: formData.basic_salary || 0,
        hra: formData.hra || 0,
        transport_allowance: formData.transport_allowance || 0,
        medical_allowance: formData.medical_allowance || 0,
        special_allowance: formData.special_allowance || 0,
        performance_bonus: formData.performance_bonus || 0,
        overtime_hours: formData.overtime_hours || 0,
        overtime_rate: formData.overtime_rate || 0,
        overtime_amount,
        other_allowances: formData.other_allowances || 0,
        gross_earnings,
        pf_employee: formData.pf_employee || 0,
        esi_employee: formData.esi_employee || 0,
        professional_tax: formData.professional_tax || 0,
        income_tax: formData.income_tax || 0,
        medical_insurance: formData.medical_insurance || 0,
        loan_deduction: formData.loan_deduction || 0,
        advance_deduction: formData.advance_deduction || 0,
        late_deduction: formData.late_deduction || 0,
        other_deductions: formData.other_deductions || 0,
        total_deductions,
        net_salary,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('salary_slips')
        .update(updateData)
        .eq('id', editingSlip.id);

      if (error) throw error;

      toast.success("Salary slip updated successfully!");
      fetchSalarySlips(); // Refresh the list
      setIsEditDialogOpen(false);
      setEditingSlip(null);
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        working_days: 22,
        present_days: 22,
        basic_salary: 0,
        hra: 0,
        transport_allowance: 0,
        medical_allowance: 0,
        special_allowance: 0,
        performance_bonus: 0,
        overtime_hours: 0,
        overtime_rate: 0,
        other_allowances: 0,
        pf_employee: 0,
        esi_employee: 0,
        professional_tax: 0,
        income_tax: 0,
        medical_insurance: 0,
        loan_deduction: 0,
        advance_deduction: 0,
        late_deduction: 0,
        other_deductions: 0,
        paid_date: undefined,
      });
    } catch (error: any) {
      console.error('Error updating salary slip:', error);
      toast.error(error.message || "Failed to update salary slip");
    } finally {
      setIsLoading(false);
    }
  };


  const totalGrossSalary = filteredSalarySlips.reduce((sum, slip) => sum + slip.gross_earnings, 0);
  const totalNetSalary = filteredSalarySlips.reduce((sum, slip) => sum + slip.net_salary, 0);
  const totalDeductions = filteredSalarySlips.reduce((sum, slip) => sum + slip.total_deductions, 0);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Salary Slip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Salary Slip</DialogTitle>
                <DialogDescription>
                  Create a new salary slip for an employee
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Select Employee</Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {dbEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.employee_id}>
                            {employee.first_name} {employee.last_name} ({employee.employee_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select 
                      value={formData.month?.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, month: Number(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || 2024}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="working_days">Working Days</Label>
                    <Input
                      id="working_days"
                      type="number"
                      value={formData.working_days || 22}
                      onChange={(e) => setFormData(prev => ({ ...prev, working_days: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="present_days">Present Days</Label>
                    <Input
                      id="present_days"
                      type="number"
                      value={formData.present_days || 22}
                      onChange={(e) => setFormData(prev => ({ ...prev, present_days: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basic_salary">Basic Salary</Label>
                    <Input
                      id="basic_salary"
                      type="number"
                      value={formData.basic_salary || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA</Label>
                    <Input
                      id="hra"
                      type="number"
                      value={formData.hra || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, hra: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transport_allowance">Transport Allowance</Label>
                    <Input
                      id="transport_allowance"
                      type="number"
                      value={formData.transport_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, transport_allowance: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_allowance">Medical Allowance</Label>
                    <Input
                      id="medical_allowance"
                      type="number"
                      value={formData.medical_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_allowance: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="special_allowance">Special Allowance</Label>
                    <Input
                      id="special_allowance"
                      type="number"
                      value={formData.special_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performance_bonus">Performance Bonus</Label>
                    <Input
                      id="performance_bonus"
                      type="number"
                      value={formData.performance_bonus || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, performance_bonus: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtime_hours">Overtime Hours</Label>
                    <Input
                      id="overtime_hours"
                      type="number"
                      value={formData.overtime_hours || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime_rate">Overtime Rate</Label>
                    <Input
                      id="overtime_rate"
                      type="number"
                      value={formData.overtime_rate || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime_rate: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="other_allowances">Other Allowances</Label>
                    <Input
                      id="other_allowances"
                      type="number"
                      value={formData.other_allowances || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_allowances: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Separator />
                <h3 className="text-lg font-semibold">Deductions</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pf_employee">PF (Employee Contribution)</Label>
                    <Input
                      id="pf_employee"
                      type="number"
                      value={formData.pf_employee || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, pf_employee: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professional_tax">Professional Tax</Label>
                    <Input
                      id="professional_tax"
                      type="number"
                      value={formData.professional_tax || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, professional_tax: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="esi_employee">ESI</Label>
                    <Input
                      id="esi_employee"
                      type="number"
                      value={formData.esi_employee || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, esi_employee: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_insurance">Medical Insurance</Label>
                    <Input
                      id="medical_insurance"
                      type="number"
                      value={formData.medical_insurance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_insurance: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income_tax">Income Tax</Label>
                    <Input
                      id="income_tax"
                      type="number"
                      value={formData.income_tax || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, income_tax: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan_deduction">Loan Deduction</Label>
                    <Input
                      id="loan_deduction"
                      type="number"
                      value={formData.loan_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, loan_deduction: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance_deduction">Advance Deduction</Label>
                    <Input
                      id="advance_deduction"
                      type="number"
                      value={formData.advance_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, advance_deduction: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late_deduction">Late Deduction</Label>
                    <Input
                      id="late_deduction"
                      type="number"
                      value={formData.late_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, late_deduction: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="other_deductions">Other Deductions</Label>
                    <Input
                      id="other_deductions"
                      type="number"
                      value={formData.other_deductions || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_deductions: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Separator />
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paid_date">Payment Date</Label>
                    <Input
                      id="paid_date"
                      type="date"
                      value={formData.paid_date ? new Date(formData.paid_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid_date: e.target.value }))}
                    />
                  </div>
                  {/* Assuming Payment Mode will be added later or is not a direct input */}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSalarySlip} disabled={!selectedEmployee || isLoading}>
                  {isLoading ? "Generating..." : "Generate Salary Slip"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Salary Slip Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Salary Slip</DialogTitle>
                <DialogDescription>
                  Update salary slip for {editingSlip?.employee_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_month">Month</Label>
                    <Select 
                      value={formData.month?.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, month: Number(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_year">Year</Label>
                    <Input
                      id="edit_year"
                      type="number"
                      value={formData.year || 2024}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_working_days">Working Days</Label>
                    <Input
                      id="edit_working_days"
                      type="number"
                      value={formData.working_days || 22}
                      onChange={(e) => setFormData(prev => ({ ...prev, working_days: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_present_days">Present Days</Label>
                    <Input
                      id="edit_present_days"
                      type="number"
                      value={formData.present_days || 22}
                      onChange={(e) => setFormData(prev => ({ ...prev, present_days: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Separator />
                <h3 className="text-lg font-semibold">Earnings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_basic_salary">Basic Salary</Label>
                    <Input
                      id="edit_basic_salary"
                      type="number"
                      value={formData.basic_salary || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_hra">HRA</Label>
                    <Input
                      id="edit_hra"
                      type="number"
                      value={formData.hra || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, hra: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_transport_allowance">Transport Allowance</Label>
                    <Input
                      id="edit_transport_allowance"
                      type="number"
                      value={formData.transport_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, transport_allowance: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_medical_allowance">Medical Allowance</Label>
                    <Input
                      id="edit_medical_allowance"
                      type="number"
                      value={formData.medical_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_allowance: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_special_allowance">Special Allowance</Label>
                    <Input
                      id="edit_special_allowance"
                      type="number"
                      value={formData.special_allowance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_performance_bonus">Performance Bonus</Label>
                    <Input
                      id="edit_performance_bonus"
                      type="number"
                      value={formData.performance_bonus || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, performance_bonus: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_overtime_hours">Overtime Hours</Label>
                    <Input
                      id="edit_overtime_hours"
                      type="number"
                      value={formData.overtime_hours || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_overtime_rate">Overtime Rate</Label>
                    <Input
                      id="edit_overtime_rate"
                      type="number"
                      value={formData.overtime_rate || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime_rate: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_other_allowances">Other Allowances</Label>
                    <Input
                      id="edit_other_allowances"
                      type="number"
                      value={formData.other_allowances || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_allowances: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Separator />
                <h3 className="text-lg font-semibold">Deductions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_pf_employee">PF (Employee)</Label>
                    <Input
                      id="edit_pf_employee"
                      type="number"
                      value={formData.pf_employee || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, pf_employee: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_professional_tax">Professional Tax</Label>
                    <Input
                      id="edit_professional_tax"
                      type="number"
                      value={formData.professional_tax || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, professional_tax: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_esi_employee">ESI</Label>
                    <Input
                      id="edit_esi_employee"
                      type="number"
                      value={formData.esi_employee || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, esi_employee: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_medical_insurance">Medical Insurance</Label>
                    <Input
                      id="edit_medical_insurance"
                      type="number"
                      value={formData.medical_insurance || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_insurance: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_income_tax">Income Tax</Label>
                    <Input
                      id="edit_income_tax"
                      type="number"
                      value={formData.income_tax || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, income_tax: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_loan_deduction">Loan Deduction</Label>
                    <Input
                      id="edit_loan_deduction"
                      type="number"
                      value={formData.loan_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, loan_deduction: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_advance_deduction">Advance Deduction</Label>
                    <Input
                      id="edit_advance_deduction"
                      type="number"
                      value={formData.advance_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, advance_deduction: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_late_deduction">Late Deduction</Label>
                    <Input
                      id="edit_late_deduction"
                      type="number"
                      value={formData.late_deduction || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, late_deduction: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_other_deductions">Other Deductions</Label>
                    <Input
                      id="edit_other_deductions"
                      type="number"
                      value={formData.other_deductions || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_deductions: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSlip(null);
                  }} 
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateSalarySlip} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Salary Slip"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalGrossSalary)}</p>
                <p className="text-sm text-muted-foreground">Total Gross</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalNetSalary)}</p>
                <p className="text-sm text-muted-foreground">Total Net</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalDeductions)}</p>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredSalarySlips.length}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="salary-slips">Salary Slips</TabsTrigger>
          <TabsTrigger value="salary-structure">Salary Structure</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {activeTab === "salary-slips" && (
                <>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <TabsContent value="salary-slips">
          <Card>
            <CardHeader>
              <CardTitle>Salary Slips</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalarySlips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{slip.employee_name}</p>
                          <p className="text-sm text-muted-foreground">{slip.employee_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{slip.department}</p>
                          <p className="text-sm text-muted-foreground">{slip.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(slip.basic_salary)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <p>HRA: {formatCurrency(slip.hra)}</p>
                          <p>Transport: {formatCurrency(slip.transport_allowance)}</p>
                          <p>Medical: {formatCurrency(slip.medical_allowance)}</p>
                          <p>Special: {formatCurrency(slip.special_allowance)}</p>
                          {slip.other_allowances > 0 && <p>Other: {formatCurrency(slip.other_allowances)}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {slip.performance_bonus > 0 && <p>Bonus: {formatCurrency(slip.performance_bonus)}</p>}
                          {slip.overtime_amount > 0 && <p>Overtime: {formatCurrency(slip.overtime_amount)}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <p>PF: {formatCurrency(slip.pf_employee)}</p>
                          <p>PT: {formatCurrency(slip.professional_tax)}</p>
                          <p>IT: {formatCurrency(slip.income_tax)}</p>
                          {slip.loan_deduction > 0 && <p>Loan: {formatCurrency(slip.loan_deduction)}</p>}
                          {slip.advance_deduction > 0 && <p>Advance: {formatCurrency(slip.advance_deduction)}</p>}
                          {slip.other_deductions > 0 && <p>Other: {formatCurrency(slip.other_deductions)}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(slip.net_salary)}</TableCell>
                      <TableCell>
                        <Badge className={SALARY_STATUS_COLORS[slip.status]}>
                          {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {slip.paid_date ? new Date(slip.paid_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewSalarySlip(slip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingSlip(slip);
                              setFormData({
                                month: slip.month,
                                year: slip.year,
                                working_days: slip.working_days,
                                present_days: slip.present_days,
                                basic_salary: slip.basic_salary,
                                hra: slip.hra,
                                transport_allowance: slip.transport_allowance,
                                medical_allowance: slip.medical_allowance,
                                special_allowance: slip.special_allowance,
                                performance_bonus: slip.performance_bonus,
                                overtime_hours: slip.overtime_hours,
                                overtime_rate: slip.overtime_rate,
                                other_allowances: slip.other_allowances,
                                pf_employee: slip.pf_employee,
                                esi_employee: slip.esi_employee,
                                professional_tax: slip.professional_tax,
                                income_tax: slip.income_tax,
                                medical_insurance: slip.medical_insurance,
                                loan_deduction: slip.loan_deduction,
                                advance_deduction: slip.advance_deduction,
                                late_deduction: slip.late_deduction,
                                other_deductions: slip.other_deductions,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSalarySlip(slip.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary-structure">
          <Card>
            <CardHeader>
              <CardTitle>Salary Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaryStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{structure.employee_name}</p>
                          <p className="text-sm text-muted-foreground">{structure.employee_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(structure.basic_salary)}</TableCell>
                      <TableCell>{formatCurrency(structure.gross_salary)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(structure.net_salary)}</TableCell>
                      <TableCell>
                        <Badge className={SALARY_STATUS_COLORS[structure.status]}>
                          {structure.status.charAt(0).toUpperCase() + structure.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Salary Slip Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Slip Preview</DialogTitle>
          </DialogHeader>
          {viewingSlip && (
            <div className="space-y-4">
              <SalarySlipView salarySlip={viewingSlip} />
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleDownloadSlip}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
