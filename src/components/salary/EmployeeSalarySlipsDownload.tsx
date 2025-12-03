import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, AlertCircle, Eye, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SalarySlipView } from './SalarySlipView';
import { MONTHS, SalarySlip } from '@/types/salary';

export function EmployeeSalarySlipsDownload() {
    const { employee, isEmployee } = useAuth();
    const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
    const [filteredSlips, setFilteredSlips] = useState<SalarySlip[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);
    const [downloadingSlip, setDownloadingSlip] = useState<SalarySlip | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    // Filter states
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (isEmployee && employee?.id) {
            fetchSalarySlips();
        }
    }, [isEmployee, employee?.id]);

    // Apply filters whenever slips or filter values change
    useEffect(() => {
        applyFilters();
    }, [salarySlips, selectedDate]);

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

    const applyFilters = () => {
        let filtered = [...salarySlips];

        if (selectedDate) {
            const filterYear = selectedDate.getFullYear();
            const filterMonth = selectedDate.getMonth() + 1; // Convert to 1-indexed

            filtered = filtered.filter(slip =>
                slip.year === filterYear && slip.month === filterMonth
            );
        }

        setFilteredSlips(filtered);
    };

    const handleDirectDownload = async (slip: SalarySlip) => {
        setDownloadingSlip(slip);
        // We need to wait for the state to update and the hidden element to render
        setTimeout(async () => {
            try {
                const html2pdf = (await import('html2pdf.js')).default;
                const element = document.getElementById('hidden-salary-slip-print');

                if (!element) {
                    throw new Error("Element not found");
                }

                const monthName = MONTHS.find(m => m.value === slip.month)?.label || 'Unknown';
                const opt = {
                    margin: 10,
                    filename: `salary-slip-${slip.employee_name}-${monthName}-${slip.year}.pdf`,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
                };

                toast({
                    title: "Generating PDF",
                    description: "Please wait...",
                });
                await html2pdf().set(opt).from(element).save();
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
            } finally {
                setDownloadingSlip(null);
            }
        }, 100);
    };

    const handleViewSalarySlip = (slip: SalarySlip) => {
        setViewingSlip(slip);
        setIsViewDialogOpen(true);
    };

    const handleDownloadSlip = async () => {
        if (viewingSlip) {
            try {
                const html2pdf = (await import('html2pdf.js')).default;
                const element = document.getElementById('salary-slip-preview');

                if (!element) {
                    toast({
                        title: "Error",
                        description: "Unable to find salary slip content",
                        variant: "destructive",
                    });
                    return;
                }

                const monthName = MONTHS.find(m => m.value === viewingSlip.month)?.label || 'Unknown';
                const opt = {
                    margin: 10,
                    filename: `salary-slip-${viewingSlip.employee_name}-${monthName}-${viewingSlip.year}.pdf`,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
                };

                toast({
                    title: "Generating PDF",
                    description: "Please wait...",
                });
                await html2pdf().set(opt).from(element).save();
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Salary Slips</h1>
                                <p className="text-sm text-gray-600">
                                    Welcome, {employee?.first_name} {employee?.last_name} (ID: {employee?.employee_id})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Your Salary Slips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Date Filter */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-[240px]">
                                <DatePicker
                                    date={selectedDate}
                                    setDate={setSelectedDate}
                                    className="w-full"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedDate(undefined)}
                                title="Reset Filter"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Salary Slips Table */}
                        {filteredSlips.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
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
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSlips.map((slip) => (
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
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
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
                    <DialogHeader>
                        <DialogTitle>Salary Slip Preview</DialogTitle>
                    </DialogHeader>
                    <div id="salary-slip-preview">
                        {viewingSlip && <SalarySlipView salarySlip={viewingSlip} onDownload={handleDownloadSlip} />}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden element for direct PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div id="hidden-salary-slip-print">
                    {downloadingSlip && <SalarySlipView salarySlip={downloadingSlip} />}
                </div>
            </div>
        </div>
    );
}
