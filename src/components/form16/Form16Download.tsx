import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Calendar, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isEmployee && employee?.id) {
      fetchForm16Documents();
    }
  }, [isEmployee, employee?.id]);

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

  const handleDownload = async (document: Form16Document) => {
    try {
      setDownloadingId(document.id);
      
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60); // URL valid for 1 minute

      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Download Failed",
          description: "Failed to generate download link",
          variant: "destructive",
        });
        return;
      }

      // Try direct download with proper headers
      try {
        const response = await fetch(data.signedUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        
        const blob = await response.blob();
        
        // Use modern download API if available
        if ('showSaveFilePicker' in window) {
          // Modern File System Access API (Chrome 86+)
          try {
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: document.file_name,
              types: [{
                description: 'PDF files',
                accept: { 'application/pdf': ['.pdf'] },
              }],
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
          } catch (err) {
            // Fall back to traditional method if user cancels or API fails
          }
        }
        
        // Traditional download method
        const blobUrl = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = blobUrl;
        link.download = document.file_name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Trigger download
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        
      } catch (fetchError) {
        // Fallback: open in new tab with download headers
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.file_name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Form 16 Documents</h1>
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
              Your Form 16 Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Form 16 documents available</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your HR administrator to upload your Form 16 documents.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Financial Year</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
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
