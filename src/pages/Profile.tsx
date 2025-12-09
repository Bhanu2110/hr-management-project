import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, Calendar, Edit, Loader2, Upload, FileText, ExternalLink, Trash2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { employeeService, Employee } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { employee, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColor } = useTheme();
  
  // Document upload states
  const [tenthCertFile, setTenthCertFile] = useState<File | null>(null);
  const [interCertFile, setInterCertFile] = useState<File | null>(null);
  const [degreeCertFile, setDegreeCertFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const [employeeDetails, setEmployeeDetails] = useState<Partial<Employee>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hire_date: "",
    pan_number: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    account_holder_name: "",
    tenth_certificate_url: "",
    inter_certificate_url: "",
    degree_certificate_url: "",
  });

  useEffect(() => {
    if (employee) {
      // Cast employee to access all database fields
      const emp = employee as any;
      setEmployeeDetails({
        id: emp.id,
        employee_id: emp.employee_id,
        user_id: emp.user_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone || "",
        department: emp.department,
        position: emp.position,
        hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : "",
        pan_number: emp.pan_number || "",
        bank_name: emp.bank_name || "",
        account_number: emp.account_number || "",
        ifsc_code: emp.ifsc_code || "",
        branch_name: emp.branch_name || "",
        account_holder_name: emp.account_holder_name || "",
        tenth_certificate_url: emp.tenth_certificate_url || "",
        inter_certificate_url: emp.inter_certificate_url || "",
        degree_certificate_url: emp.degree_certificate_url || "",
      });
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEmployeeDetails(prevDetails => ({ ...prevDetails, [id]: value }));
  };

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

  const handleDocumentUpload = async (docType: 'tenth' | 'inter' | 'degree', file: File) => {
    if (!employeeDetails.employee_id || !employeeDetails.id) return;
    
    setUploadingDoc(docType);
    try {
      const url = await uploadFile(file, `certificates/${docType}`, employeeDetails.employee_id);
      if (url) {
        const fieldName = `${docType}_certificate_url`;
        await employeeService.updateEmployee(employeeDetails.id, { [fieldName]: url } as any);
        setEmployeeDetails(prev => ({ ...prev, [fieldName]: url }));
        toast({
          title: "Success",
          description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} certificate uploaded successfully.`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload ${docType} certificate.`,
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(null);
      if (docType === 'tenth') setTenthCertFile(null);
      if (docType === 'inter') setInterCertFile(null);
      if (docType === 'degree') setDegreeCertFile(null);
    }
  };

  const handleDeleteDocument = async (docType: 'tenth' | 'inter' | 'degree') => {
    if (!employeeDetails.id) return;
    
    setUploadingDoc(docType);
    try {
      const fieldName = `${docType}_certificate_url`;
      await employeeService.updateEmployee(employeeDetails.id, { [fieldName]: null } as any);
      setEmployeeDetails(prev => ({ ...prev, [fieldName]: "" }));
      toast({
        title: "Success",
        description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} certificate removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove ${docType} certificate.`,
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const viewDocument = async (url: string) => {
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (employeeDetails.id) {
        // Only allow updating specific fields (NOT first_name, last_name, department, position, role)
        const updatedData: Partial<Employee> = {
          email: employeeDetails.email,
          phone: employeeDetails.phone || null,
          pan_number: employeeDetails.pan_number || null,
          bank_name: employeeDetails.bank_name || null,
          account_number: employeeDetails.account_number || null,
          ifsc_code: employeeDetails.ifsc_code || null,
          branch_name: employeeDetails.branch_name || null,
          account_holder_name: employeeDetails.account_holder_name || null,
        };
        await employeeService.updateEmployee(employeeDetails.id, updatedData);
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  const DocumentUploadCard = ({ 
    title, 
    docType, 
    file, 
    setFile, 
    existingUrl 
  }: { 
    title: string; 
    docType: 'tenth' | 'inter' | 'degree'; 
    file: File | null; 
    setFile: (f: File | null) => void;
    existingUrl?: string;
  }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{title}</Label>
        {existingUrl && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Uploaded
          </Badge>
        )}
      </div>
      
      {existingUrl ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => viewDocument(existingUrl)}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Document
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDeleteDocument(docType)}
            disabled={uploadingDoc === docType}
            className="text-red-600 hover:text-red-700"
          >
            {uploadingDoc === docType ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleDocumentUpload(docType, file)}
              disabled={uploadingDoc === docType}
              className="w-full"
              style={{ backgroundColor: themeColor }}
            >
              {uploadingDoc === docType ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)} className="flex items-center space-x-2 text-white" style={{ backgroundColor: themeColor, borderColor: themeColor }}>
          <Edit className="h-4 w-4" />
          <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Manage your personal information</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-semibold text-white mb-4" style={{ backgroundColor: themeColor }}>
            {employeeDetails.first_name ? employeeDetails.first_name.charAt(0) : ''}{employeeDetails.last_name ? employeeDetails.last_name.charAt(0) : ''}
          </div>
          <h2 className="text-xl font-semibold mb-1">{employeeDetails.first_name} {employeeDetails.last_name}</h2>
          <p className="text-muted-foreground mb-4">{employeeDetails.position}</p>
          <Badge className="text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ backgroundColor: themeColor ? `${themeColor}1A` : '' }}>
            {employee?.role || 'employee'}
          </Badge>

          <div className="space-y-3 w-full text-left">
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span>{employeeDetails.email}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{employeeDetails.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{employeeDetails.department}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{employeeDetails.hire_date}</span>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information - Read Only Fields */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Personal Information</CardTitle>
              <p className="text-muted-foreground text-sm">These fields can only be edited by admin</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 px-0 pb-0">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" value={employeeDetails.first_name || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" value={employeeDetails.last_name || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={employeeDetails.department || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" value={employeeDetails.position || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={employee?.role || 'employee'} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input id="hire_date" value={employeeDetails.hire_date || ''} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Editable Contact & Bank Details */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Contact & Bank Details</CardTitle>
              <p className="text-muted-foreground text-sm">You can update these details</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 px-0 pb-0">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={employeeDetails.email || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={employeeDetails.phone || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input id="pan_number" value={(employeeDetails as any).pan_number || ''} onChange={handleInputChange} disabled={!isEditing} className="uppercase" maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                <Input id="account_holder_name" value={(employeeDetails as any).account_holder_name || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" value={(employeeDetails as any).bank_name || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input id="account_number" value={(employeeDetails as any).account_number || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input id="ifsc_code" value={(employeeDetails as any).ifsc_code || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch_name">Branch Name</Label>
                <Input id="branch_name" value={(employeeDetails as any).branch_name || ''} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </CardContent>
            {isEditing && (
              <div className="flex justify-end mt-6">
                <Button onClick={handleSave} className="text-white" style={{ backgroundColor: themeColor, borderColor: themeColor }} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes
                </Button>
              </div>
            )}
          </Card>

          {/* Document Upload Section */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <p className="text-muted-foreground text-sm">Upload your educational certificates</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 px-0 pb-0">
              <DocumentUploadCard
                title="10th Certificate"
                docType="tenth"
                file={tenthCertFile}
                setFile={setTenthCertFile}
                existingUrl={(employeeDetails as any).tenth_certificate_url}
              />
              <DocumentUploadCard
                title="Intermediate Certificate"
                docType="inter"
                file={interCertFile}
                setFile={setInterCertFile}
                existingUrl={(employeeDetails as any).inter_certificate_url}
              />
              <DocumentUploadCard
                title="Degree Certificate"
                docType="degree"
                file={degreeCertFile}
                setFile={setDegreeCertFile}
                existingUrl={(employeeDetails as any).degree_certificate_url}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;