-- Create Enum for report_type
CREATE TYPE report_type AS ENUM (
  'employee',
  'leave',
  'attendance',
  'payroll',
  'performance',
  'compliance',
  'department'
);

-- Create Enum for report_format
CREATE TYPE report_format AS ENUM (
  'pdf',
  'excel',
  'csv'
);

-- Create Enum for report_status
CREATE TYPE report_status AS ENUM (
  'pending',
  'generating',
  'completed',
  'failed',
  'scheduled'
);

-- Create Enum for report_frequency
CREATE TYPE report_frequency AS ENUM (
  'once',
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

-- Create Enum for report_visibility
CREATE TYPE report_visibility AS ENUM (
  'public',
  'role_based',
  'employee_specific'
);

-- Create the reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type report_type NOT NULL,
  format report_format NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  parameters jsonb, -- For report specific parameters (e.g., date_range, employee_id)
  frequency report_frequency DEFAULT 'once',
  scheduled_date timestamptz,
  next_run_date timestamptz,
  visibility report_visibility NOT NULL DEFAULT 'role_based',
  accessible_roles text[] DEFAULT '{}',
  accessible_departments text[] DEFAULT '{}',
  accessible_employees text[] DEFAULT '{}',
  file_url text,
  file_size bigint,
  generated_by text,
  generated_by_name text,
  generated_date timestamptz,
  download_count integer DEFAULT 0,
  last_downloaded timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports table
CREATE POLICY "Enable read access for all users" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for users based on role" ON reports
  FOR UPDATE USING (auth.role() = 'authenticated' AND (accessible_roles @> ARRAY[auth.role()::text] OR generated_by = auth.uid()::text));

CREATE POLICY "Enable delete access for admins" ON reports
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = (SELECT id FROM public.admins WHERE user_id = auth.uid()));

-- Add a trigger to update the updated_at column automatically
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');

-- Optional: Add indexes for better performance on frequently queried columns
CREATE INDEX idx_reports_type ON reports (type);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_generated_by ON reports (generated_by);
