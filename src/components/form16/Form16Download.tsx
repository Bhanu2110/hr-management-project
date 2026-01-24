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
import { Download, FileText, AlertCircle, RotateCcw, ArrowUpDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type Form16SortField = 'financial_year' | 'quarter' | 'file_name' | 'file_size' | 'uploaded_at';
type SortDirection = 'asc' | 'desc';

interface Form16Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  financial_year: string;
  quarter: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export function Form16Download() {
  const { employee, isEmployee } = useAuth();
  const [documents, setDocuments] = useState<Form16Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Form16Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Sorting states
  const [sortField, setSortField] = useState<Form16SortField>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (isEmployee && employee?.id) {
      fetchForm16Documents();
    }
  }, [isEmployee, employee?.id]);

  useEffect(() => {
    applyFilters();
  }, [documents, selectedMonth, selectedYear]);

  const fetchForm16Documents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form16_documents')
        .select('*')
        .eq('employee_id', employee?.id)
        .order('financial_year', { ascending: false });

      if (error) {
        console.error('Error fetching Form 16 documents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch Form 16 documents",
          variant: "destructive",
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching Form 16 documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Form 16 documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate month options
  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (last 5 years to next year)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => (currentYearNum - 5 + i).toString());

  const applyFilters = () => {
    let filtered = [...documents];

    if (selectedMonth !== "all") {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploaded_at);
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth) - 1; // JavaScript months are 0-indexed
        return (
          docDate.getFullYear() === year &&
          docDate.getMonth() === month
        );
      });
    }

    setFilteredDocuments(filtered);
  };

  const handleSort = (field: Form16SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'financial_year':
          comparison = a.financial_year.localeCompare(b.financial_year);
          break;
        case 'quarter':
          const quarterA = a.quarter || '';
          const quarterB = b.quarter || '';
          comparison = quarterA.localeCompare(quarterB);
          break;
        case 'file_name':
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case 'file_size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
        case 'uploaded_at':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredDocuments, sortField, sortDirection]);

  const handleDownload = async (document: Form16Document) => {
    try {
      setDownloadingId(document.id);

      // Extract the file path from the public URL
      const pathMatch = document.file_path.match(/form16\/.+/);
      if (!pathMatch) {
        toast({
          title: "Download Failed",
          description: "Invalid file path",
          variant: "destructive",
        });
        return;
      }

      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(pathMatch[0], 60);

      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Download Failed",
          description: "Failed to generate download link",
          variant: "destructive",
        });
        return;
      }

      // Fetch the file and force download
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${document.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isEmployee) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Access denied. Only employees can view Form 16 documents.</p>
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
            My Form 16 Documents
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
                <h1 className="text-2xl font-bold text-foreground">Form 16 Documents</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {employee?.first_name} {employee?.last_name} (ID: {employee?.employee_id})
                </p>
              </div>
            </div>
            {/* Filters - moved to header */}
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
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

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {documents.length === 0 ? 'No Form 16 documents available' : 'No documents match the selected date'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {documents.length === 0
                    ? 'Contact your HR administrator to upload your Form 16 documents.'
                    : 'Try selecting a different date or reset the filter.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[60px]">S.No</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('financial_year')}
                    >
                      <div className="flex items-center gap-1">
                        Financial Year
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('quarter')}
                    >
                      <div className="flex items-center gap-1">
                        Quarter
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('file_name')}
                    >
                      <div className="flex items-center gap-1">
                        File Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('file_size')}
                    >
                      <div className="flex items-center gap-1">
                        File Size
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('uploaded_at')}
                    >
                      <div className="flex items-center gap-1">
                        Upload Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((document, index) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {document.financial_year}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.quarter ? (
                          <Badge variant="outline" className="font-medium">
                            {document.quarter}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">{document.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(document.file_size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(document.uploaded_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Available
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(document)}
                          disabled={downloadingId === document.id}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {downloadingId === document.id ? 'Downloading...' : 'Download PDF'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
