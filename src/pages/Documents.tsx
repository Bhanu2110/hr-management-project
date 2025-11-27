import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { AdminDocumentManagement } from "@/components/documents/AdminDocumentManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
}

const Documents = () => {
  const { user, isAdmin, employee } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('id, employee_id, first_name, last_name, email, department, position')
          .order('first_name', { ascending: true });

        if (error) {
          console.error('Error fetching employees:', error);
        } else {
          setEmployees(data || []);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading documents...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please log in to access your documents.
              </p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {isAdmin ? (
          <AdminDocumentManagement employees={employees} />
        ) : (
          <DocumentViewer
            employeeId={employee?.employee_id || "EMP001"}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Documents;