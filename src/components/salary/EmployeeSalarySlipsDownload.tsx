import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, AlertCircle, Eye, RotateCcw, ArrowUpDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SalarySlipView } from './SalarySlipView';
import { SalarySlip } from '@/types/salary';
import { downloadSalarySlipPDF } from '@/utils/salarySlipPdfGenerator';

type SalarySortField = 'month' | 'year';
type SortDirection = 'asc' | 'desc';

export function EmployeeSalarySlipsDownload() {
    const { employee, isEmployee } = useAuth();
    const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
    const [filteredSlips, setFilteredSlips] = useState<SalarySlip[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [sortField, setSortField] = useState<SalarySortField>('year');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        if (isEmployee && employee?.id) {
            fetchSalarySlips();
        }
    }, [isEmployee, employee?.id]);

    // Apply filters whenever slips or filter values change
    useEffect(() => {
        applyFilters();
    }, [salarySlips, selectedMonth, selectedYear]);

    const fetchSalarySlips = async () => {
        try {
            setLoading(true);

            console.log('Fetching salary slips for employee:', {
                employee_id: employee?.employee_id,
                id: employee?.id
            });

            // Fetch additional employee details (PAN, Joining Date, Bank Details, PF, UAN, ESI)
            const { data: employeeDetails } = await supabase
                .from('employees')
                .select('pan_number, hire_date, bank_name, account_number, pf_number, uan_number, esi_number')
                .eq('id', employee?.id)
                .single();

            // First try to fetch by employee_id (string like "EMP-999")
            let { data, error } = await supabase
                .from('salary_slips')
                .select('*')
                .eq('employee_id', employee?.employee_id)
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            console.log('Query by employee_id string result:', { count: data?.length, data });

            // If no results, try by database UUID
            if (!data || data.length === 0) {
                console.log('No results, trying by database UUID...');
                const result = await supabase
                    .from('salary_slips')
                    .select('*')
                    .eq('employee_id', employee?.id)
                    .order('year', { ascending: false })
                    .order('month', { ascending: false });

                data = result.data;
                error = result.error;
                console.log('Query by database UUID result:', { count: data?.length, data });
            }

            if (error) {
                console.error('Error fetching salary slips:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch salary slips",
                    variant: "destructive",
                });
                return;
            }

            // Map data to ensure medical_insurance field exists and add employee details
            const mappedData: SalarySlip[] = (data || []).map((item: any) => ({
                ...item,
                medical_insurance: item.medical_insurance ?? 0,
                pan_number: (employeeDetails as any)?.pan_number,
                joining_date: (employeeDetails as any)?.hire_date,
                bank_name: (employeeDetails as any)?.bank_name,
                bank_account_no: (employeeDetails as any)?.account_number,
                pf_number: (employeeDetails as any)?.pf_number,
                uan_number: (employeeDetails as any)?.uan_number,
                esi_number: (employeeDetails as any)?.esi_number,
            }));

            console.log('Final mapped salary slips:', mappedData);
            setSalarySlips(mappedData);
        } catch (error) {
            console.error('Error fetching salary slips:', error);
            toast({
                title: "Error",
                description: "Failed to fetch salary slips",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Generate month options
    const months = [
        { value: "all", label: "All Months" },
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    // Generate year options (last 5 years to next year)
    const currentYearNum = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => (currentYearNum - 5 + i).toString());

    const applyFilters = () => {
        let filtered = [...salarySlips];

        if (selectedMonth !== "all") {
            filtered = filtered.filter(slip =>
                slip.year === parseInt(selectedYear) && slip.month === parseInt(selectedMonth)
            );
        }

        setFilteredSlips(filtered);
    };

    const handleSort = (field: SalarySortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedSlips = useMemo(() => {
        return [...filteredSlips].sort((a, b) => {
            let aValue: number;
            let bValue: number;

            if (sortField === 'month') {
                aValue = a.month;
                bValue = b.month;
            } else {
                // Sort by year, then by month as secondary
                aValue = a.year * 100 + a.month;
                bValue = b.year * 100 + b.month;
            }

            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        });
    }, [filteredSlips, sortField, sortDirection]);

    const handleDirectDownload = async (slip: SalarySlip) => {
        try {
            toast({
                title: "Generating PDF",
                description: "Please wait...",
            });
            await downloadSalarySlipPDF(slip);
            toast({
                title: "Success",
                description: "PDF downloaded successfully",
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error",
                description: "Failed to generate PDF",
                variant: "destructive",
            });
        }
    };

    const handleViewSalarySlip = (slip: SalarySlip) => {
        setViewingSlip(slip);
        setIsViewDialogOpen(true);
    };

    const handleDownloadSlip = async () => {
        if (viewingSlip) {
            try {
                toast({
                    title: "Generating PDF",
                    description: "Please wait...",
                });
                await downloadSalarySlipPDF(viewingSlip);
                toast({
                    title: "Success",
                    description: "PDF downloaded successfully",
                });
            } catch (error) {
                console.error('Error generating PDF:', error);
                toast({
                    title: "Error",
                    description: "Failed to generate PDF",
                    variant: "destructive",
                });
            }
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1] || month.toString();
    };

    if (!isEmployee) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Access denied. Only employees can view salary slips.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        My Salary Slips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Salary Slips</h1>
                                <p className="text-sm text-muted-foreground">
                                    Welcome, {employee?.first_name} {employee?.last_name} (ID: {employee?.employee_id})
                                </p>
                            </div>
                        </div>
                        {/* Month/Year Filter - moved to header */}
                        <div className="flex items-center gap-4">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSelectedMonth("all");
                                    setSelectedYear(new Date().getFullYear().toString());
                                }}
                                title="Reset Filter"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardContent className="pt-6">

                        {/* Salary Slips Table */}
                        {filteredSlips.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    {salarySlips.length === 0 ? 'No salary slips available' : 'No slips match the selected date'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {salarySlips.length === 0
                                        ? 'Contact your HR administrator for salary slip information.'
                                        : 'Try selecting a different date or reset the filter.'}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead 
                                            className="font-medium cursor-pointer hover:bg-muted/80"
                                            onClick={() => handleSort('month')}
                                        >
                                            <div className="flex items-center">
                                                Month
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="font-medium cursor-pointer hover:bg-muted/80"
                                            onClick={() => handleSort('year')}
                                        >
                                            <div className="flex items-center">
                                                Year
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-medium">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedSlips.map((slip) => (
                                        <TableRow key={slip.id}>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-medium">
                                                    {getMonthName(slip.month)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                    {slip.year}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewSalarySlip(slip)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDirectDownload(slip)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex flex-row items-center justify-end">
                        <DialogTitle className="sr-only">Salary Slip Preview</DialogTitle>
                        <Button onClick={handleDownloadSlip} className="gap-2 mr-6">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </DialogHeader>
                    <div id="salary-slip-preview">
                        {viewingSlip && <SalarySlipView salarySlip={viewingSlip} />}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
