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
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
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
          check_in: string
          check_out: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          status: string
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
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
          approved_at: string
          approved_by: string | null
          created_at: string
          days: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          days: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string
          updated_at?: string
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
          id: string
          recipient_id: string
          title: string
          message: string
          type: string
          related_table: string | null
          related_id: string | null
          is_read: boolean
          action_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          title: string
          message: string
          type?: string
          related_table?: string | null
          related_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          title?: string
          message?: string
          type?: string
          related_table?: string | null
          related_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_attendance_status: {
        Args: { employee_uuid: string }
        Returns: {
          has_checked_in: boolean
          last_check_in: string
          last_check_out: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      handle_attendance: {
        Args: { employee_id: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
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
      user_role: ["admin", "employee"],
    },
  },
} as const
