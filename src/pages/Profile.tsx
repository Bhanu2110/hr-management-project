import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, Calendar, Edit, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { employeeService, Employee } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/context/ThemeContext';

const Profile = () => {
  const { employee, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColor } = useTheme();
  const [employeeDetails, setEmployeeDetails] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    hire_date: "",
    role: "",
  });

  useEffect(() => {
    if (employee) {
      setEmployeeDetails({
        id: employee.id,
        employee_id: employee.employee_id,
        user_id: employee.user_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || "Not provided",
        department: employee.department,
        position: employee.position,
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : "dd-mm-yyyy",
        role: employee.role,
      });
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEmployeeDetails(prevDetails => ({ ...prevDetails, [id]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (employeeDetails.id) {
        const updatedData: Partial<Omit<Employee, 'id' | 'created_at' | 'user_id'>> = {
          first_name: employeeDetails.first_name,
          last_name: employeeDetails.last_name,
          email: employeeDetails.email,
          phone: employeeDetails.phone === "Not provided" ? null : employeeDetails.phone,
          department: employeeDetails.department,
          position: employeeDetails.position,
          hire_date: employeeDetails.hire_date,
          // Add other fields that can be updated
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
            {employeeDetails.role}
          </Badge>

          <div className="space-y-3 w-full text-left">
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span>{employeeDetails.email}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{employeeDetails.phone}</span>
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
        <Card className="md:col-span-2 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Personal Information</CardTitle>
            <p className="text-muted-foreground">Your personal details and contact information</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 px-0 pb-0">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" value={employeeDetails.first_name || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" value={employeeDetails.last_name || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={employeeDetails.email || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={employeeDetails.phone || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={employeeDetails.address || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={employeeDetails.department || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" value={employeeDetails.position || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input id="hire_date" type="text" placeholder="YYYY-MM-DD" value={employeeDetails.hire_date || ''} onChange={handleInputChange} disabled={!isEditing} />
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
      </div>
    </div>
  );
};

export default Profile;
