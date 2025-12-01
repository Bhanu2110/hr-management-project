-- Create documents table for general document management
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'private',
    accessible_roles TEXT[] DEFAULT '{}',
    accessible_departments TEXT[] DEFAULT '{}',
    accessible_employees TEXT[] DEFAULT '{}',
    employee_id TEXT,
    employee_name TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_confidential BOOLEAN DEFAULT false,
    approval_status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_date TIMESTAMPTZ,
    uploaded_by TEXT,
    uploaded_by_name TEXT,
    uploaded_date TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON public.documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_approval_status ON public.documents(approval_status);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON public.documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all documents"
ON public.documents
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admins
        WHERE admins.user_id = auth.uid()
    )
);

-- Policy: Employees can view their own documents and public documents
CREATE POLICY "Employees can view their documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
    visibility = 'public'
    OR employee_id IN (
        SELECT employee_id FROM public.employees
        WHERE employees.user_id = auth.uid()
    )
    OR employee_id = ANY(accessible_employees)
);

-- Policy: Employees can insert their own documents
CREATE POLICY "Employees can upload documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
    employee_id IN (
        SELECT employee_id FROM public.employees
        WHERE employees.user_id = auth.uid()
    )
);

-- Add comment to table
COMMENT ON TABLE public.documents IS 'Stores all employee and company documents with access control';
