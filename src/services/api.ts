import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  pan_number?: string | null;
  position: string;
  department: string;
  hire_date: string;
  phone?: string | null;
  status: string;
  role?: string;
  created_at: string;
  updated_at: string;
  // Bank details
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  branch_name?: string | null;
  account_holder_name?: string | null;
  // PF/ESI details
  pf_number?: string | null;
  uan_number?: string | null;
  esi_number?: string | null;
  // Document URLs
  aadhar_document_url?: string | null;
  pan_document_url?: string | null;
  tenth_certificate_url?: string | null;
  inter_certificate_url?: string | null;
  degree_certificate_url?: string | null;
  // CTC
  current_ctc?: number | null;
  ctc_effective_date?: string | null;
}

export const employeeService = {
  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return data || [];
  },

  async getEmployeeByPAN(panNumber: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('pan_number', panNumber.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No employee found
      }
      console.error(`Error fetching employee by PAN ${panNumber}:`, error);
      throw error;
    }

    return data;
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching employee ${id}:`, error);
      return null;
    }

    return data;
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'status'> & { user_id: string }): Promise<Employee | null> {
    try {
      console.log('Creating employee with data:', employeeData);

      const currentTime = new Date().toISOString();
      const employeeDataToInsert = {
        employee_id: employeeData.employee_id,
        user_id: employeeData.user_id,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        hire_date: employeeData.hire_date,
        status: 'active' as const,
        created_at: currentTime,
        updated_at: currentTime,
        password_hash: '',
      };

      console.log('Inserting employee with data:', employeeDataToInsert);

      const { data, error } = await supabase
        .from('employees')
        .insert(employeeDataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to create employee');
      }

      if (!data) {
        throw new Error('No data returned from server');
      }

      console.log('Successfully created employee:', data);
      return data as Employee;
    } catch (error) {
      console.error('Error in createEmployee:', error);
      throw error;
    }
  },

  async updateEmployee(id: string, employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'user_id'>>): Promise<Employee | null> {
    try {
      // Map potential legacy field `phone_number` to `phone`
      const anyData = employeeData as any;
      const mappedData: Record<string, any> = { ...anyData };
      if (mappedData.phone_number !== undefined) {
        mappedData.phone = mappedData.phone_number;
        delete mappedData.phone_number;
      }

      const updateData = {
        ...mappedData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      throw error;
    }
  },

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      // First, get the employee record to access the employee_id string
      const { data: employee, error: fetchError } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching employee for deletion:', fetchError);
        throw fetchError;
      }

      if (!employee) {
        throw new Error('Employee not found');
      }

      console.log(`Deleting employee and related records for employee_id: ${employee.employee_id}`);

      // Delete related records from tables that use string employee_id
      // These tables don't have CASCADE DELETE foreign keys, so we need to delete manually

      // 1. Delete salary slips
      const { error: slipsError } = await supabase
        .from('salary_slips')
        .delete()
        .eq('employee_id', employee.employee_id);

      if (slipsError) {
        console.error('Error deleting salary slips:', slipsError);
        // Continue with deletion even if this fails
      } else {
        console.log('Successfully deleted salary slips');
      }

      // 2. Delete salary structures
      const { error: structuresError } = await supabase
        .from('salary_structures')
        .delete()
        .eq('employee_id', employee.employee_id);

      if (structuresError) {
        console.error('Error deleting salary structures:', structuresError);
        // Continue with deletion even if this fails
      } else {
        console.log('Successfully deleted salary structures');
      }

      // 3. Delete employee-specific documents
      const { error: docsError } = await supabase
        .from('documents')
        .delete()
        .eq('employee_id', employee.employee_id);

      if (docsError) {
        console.error('Error deleting employee documents:', docsError);
        // Continue with deletion even if this fails
      } else {
        console.log('Successfully deleted employee documents');
      }

      // 4. Finally, delete the employee record
      // The database trigger will handle auth user deletion
      // Tables with UUID foreign keys (attendance, employee_compensation, form16_documents, leave_requests)
      // will be automatically handled by CASCADE DELETE constraints
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }

      console.log('Successfully deleted employee and all related records');
      return true;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },
};