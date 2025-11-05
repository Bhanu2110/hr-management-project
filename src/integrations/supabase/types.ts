export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: string
          created_at: string
          department: string | null
          email: string
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          password_hash: string
          password_plain: string | null
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          department?: string | null
          email: string
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          password_hash: string
          password_plain?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          password_hash?: string
          password_plain?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string | null
          employee_id: string
          id: string
          intervals: Json | null
          notes: string | null
          status: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string | null
          employee_id: string
          id?: string
          intervals?: Json | null
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string | null
          employee_id?: string
          id?: string
          intervals?: Json | null
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_fk"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department: string | null
          email: string
          employee_id: string
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          pan_number: string | null
          password_hash: string
          phone: string | null
          position: string | null
          role: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          employee_id: string
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          pan_number?: string | null
          password_hash: string
          phone?: string | null
          position?: string | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          employee_id?: string
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          pan_number?: string | null
          password_hash?: string
          phone?: string | null
          position?: string | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      form16_documents: {
        Row: {
          created_at: string | null
          employee_id: string
          file_name: string
          file_path: string
          file_size: number | null
          financial_year: string
          id: string
          quarter: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          financial_year: string
          id?: string
          quarter?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          financial_year?: string
          id?: string
          quarter?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form16_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form16_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          related_id: string | null
          related_table: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          related_id?: string | null
          related_table?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          accessible_departments: string[] | null
          accessible_employees: string[] | null
          accessible_roles: string[] | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_size: number | null
          file_url: string | null
          format: Database["public"]["Enums"]["report_format"]
          frequency: Database["public"]["Enums"]["report_frequency"] | null
          generated_by: string | null
          generated_by_name: string | null
          generated_date: string | null
          id: string
          last_downloaded: string | null
          next_run_date: string | null
          parameters: Json | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["report_visibility"]
        }
        Insert: {
          accessible_departments?: string[] | null
          accessible_employees?: string[] | null
          accessible_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url?: string | null
          format: Database["public"]["Enums"]["report_format"]
          frequency?: Database["public"]["Enums"]["report_frequency"] | null
          generated_by?: string | null
          generated_by_name?: string | null
          generated_date?: string | null
          id?: string
          last_downloaded?: string | null
          next_run_date?: string | null
          parameters?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["report_visibility"]
        }
        Update: {
          accessible_departments?: string[] | null
          accessible_employees?: string[] | null
          accessible_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url?: string | null
          format?: Database["public"]["Enums"]["report_format"]
          frequency?: Database["public"]["Enums"]["report_frequency"] | null
          generated_by?: string | null
          generated_by_name?: string | null
          generated_date?: string | null
          id?: string
          last_downloaded?: string | null
          next_run_date?: string | null
          parameters?: Json | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["report_visibility"]
        }
        Relationships: []
      }
      salary_slips: {
        Row: {
          advance_deduction: number
          basic_salary: number
          created_at: string | null
          department: string
          employee_email: string
          employee_id: string
          employee_name: string
          esi_employee: number
          esi_employer: number
          generated_date: string
          gross_earnings: number
          hra: number
          id: string
          income_tax: number
          late_deduction: number
          loan_deduction: number
          medical_allowance: number
          month: number
          net_salary: number
          other_allowances: number
          other_deductions: number
          overtime_amount: number
          overtime_hours: number
          overtime_rate: number
          paid_date: string | null
          pay_period_end: string
          pay_period_start: string
          performance_bonus: number
          pf_employee: number
          pf_employer: number
          position: string
          present_days: number
          professional_tax: number
          special_allowance: number
          status: Database["public"]["Enums"]["salary_status"]
          total_deductions: number
          transport_allowance: number
          updated_at: string | null
          working_days: number
          year: number
        }
        Insert: {
          advance_deduction: number
          basic_salary: number
          created_at?: string | null
          department: string
          employee_email: string
          employee_id: string
          employee_name: string
          esi_employee: number
          esi_employer: number
          generated_date: string
          gross_earnings: number
          hra: number
          id?: string
          income_tax: number
          late_deduction: number
          loan_deduction: number
          medical_allowance: number
          month: number
          net_salary: number
          other_allowances: number
          other_deductions: number
          overtime_amount: number
          overtime_hours: number
          overtime_rate: number
          paid_date?: string | null
          pay_period_end: string
          pay_period_start: string
          performance_bonus: number
          pf_employee: number
          pf_employer: number
          position: string
          present_days: number
          professional_tax: number
          special_allowance: number
          status?: Database["public"]["Enums"]["salary_status"]
          total_deductions: number
          transport_allowance: number
          updated_at?: string | null
          working_days: number
          year: number
        }
        Update: {
          advance_deduction?: number
          basic_salary?: number
          created_at?: string | null
          department?: string
          employee_email?: string
          employee_id?: string
          employee_name?: string
          esi_employee?: number
          esi_employer?: number
          generated_date?: string
          gross_earnings?: number
          hra?: number
          id?: string
          income_tax?: number
          late_deduction?: number
          loan_deduction?: number
          medical_allowance?: number
          month?: number
          net_salary?: number
          other_allowances?: number
          other_deductions?: number
          overtime_amount?: number
          overtime_hours?: number
          overtime_rate?: number
          paid_date?: string | null
          pay_period_end?: string
          pay_period_start?: string
          performance_bonus?: number
          pf_employee?: number
          pf_employer?: number
          position?: string
          present_days?: number
          professional_tax?: number
          special_allowance?: number
          status?: Database["public"]["Enums"]["salary_status"]
          total_deductions?: number
          transport_allowance?: number
          updated_at?: string | null
          working_days?: number
          year?: number
        }
        Relationships: []
      }
      salary_structures: {
        Row: {
          basic_salary: number
          created_at: string | null
          department: string
          effective_date: string
          employee_email: string
          employee_id: string
          employee_name: string
          esi_employee: number
          esi_employer: number
          gross_salary: number
          hra: number
          id: string
          income_tax: number
          loan_deduction: number
          medical_allowance: number
          net_salary: number
          other_allowances: number
          other_deductions: number
          overtime_amount: number
          performance_bonus: number
          pf_employee: number
          pf_employer: number
          position: string
          professional_tax: number
          special_allowance: number
          status: Database["public"]["Enums"]["salary_structure_status"]
          total_deductions: number
          transport_allowance: number
          updated_at: string | null
        }
        Insert: {
          basic_salary: number
          created_at?: string | null
          department: string
          effective_date: string
          employee_email: string
          employee_id: string
          employee_name: string
          esi_employee: number
          esi_employer: number
          gross_salary: number
          hra: number
          id?: string
          income_tax: number
          loan_deduction: number
          medical_allowance: number
          net_salary: number
          other_allowances: number
          other_deductions: number
          overtime_amount: number
          performance_bonus: number
          pf_employee: number
          pf_employer: number
          position: string
          professional_tax: number
          special_allowance: number
          status?: Database["public"]["Enums"]["salary_structure_status"]
          total_deductions: number
          transport_allowance: number
          updated_at?: string | null
        }
        Update: {
          basic_salary?: number
          created_at?: string | null
          department?: string
          effective_date?: string
          employee_email?: string
          employee_id?: string
          employee_name?: string
          esi_employee?: number
          esi_employer?: number
          gross_salary?: number
          hra?: number
          id?: string
          income_tax?: number
          loan_deduction?: number
          medical_allowance?: number
          net_salary?: number
          other_allowances?: number
          other_deductions?: number
          overtime_amount?: number
          performance_bonus?: number
          pf_employee?: number
          pf_employer?: number
          position?: string
          professional_tax?: number
          special_allowance?: number
          status?: Database["public"]["Enums"]["salary_structure_status"]
          total_deductions?: number
          transport_allowance?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { admin_email: string; password: string }
        Returns: {
          admin_id: string
          department: string
          email: string
          first_name: string
          id: string
          last_name: string
          position: string
        }[]
      }
      can_employee_check_in: { Args: { emp_id: string }; Returns: boolean }
      can_employee_check_out: { Args: { emp_id: string }; Returns: boolean }
      create_admin_user: {
        Args: {
          admin_department?: string
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_password: string
          admin_position?: string
        }
        Returns: string
      }
      create_admin_with_password: {
        Args: {
          admin_department?: string
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_password: string
          admin_position?: string
        }
        Returns: string
      }
      fix_existing_admins: { Args: never; Returns: undefined }
      generate_temp_password: { Args: never; Returns: string }
      get_attendance_status: {
        Args: { employee_uuid: string }
        Returns: {
          has_checked_in: boolean
          last_check_in: string
          last_check_out: string
          total_working_hours: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_role: { Args: { user_id: string }; Returns: string }
      handle_attendance: { Args: { emp_id: string }; Returns: Json }
      hash_password: { Args: { password: string }; Returns: string }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      link_admin_to_auth: {
        Args: { admin_email: string; admin_password: string }
        Returns: boolean
      }
      reset_admin_password: {
        Args: {
          admin_user_id?: string
          new_password: string
          target_admin_id: string
        }
        Returns: boolean
      }
      reset_employee_password: {
        Args: {
          admin_user_id?: string
          new_password: string
          target_employee_id: string
        }
        Returns: boolean
      }
      reset_employee_password_auto: {
        Args: { admin_user_id?: string; target_employee_id: string }
        Returns: string
      }
      verify_admin_setup: {
        Args: { admin_email: string }
        Returns: {
          admin_exists: boolean
          admin_user_id: string
          auth_exists: boolean
          auth_user_id: string
          user_ids_match: boolean
        }[]
      }
      verify_password: {
        Args: { hash: string; password: string }
        Returns: boolean
      }
    }
    Enums: {
      report_format: "pdf" | "excel" | "csv"
      report_frequency: "once" | "daily" | "weekly" | "monthly" | "yearly"
      report_status:
        | "pending"
        | "generating"
        | "completed"
        | "failed"
        | "scheduled"
      report_type:
        | "employee"
        | "leave"
        | "attendance"
        | "payroll"
        | "performance"
        | "compliance"
        | "department"
      report_visibility: "public" | "role_based" | "employee_specific"
      salary_status: "draft" | "processed" | "paid" | "cancelled"
      salary_structure_status: "active" | "inactive" | "pending"
      user_role: "admin" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      report_format: ["pdf", "excel", "csv"],
      report_frequency: ["once", "daily", "weekly", "monthly", "yearly"],
      report_status: [
        "pending",
        "generating",
        "completed",
        "failed",
        "scheduled",
      ],
      report_type: [
        "employee",
        "leave",
        "attendance",
        "payroll",
        "performance",
        "compliance",
        "department",
      ],
      report_visibility: ["public", "role_based", "employee_specific"],
      salary_status: ["draft", "processed", "paid", "cancelled"],
      salary_structure_status: ["active", "inactive", "pending"],
      user_role: ["admin", "employee"],
    },
  },
} as const
