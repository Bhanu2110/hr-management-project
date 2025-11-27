import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Form16Management } from "@/components/form16/Form16Management";
import { Form16Download } from "@/components/form16/Form16Download";
import { useState, useEffect } from "react";
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

const Form16 = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <AppLayout>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading employees...</p>
          </div>
        ) : (
          <Form16Management employees={employees} />
        )}
      </AppLayout>
    );
  }

  // For employees, show only the Form 16 download component with sidebar
  return (
    <AppLayout>
      <Form16Download />
    </AppLayout>
  );
};

export default Form16;