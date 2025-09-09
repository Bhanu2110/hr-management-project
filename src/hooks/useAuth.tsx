import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  position?: string;
  phone?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, employeeData: Partial<Employee>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployeeData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching employee data:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching employee data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch employee data
          setTimeout(async () => {
            const employeeData = await fetchEmployeeData(session.user.id);
            setEmployee(employeeData as Employee);
            setLoading(false);
          }, 0);
        } else {
          setEmployee(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchEmployeeData(session.user.id).then((employeeData) => {
          setEmployee(employeeData as Employee);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, employeeData: Partial<Employee>) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    // If signup successful and user is created, create employee record
    if (data.user) {
      const { error: employeeError } = await supabase
        .from('employees')
        .insert([{
          user_id: data.user.id,
          employee_id: employeeData.employee_id || `EMP${Date.now()}`,
          first_name: employeeData.first_name || '',
          last_name: employeeData.last_name || '',
          email: email,
          role: employeeData.role || 'employee',
          department: employeeData.department,
          position: employeeData.position,
        }]);

      if (employeeError) {
        console.error('Error creating employee record:', employeeError);
        toast({
          title: "Registration Warning",
          description: "Account created but employee profile setup failed. Please contact admin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account.",
        });
      }
    }

    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEmployee(null);
    setLoading(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const isAdmin = employee?.role === 'admin';
  const isEmployee = employee?.role === 'employee';

  const value = {
    user,
    session,
    employee,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}