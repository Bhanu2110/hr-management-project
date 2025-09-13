import { supabase } from '@/integrations/supabase/client';

export interface Form16Document {
  id: string;
  employee_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  financial_year: string;
  uploaded_at: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const form16Service = {
  // Get Form 16 documents for a specific employee (with security check)
  async getEmployeeForm16Documents(employeeId: string): Promise<Form16Document[]> {
    const { data, error } = await supabase
      .from('form16_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('financial_year', { ascending: false });

    if (error) {
      console.error('Error fetching Form 16 documents:', error);
      throw error;
    }

    return data || [];
  },

  // Get all Form 16 documents (admin only)
  async getAllForm16Documents(): Promise<Form16Document[]> {
    const { data, error } = await supabase
      .from('form16_documents')
      .select(`
        *,
        employees!inner(
          id,
          first_name,
          last_name,
          employee_id,
          pan_number
        )
      `)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching all Form 16 documents:', error);
      throw error;
    }

    return data || [];
  },

  // Upload Form 16 document
  async uploadForm16Document(
    employeeId: string,
    file: File,
    financialYear: string,
    uploadedBy?: string
  ): Promise<Form16Document> {
    const fileName = `form16_${employeeId}_${financialYear}_${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `form16/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Form 16 upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Create database record
    const { data, error } = await supabase
      .from('form16_documents')
      .insert([{
        employee_id: employeeId,
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        financial_year: financialYear,
        uploaded_by: uploadedBy,
      }])
      .select()
      .single();

    if (error) {
      console.error('Form 16 record creation error:', error);
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      throw new Error(`Failed to create Form 16 record: ${error.message}`);
    }

    return data;
  },

  // Delete Form 16 document (admin only)
  async deleteForm16Document(documentId: string): Promise<boolean> {
    // First get the document to get file path
    const { data: document, error: fetchError } = await supabase
      .from('form16_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('Error fetching document for deletion:', fetchError);
      throw fetchError;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('form16_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Error deleting Form 16 record:', dbError);
      throw dbError;
    }

    return true;
  },

  // Get signed URL for download (with security check)
  async getDownloadUrl(documentId: string, employeeId?: string): Promise<string> {
    // If employeeId is provided, verify the document belongs to the employee
    let query = supabase
      .from('form16_documents')
      .select('file_path')
      .eq('id', documentId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data: document, error } = await query.single();

    if (error) {
      console.error('Error fetching document for download:', error);
      throw new Error('Document not found or access denied');
    }

    // Create signed URL
    const { data, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 300); // 5 minutes

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      throw new Error('Failed to generate download link');
    }

    return data.signedUrl;
  },

  // Update Form 16 document
  async updateForm16Document(
    documentId: string,
    updates: Partial<Pick<Form16Document, 'financial_year'>>
  ): Promise<Form16Document> {
    const { data, error } = await supabase
      .from('form16_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Form 16 document:', error);
      throw error;
    }

    return data;
  },
};
