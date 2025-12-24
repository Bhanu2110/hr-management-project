import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    CreditCard,
    Building,
    FileText,
    Download,
    Eye,
    Loader2,
    File,
    Image as ImageIcon,
} from "lucide-react";
import { Employee } from "@/services/api";
import { Document } from "@/types/documents";
import { fetchEmployeeDocuments, downloadDocument } from "@/api/documents";
import { formatFileSize } from "@/types/documents";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ViewEmployeeDialogProps {
    employee: Employee;
    trigger?: React.ReactNode;
}

export const ViewEmployeeDialog = ({ employee, trigger }: ViewEmployeeDialogProps) => {
    const [open, setOpen] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
    const [viewingDoc, setViewingDoc] = useState<string | null>(null);
    const [isOnLeaveToday, setIsOnLeaveToday] = useState(false);
    const { toast } = useToast();
    const { themeColor } = useTheme();

    useEffect(() => {
        if (open) {
            loadDocuments();
            checkLeaveStatus();
        }
    }, [open, employee.id]);

    const checkLeaveStatus = async () => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const { data } = await supabase
                .from('leave_requests')
                .select('id')
                .eq('employee_id', employee.id)
                .eq('status', 'approved')
                .lte('start_date', today)
                .gte('end_date', today)
                .limit(1);
            
            setIsOnLeaveToday(data && data.length > 0);
        } catch (error) {
            console.error("Failed to check leave status:", error);
        }
    };

    // Get display status considering active leave
    const getDisplayStatus = () => {
        if (isOnLeaveToday) {
            return 'on_leave';
        }
        return employee.status;
    };

    const loadDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const docs = await fetchEmployeeDocuments(employee.id);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents:", error);
            toast({
                title: "Error",
                description: "Failed to load employee documents",
                variant: "destructive",
            });
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleDownload = async (docId: string) => {
        try {
            setDownloadingDoc(docId);
            await downloadDocument(docId);
            toast({
                title: "Success",
                description: "Document downloaded successfully",
            });
        } catch (error) {
            console.error("Failed to download document:", error);
            toast({
                title: "Error",
                description: "Failed to download document",
                variant: "destructive",
            });
        } finally {
            setDownloadingDoc(null);
        }
    };

    const handleView = async (fileUrl: string) => {
        try {
            // Check if it's a Supabase storage URL
            if (fileUrl.includes('/storage/v1/object/public/')) {
                // Extract bucket name and file path
                const urlParts = fileUrl.split('/storage/v1/object/public/');
                if (urlParts.length > 1) {
                    const [bucketAndPath] = urlParts[1].split('/');
                    const filePath = urlParts[1].substring(bucketAndPath.length + 1);

                    // Try to create a signed URL for better access
                    const { data, error } = await supabase.storage
                        .from(bucketAndPath)
                        .createSignedUrl(filePath, 3600); // 1 hour expiry

                    if (error) {
                        console.warn('Could not create signed URL, trying direct access:', error);
                        // Fallback to direct URL
                        window.open(fileUrl, '_blank');
                    } else if (data?.signedUrl) {
                        window.open(data.signedUrl, '_blank');
                    }
                } else {
                    window.open(fileUrl, '_blank');
                }
            } else {
                // Not a Supabase storage URL, open directly
                window.open(fileUrl, '_blank');
            }
        } catch (error) {
            console.error('Error viewing document:', error);
            toast({
                title: "Error",
                description: "Failed to open document. Please try downloading instead.",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default";
            case "inactive":
                return "destructive";
            case "on_leave":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image/")) {
            return <ImageIcon className="h-8 w-8" style={{ color: themeColor }} />;
        }
        return <FileText className="h-8 w-8" style={{ color: themeColor }} />;
    };

    // Employee profile documents from employee table
    const profileDocuments = [
        {
            label: "Aadhar Card",
            url: employee.aadhar_document_url,
            type: "aadhar",
        },
        {
            label: "PAN Card",
            url: employee.pan_document_url,
            type: "pan",
        },
        {
            label: "10th Certificate",
            url: employee.tenth_certificate_url,
            type: "tenth",
        },
        {
            label: "12th/Intermediate Certificate",
            url: employee.inter_certificate_url,
            type: "inter",
        },
        {
            label: "Degree Certificate",
            url: employee.degree_certificate_url,
            type: "degree",
        },
    ].filter((doc) => doc.url);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Employee Details</DialogTitle>
                    <DialogDescription>
                        Complete information and documents for {employee.first_name} {employee.last_name}
                    </DialogDescription>
                </DialogHeader>


                <Tabs defaultValue="personal" className="w-full">
                    <style>{`
                        [data-theme-tab][data-state="active"] {
                            background-color: ${themeColor} !important;
                            color: white !important;
                        }
                    `}</style>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="personal" data-theme-tab>Personal Info</TabsTrigger>
                        <TabsTrigger value="employment" data-theme-tab>Employment</TabsTrigger>
                        <TabsTrigger value="banking" data-theme-tab>Banking & PF</TabsTrigger>
                        <TabsTrigger value="documents" data-theme-tab>Documents</TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center mb-6">
                                    <div
                                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        {employee.first_name[0]}
                                        {employee.last_name[0]}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            First Name
                                        </label>
                                        <p className="text-base font-medium">{employee.first_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Last Name
                                        </label>
                                        <p className="text-base font-medium">{employee.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </label>
                                        <p className="text-base">{employee.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone
                                        </label>
                                        <p className="text-base">{employee.phone || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            PAN Number
                                        </label>
                                        <p className="text-base font-mono">{employee.pan_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </label>
                                        <div className="mt-1">
                                            <Badge variant={getStatusVariant(getDisplayStatus())} className="capitalize">
                                                {getDisplayStatus().replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Employment Information Tab */}
                    <TabsContent value="employment" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Employment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Employee ID
                                        </label>
                                        <p className="text-base font-mono font-medium">{employee.employee_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Position
                                        </label>
                                        <p className="text-base font-medium">{employee.position}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Department
                                        </label>
                                        <p className="text-base">{employee.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Hire Date
                                        </label>
                                        <p className="text-base">{formatDate(employee.hire_date)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Current CTC
                                        </label>
                                        <p className="text-base font-medium">
                                            {employee.current_ctc
                                                ? `₹${employee.current_ctc.toLocaleString()}`
                                                : "N/A"}
                                        </p>
                                    </div>
                                    {employee.ctc_effective_date && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                CTC Effective Date
                                            </label>
                                            <p className="text-base">{formatDate(employee.ctc_effective_date)}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Banking & PF Information Tab */}
                    <TabsContent value="banking" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Banking Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Bank Name
                                        </label>
                                        <p className="text-base">{employee.bank_name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Account Number
                                        </label>
                                        <p className="text-base font-mono">{employee.account_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            IFSC Code
                                        </label>
                                        <p className="text-base font-mono">{employee.ifsc_code || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Branch Name
                                        </label>
                                        <p className="text-base">{employee.branch_name || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Account Holder Name
                                        </label>
                                        <p className="text-base">{employee.account_holder_name || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    PF & ESI Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            PF Number
                                        </label>
                                        <p className="text-base font-mono">{employee.pf_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            UAN Number
                                        </label>
                                        <p className="text-base font-mono">{employee.uan_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            ESI Number
                                        </label>
                                        <p className="text-base font-mono">{employee.esi_number || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4">
                        {/* Profile Documents */}
                        {profileDocuments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2" style={{ color: themeColor }}>
                                        <FileText className="h-5 w-5" />
                                        Profile Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profileDocuments.map((doc) => (
                                            <div
                                                key={doc.type}
                                                className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        {getFileIcon("application/pdf")}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.label}</p>
                                                        <p className="text-sm text-muted-foreground">Document</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="text-white"
                                                        style={{ backgroundColor: themeColor }}
                                                        onClick={() => handleView(doc.url!)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            try {
                                                                // Get the file URL - use signed URL if it's from Supabase storage
                                                                let fileUrl = doc.url!;

                                                                // Check if it's a Supabase storage URL
                                                                if (fileUrl.includes('/storage/v1/object/public/')) {
                                                                    const urlParts = fileUrl.split('/storage/v1/object/public/');
                                                                    if (urlParts.length > 1) {
                                                                        const pathParts = urlParts[1].split('/');
                                                                        const bucketName = pathParts[0];
                                                                        const filePath = pathParts.slice(1).join('/');

                                                                        // Create signed URL
                                                                        const { data, error } = await supabase.storage
                                                                            .from(bucketName)
                                                                            .createSignedUrl(filePath, 60);

                                                                        if (!error && data?.signedUrl) {
                                                                            fileUrl = data.signedUrl;
                                                                        }
                                                                    }
                                                                }

                                                                // Fetch the file
                                                                const response = await fetch(fileUrl);

                                                                if (!response.ok) {
                                                                    throw new Error(`HTTP error! status: ${response.status}`);
                                                                }

                                                                // Get content type from response header
                                                                const contentType = response.headers.get('content-type') || '';
                                                                const blob = await response.blob();

                                                                // Detect file extension - try URL first, then MIME type
                                                                let extension = '';

                                                                // First, try to get extension from URL (remove query params first)
                                                                const urlPath = doc.url!.split('?')[0];
                                                                const urlParts = urlPath.split('.');
                                                                if (urlParts.length > 1) {
                                                                    const urlExt = urlParts[urlParts.length - 1].toLowerCase();
                                                                    // Validate it's a reasonable extension
                                                                    if (/^[a-z0-9]{2,5}$/.test(urlExt)) {
                                                                        extension = urlExt;
                                                                    }
                                                                }

                                                                // If no extension from URL, try Content-Type header
                                                                if (!extension && contentType) {
                                                                    const mimeToExt: Record<string, string> = {
                                                                        'application/pdf': 'pdf',
                                                                        'image/jpeg': 'jpg',
                                                                        'image/jpg': 'jpg',
                                                                        'image/png': 'png',
                                                                        'image/gif': 'gif',
                                                                        'image/webp': 'webp',
                                                                        'image/bmp': 'bmp',
                                                                        'image/tiff': 'tiff',
                                                                    };
                                                                    extension = mimeToExt[contentType] || '';
                                                                }

                                                                // Last resort: check blob type
                                                                if (!extension && blob.type) {
                                                                    const mimeToExt: Record<string, string> = {
                                                                        'application/pdf': 'pdf',
                                                                        'image/jpeg': 'jpg',
                                                                        'image/png': 'png',
                                                                    };
                                                                    extension = mimeToExt[blob.type] || '';
                                                                }

                                                                // Final fallback
                                                                if (!extension) {
                                                                    extension = 'bin';
                                                                }

                                                                // Create a new blob with correct MIME type if needed
                                                                const finalBlob = contentType && blob.type !== contentType
                                                                    ? new Blob([blob], { type: contentType })
                                                                    : blob;

                                                                // Create blob URL with the correct blob
                                                                const blobUrl = window.URL.createObjectURL(finalBlob);

                                                                // Sanitize filename and include employee name
                                                                const sanitizedLabel = doc.label.replace(/[^a-zA-Z0-9\s-_]/g, '');
                                                                const employeeName = employee.first_name.replace(/[^a-zA-Z0-9\s-_]/g, '');
                                                                const fileName = `${employeeName} ${sanitizedLabel}.${extension}`;

                                                                // Create download link
                                                                const link = document.createElement("a");
                                                                link.href = blobUrl;
                                                                link.download = fileName;
                                                                link.setAttribute('download', fileName);
                                                                document.body.appendChild(link);
                                                                link.click();

                                                                // Cleanup after a short delay
                                                                setTimeout(() => {
                                                                    document.body.removeChild(link);
                                                                    window.URL.revokeObjectURL(blobUrl);
                                                                }, 100);

                                                                toast({
                                                                    title: "Success",
                                                                    description: `Downloaded ${fileName}`,
                                                                });
                                                            } catch (error) {
                                                                console.error("Download error:", error);
                                                                console.error("Document URL:", doc.url);

                                                                // Fallback: try to open URL directly
                                                                try {
                                                                    window.open(doc.url!, '_blank');
                                                                    toast({
                                                                        title: "Opening in new tab",
                                                                        description: "Could not download directly. Opening in new tab instead.",
                                                                    });
                                                                } catch (fallbackError) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: error instanceof Error ? error.message : "Failed to download document",
                                                                        variant: "destructive",
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Other Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ color: themeColor }}>
                                    <File className="h-5 w-5" />
                                    Other Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingDocuments ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No additional documents found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="mt-1">
                                                            {getFileIcon(doc.file_type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{doc.title}</p>
                                                            {doc.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                    {doc.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                <span>{formatFileSize(doc.file_size)}</span>
                                                                <span>•</span>
                                                                <span className="capitalize">{doc.category}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(doc.uploaded_date)}</span>
                                                            </div>
                                                            {doc.is_confidential && (
                                                                <Badge variant="destructive" className="mt-2 text-xs">
                                                                    Confidential
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <Button
                                                            size="sm"
                                                            className="text-white"
                                                            style={{ backgroundColor: themeColor }}
                                                            onClick={() => handleView(doc.file_url)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="text-white"
                                                            style={{ backgroundColor: themeColor }}
                                                            onClick={() => handleDownload(doc.id)}
                                                            disabled={downloadingDoc === doc.id}
                                                        >
                                                            {downloadingDoc === doc.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Download className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
