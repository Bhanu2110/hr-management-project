import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Log environment variables for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface Employee {
  id: string;
  user_id: string;  // Added user_id field
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  hire_date: string;
  phone_number?: string | null;
  status: 'active' | 'inactive' | 'on_leave';
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
};
