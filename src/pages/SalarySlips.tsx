import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from 'lucide-react';
import { EmployeeSalarySlipsDownload } from "@/components/salary/EmployeeSalarySlipsDownload";
import { SalaryManagement } from "@/components/salary/SalaryManagement";
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
}

const SalarySlips = () => {
  const { isAdmin, loading: authLoading } = useAuth();
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
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  if (authLoading || (isAdmin && loading)) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Admin view - show salary management
  if (isAdmin) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Salary Slips Management</h1>
          <SalaryManagement />
        </div>
      </AppLayout>
    );
  }

  // Employee view - show salary slips download table
  return (
    <AppLayout>
      <EmployeeSalarySlipsDownload />
    </AppLayout>
  );
};

export default SalarySlips;