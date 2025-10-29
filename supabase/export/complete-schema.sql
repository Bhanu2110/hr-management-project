-- Complete Database Schema Export
-- Run this in a new Supabase project to recreate the entire database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- Create custom types/enums
CREATE TYPE public.user_role AS ENUM ('admin', 'employee');
CREATE TYPE public.salary_status AS ENUM ('draft', 'pending', 'approved', 'paid', 'cancelled');
CREATE TYPE public.salary_structure_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.report_status AS ENUM ('pending', 'generating', 'completed', 'failed', 'scheduled');
CREATE TYPE public.report_frequency AS ENUM ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE public.report_visibility AS ENUM ('public', 'role_based', 'department_based', 'employee_specific');

-- ============================================
-- TABLES
-- ============================================

-- Admins table
CREATE TABLE public.admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT gen_random_uuid(),
    admin_id character varying NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    department text,
    position text,
    phone text,
    status text DEFAULT 'active'::text,
    hire_date date DEFAULT CURRENT_DATE,
    password_plain text,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(email),
    UNIQUE(admin_id)
);

-- Employees table
CREATE TABLE public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    employee_id character varying NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    department text,
    position text,
    role text DEFAULT 'employee'::text NOT NULL,
    status text DEFAULT 'active'::text,
    hire_date date DEFAULT CURRENT_DATE,
    pan_number character varying,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(email),
    UNIQUE(employee_id)
);

-- Attendance table
CREATE TABLE public.attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    check_in timestamp with time zone DEFAULT now() NOT NULL,
    check_out timestamp with time zone,
    total_hours numeric,
    status text DEFAULT 'present'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);

-- Leave requests table
CREATE TABLE public.leave_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    leave_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days integer NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES public.admins(id)
);

-- Notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id uuid NOT NULL,
    title character varying NOT NULL,
    message text NOT NULL,
    type character varying DEFAULT 'info'::character varying NOT NULL,
    related_table character varying,
    related_id uuid,
    action_url character varying,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (recipient_id) REFERENCES public.admins(id) ON DELETE CASCADE
);

-- Form16 documents table
CREATE TABLE public.form16_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    financial_year character varying NOT NULL,
    quarter character varying,
    file_name character varying NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES public.admins(id)
);

-- Salary structures table
CREATE TABLE public.salary_structures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id text NOT NULL,
    employee_name text NOT NULL,
    employee_email text NOT NULL,
    department text NOT NULL,
    position text NOT NULL,
    basic_salary numeric NOT NULL,
    hra numeric NOT NULL,
    transport_allowance numeric NOT NULL,
    medical_allowance numeric NOT NULL,
    special_allowance numeric NOT NULL,
    performance_bonus numeric NOT NULL,
    overtime_amount numeric NOT NULL,
    other_allowances numeric NOT NULL,
    gross_salary numeric NOT NULL,
    pf_employee numeric NOT NULL,
    pf_employer numeric NOT NULL,
    esi_employee numeric NOT NULL,
    esi_employer numeric NOT NULL,
    professional_tax numeric NOT NULL,
    income_tax numeric NOT NULL,
    loan_deduction numeric NOT NULL,
    other_deductions numeric NOT NULL,
    total_deductions numeric NOT NULL,
    net_salary numeric NOT NULL,
    effective_date timestamp with time zone NOT NULL,
    status salary_structure_status DEFAULT 'active'::salary_structure_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Salary slips table
CREATE TABLE public.salary_slips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id text NOT NULL,
    employee_name text NOT NULL,
    employee_email text NOT NULL,
    department text NOT NULL,
    position text NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    pay_period_start timestamp with time zone NOT NULL,
    pay_period_end timestamp with time zone NOT NULL,
    working_days integer NOT NULL,
    present_days integer NOT NULL,
    basic_salary numeric NOT NULL,
    hra numeric NOT NULL,
    transport_allowance numeric NOT NULL,
    medical_allowance numeric NOT NULL,
    special_allowance numeric NOT NULL,
    performance_bonus numeric NOT NULL,
    overtime_hours numeric NOT NULL,
    overtime_rate numeric NOT NULL,
    overtime_amount numeric NOT NULL,
    other_allowances numeric NOT NULL,
    gross_earnings numeric NOT NULL,
    pf_employee numeric NOT NULL,
    pf_employer numeric NOT NULL,
    esi_employee numeric NOT NULL,
    esi_employer numeric NOT NULL,
    professional_tax numeric NOT NULL,
    income_tax numeric NOT NULL,
    loan_deduction numeric NOT NULL,
    advance_deduction numeric NOT NULL,
    late_deduction numeric NOT NULL,
    other_deductions numeric NOT NULL,
    total_deductions numeric NOT NULL,
    net_salary numeric NOT NULL,
    status salary_status DEFAULT 'draft'::salary_status NOT NULL,
    generated_date timestamp with time zone NOT NULL,
    paid_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Reports table
CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    type text NOT NULL,
    format text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    parameters jsonb,
    frequency text,
    scheduled_date timestamp with time zone,
    next_run_date timestamp with time zone,
    visibility text DEFAULT 'role_based'::text NOT NULL,
    accessible_roles text[] DEFAULT '{}'::text[],
    accessible_departments text[] DEFAULT '{}'::text[],
    accessible_employees text[] DEFAULT '{}'::text[],
    file_url text,
    file_size bigint,
    generated_by text,
    generated_by_name text,
    generated_date timestamp with time zone,
    expires_at timestamp with time zone,
    download_count integer DEFAULT 0,
    last_downloaded timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Hash password function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Verify password function
CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$;

-- Normalize PAN function
CREATE OR REPLACE FUNCTION public.normalize_pan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.pan_number IS NOT NULL THEN
        NEW.pan_number = UPPER(NEW.pan_number);
    END IF;
    RETURN NEW;
END;
$$;

-- Update updated_at column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Get current user role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RETURN 'admin';
  END IF;
  
  IF EXISTS(SELECT 1 FROM public.employees WHERE user_id = auth.uid()) THEN
    RETURN 'employee';
  END IF;
  
  RETURN NULL;
END;
$$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.admins WHERE admins.user_id = get_user_role.user_id) THEN
    RETURN 'admin';
  END IF;
  
  IF EXISTS(SELECT 1 FROM public.employees WHERE employees.user_id = get_user_role.user_id) THEN
    RETURN 'employee';
  END IF;
  
  RETURN NULL;
END;
$$;

-- Is admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.user_id = is_admin.user_id
  );
END;
$$;

-- Handle attendance function
CREATE OR REPLACE FUNCTION public.handle_attendance(employee_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_check RECORD;
    result JSONB;
    calculated_hours NUMERIC;
    update_count INTEGER;
BEGIN
    BEGIN
        SELECT * INTO last_check
        FROM public.attendance
        WHERE public.attendance.employee_id = handle_attendance.employee_id
          AND date_trunc('day', check_in) = date_trunc('day', NOW())
        ORDER BY check_in DESC
        LIMIT 1;

        IF last_check IS NULL THEN
            INSERT INTO public.attendance (employee_id, status, check_in)
            VALUES (employee_id, 'checked_in', NOW());
            
            result := jsonb_build_object(
                'action', 'checked_in',
                'time', NOW(),
                'message', 'Checked in successfully'
            );
        
        ELSIF last_check.check_out IS NULL THEN
            calculated_hours := ROUND(EXTRACT(EPOCH FROM (NOW() - last_check.check_in)) / 3600, 2);
            
            UPDATE public.attendance
            SET 
                check_out = NOW(),
                status = 'checked_out',
                total_hours = calculated_hours,
                updated_at = NOW()
            WHERE id = last_check.id;
            
            GET DIAGNOSTICS update_count = ROW_COUNT;
            
            IF update_count > 0 THEN
                result := jsonb_build_object(
                    'action', 'checked_out',
                    'time', NOW(),
                    'hours_worked', calculated_hours,
                    'message', 'Checked out successfully'
                );
            ELSE
                result := jsonb_build_object(
                    'error', true,
                    'message', 'Failed to update checkout record'
                );
            END IF;
        
        ELSIF last_check.check_out IS NOT NULL THEN
            result := jsonb_build_object(
                'error', true,
                'message', 'You have already completed your attendance for today'
            );
        
        ELSE
            result := jsonb_build_object(
                'error', true,
                'message', 'Unexpected state in attendance logic'
            );
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            result := jsonb_build_object(
                'error', true,
                'message', 'Database error: ' || SQLERRM,
                'sqlstate', SQLSTATE
            );
    END;

    RETURN result;
END;
$$;

-- Get attendance status function
CREATE OR REPLACE FUNCTION public.get_attendance_status(employee_uuid uuid)
RETURNS TABLE(has_checked_in boolean, last_check_in timestamp with time zone, last_check_out timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    latest_record RECORD;
BEGIN
    SELECT * INTO latest_record
    FROM public.attendance
    WHERE employee_id = employee_uuid
      AND DATE(check_in) = CURRENT_DATE
    ORDER BY check_in DESC
    LIMIT 1;

    IF latest_record IS NULL THEN
        RETURN QUERY SELECT 
            false as has_checked_in,
            NULL::timestamp with time zone as last_check_in,
            NULL::timestamp with time zone as last_check_out;
        RETURN;
    END IF;

    RETURN QUERY SELECT 
        (latest_record.check_out IS NULL) as has_checked_in,
        latest_record.check_in as last_check_in,
        latest_record.check_out as last_check_out;
END;
$$;

-- Notify admins of new leave requests
CREATE OR REPLACE FUNCTION public.notify_admins_new_leave_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  employee_name TEXT;
BEGIN
  SELECT CONCAT(first_name, ' ', last_name) INTO employee_name
  FROM public.employees 
  WHERE id = NEW.employee_id;

  FOR admin_record IN SELECT id FROM public.admins WHERE status = 'active'
  LOOP
    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      related_table,
      related_id,
      action_url
    ) VALUES (
      admin_record.id,
      'New Leave Request',
      employee_name || ' has submitted a new ' || NEW.leave_type || ' request for ' || NEW.days || ' day(s)',
      'leave_request',
      'leave_requests',
      NEW.id,
      '/leave-requests'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to normalize PAN on employees
CREATE TRIGGER normalize_pan_trigger
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_pan();

-- Trigger to update updated_at on admins
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on employees
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on attendance
CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on leave_requests
CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to notify admins of new leave requests
CREATE TRIGGER notify_admins_on_new_leave_request
    AFTER INSERT ON public.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_new_leave_request();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form16_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Admins table policies
CREATE POLICY "Admins can view own record" ON public.admins
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can update own record" ON public.admins
    FOR UPDATE USING (user_id = auth.uid());

-- Employees table policies
CREATE POLICY "Admins can view all employees" ON public.employees
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "Employees can view own record" ON public.employees
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert employees" ON public.employees
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "Admins can update employees" ON public.employees
    FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "Admins can delete employees" ON public.employees
    FOR DELETE USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Attendance table policies
CREATE POLICY "Employees can view own attendance" ON public.attendance
    FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all attendance" ON public.attendance
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Employees can manage own attendance" ON public.attendance
    FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all attendance" ON public.attendance
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Leave requests table policies
CREATE POLICY "Employees can view own leave requests" ON public.leave_requests
    FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all leave requests" ON public.leave_requests
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Employees can create own leave requests" ON public.leave_requests
    FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all leave requests" ON public.leave_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Notifications table policies
CREATE POLICY "Admins can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_id IN (SELECT id FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id IN (SELECT id FROM admins WHERE user_id = auth.uid()));

-- Form16 documents table policies
CREATE POLICY "Employees can view own form16 documents" ON public.form16_documents
    FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all form16 documents" ON public.form16_documents
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Salary structures table policies
CREATE POLICY "Employees can view their own salary structure" ON public.salary_structures
    FOR SELECT USING (employee_id = (SELECT employee_id FROM employees WHERE user_id = auth.uid())::text);

CREATE POLICY "Admins can view all salary structures" ON public.salary_structures
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can insert salary structures" ON public.salary_structures
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can update salary structures" ON public.salary_structures
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admins));

-- Salary slips table policies
CREATE POLICY "Employees can view their own salary slips" ON public.salary_slips
    FOR SELECT USING (employee_id = (SELECT employee_id FROM employees WHERE user_id = auth.uid())::text);

CREATE POLICY "Admins can view all salary slips" ON public.salary_slips
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can insert salary slips" ON public.salary_slips
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can update salary slips" ON public.salary_slips
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admins));

-- Reports table policies
CREATE POLICY "Enable read access for all users" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Enable update access for users based on role" ON public.reports
    FOR UPDATE USING ((auth.role() = 'authenticated'::text) AND ((accessible_roles @> ARRAY[auth.role()]) OR (generated_by = (auth.uid())::text)));

CREATE POLICY "Enable delete access for admins" ON public.reports
    FOR DELETE USING ((auth.role() = 'authenticated'::text) AND (auth.uid() = (SELECT admins.id FROM admins WHERE admins.user_id = auth.uid())));

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('Form 16 Documents', 'Form 16 Documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Employees can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (SELECT employee_id FROM public.employees WHERE user_id = auth.uid())::text
);

-- Storage policies for Form 16 Documents bucket
CREATE POLICY "Admins can upload form16 documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Form 16 Documents' AND
  auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Admins can view all form16 documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'Form 16 Documents' AND
  auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Employees can view own form16 documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'Form 16 Documents' AND
  (storage.foldername(name))[1] = (SELECT employee_id FROM public.employees WHERE user_id = auth.uid())::text
);

-- ============================================
-- SAMPLE DATA (Optional - comment out if not needed)
-- ============================================

-- Insert sample reports (from seed.sql)
INSERT INTO reports (id, title, description, type, format, status, parameters, frequency, scheduled_date, next_run_date, visibility, accessible_roles, generated_by, generated_by_name, generated_date, download_count, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Monthly Employee Headcount', 'Report on total employee count per department for the last month.', 'employee', 'pdf', 'completed', '{"date_range": {"start_date": "2024-08-01T00:00:00Z", "end_date": "2024-08-31T23:59:59Z"}}', 'monthly', NULL, NULL, 'role_based', '{"admin", "hr"}', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Admin User', now() - INTERVAL '5 day', 10, now(), now()),
  (gen_random_uuid(), 'Weekly Leave Overview', 'Summary of all leave requests and approvals for the past week.', 'leave', 'excel', 'generating', '{"date_range": {"start_date": "2024-09-09T00:00:00Z", "end_date": "2024-09-15T23:59:59Z"}}', 'weekly', NULL, NULL, 'role_based', '{"admin", "manager"}', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Admin User', now() - INTERVAL '1 hour', 2, now(), now()),
  (gen_random_uuid(), 'Q3 Attendance Summary', 'Detailed attendance records for all employees in Q3.', 'attendance', 'csv', 'scheduled', '{"date_range": {"start_date": "2024-07-01T00:00:00Z", "end_date": "2024-09-30T23:59:59Z"}}', 'monthly', now() + INTERVAL '7 day', now() + INTERVAL '7 day', 'role_based', '{"admin"}', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Admin User', NULL, 0, now(), now()),
  (gen_random_uuid(), 'Payroll Discrepancy Report', 'Report highlighting discrepancies in the last payroll run.', 'payroll', 'pdf', 'failed', '{"pay_period": "2024-08"}', 'once', NULL, NULL, 'role_based', '{"admin", "hr"}', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Admin User', now() - INTERVAL '2 day', 0, now(), now()),
  (gen_random_uuid(), 'Employee Performance Review Status', 'Overview of pending and completed performance reviews.', 'performance', 'pdf', 'completed', '{"year": 2024}', 'yearly', NULL, NULL, 'role_based', '{"admin", "manager"}', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Admin User', now() - INTERVAL '10 day', 5, now(), now());

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Schema export completed successfully!
-- Run this SQL in your new Supabase project's SQL Editor.
