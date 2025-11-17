import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  user_id: string;  // Added user_id field
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
  created_at: string;
  updated_at: string;
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
      // Delete the employee record - the database trigger will handle auth user deletion
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },
};