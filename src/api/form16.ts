import { supabase } from '@/integrations/supabase/client';

export interface Form16Document {
    id: string;
    employee_id: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    financial_year: string;
    quarter: string | null;
    uploaded_by: string | null;
    uploaded_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Form16UploadRequest {
    employee_id: string;
    file: File;
    financial_year: string;
    quarter?: string;
}

/**
 * Fetch all Form 16 documents (Admin only)
 */
export async function fetchAllForm16Documents(): Promise<Form16Document[]> {
    const { data, error } = await supabase
        .from('form16_documents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching Form 16 documents:', error);
        throw error;
    }

    return data || [];
}

/**
 * Fetch Form 16 documents for a specific employee
 */
export async function fetchEmployeeForm16Documents(employeeId: string): Promise<Form16Document[]> {
    const { data, error } = await supabase
        .from('form16_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('financial_year', { ascending: false });

    if (error) {
        console.error('Error fetching employee Form 16 documents:', error);
        throw error;
    }

    return data || [];
}

/**
 * Upload a Form 16 document
 */
export async function uploadForm16Document(request: Form16UploadRequest): Promise<Form16Document> {
    const { file, employee_id, financial_year, quarter } = request;

    try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Authentication error:', authError);
            throw new Error('User not authenticated. Please log in again.');
        }

        // Create a unique file name
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const fileName = `form16_${employee_id}_${financial_year.replace('/', '-')}_${timestamp}.${fileExt}`;
        const filePath = `form16/${employee_id}/${fileName}`;

        console.log('Uploading file:', { fileName, filePath, size: file.size });

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);

            if (uploadError.message.includes('Bucket not found')) {
                throw new Error('Storage bucket "documents" not found. Please create it in Supabase Dashboard → Storage.');
            } else if (uploadError.message.includes('not allowed')) {
                throw new Error('Storage access denied. Please check RLS policies for the documents bucket.');
            } else {
                throw new Error(`File upload failed: ${uploadError.message}`);
            }
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        console.log('Public URL:', publicUrl);

        // Get admin ID from the current user
        let uploadedById = null;
        try {
            const { data: adminData } = await supabase
                .from('admins')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (adminData) {
                uploadedById = adminData.id;
            }
        } catch (err) {
            console.warn('Could not find admin record, uploaded_by will be null');
        }

        // Create database record
        const { data, error: dbError } = await supabase
            .from('form16_documents')
            .insert([{
                employee_id,
                file_name: file.name,
                file_path: publicUrl,
                file_size: file.size,
                financial_year,
                quarter: quarter || null,
                uploaded_by: uploadedById,
                uploaded_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Database insert error:', dbError);
            await supabase.storage.from('documents').remove([filePath]);
            throw new Error(`Database error: ${dbError.message}`);
        }

        console.log('Form 16 record created:', data);

        // Create notification for the employee
        try {
            await supabase
                .from('notifications')
                .insert([{
                    recipient_id: employee_id,
                    title: 'New Form 16 Available',
                    message: `Your Form 16 for financial year ${financial_year} has been uploaded and is now available for download.`,
                    type: 'leave_request',
                    related_id: data.id,
                    related_table: 'form16_documents',
                    is_read: false,
                }]);
            console.log('Notification created for employee');
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't throw - notification failure shouldn't fail the upload
        }

        return data;
    } catch (error: any) {
        console.error('Upload Form 16 error:', error);
        throw error;
    }
}

/**
 * Update Form 16 document metadata and optionally replace the file
 */
export async function updateForm16Document(
    id: string,
    updates: {
        financial_year?: string;
        quarter?: string | null;
        file?: File;
        employee_id?: string;
    }
): Promise<Form16Document> {
    try {
        // First, get the current document details
        const { data: currentDoc, error: fetchError } = await supabase
            .from('form16_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching current document:', fetchError);
            throw fetchError;
        }

        let fileUpdates = {};

        // If a new file is provided, upload it and delete the old one
        if (updates.file) {
            const file = updates.file;
            const employee_id = updates.employee_id || currentDoc.employee_id;
            const financial_year = updates.financial_year || currentDoc.financial_year;

            // Create a unique file name
            const timestamp = new Date().getTime();
            const fileExt = file.name.split('.').pop();
            const fileName = `form16_${employee_id}_${financial_year.replace('/', '-')}_${timestamp}.${fileExt}`;
            const filePath = `form16/${employee_id}/${fileName}`;

            console.log('Uploading new file:', { fileName, filePath, size: file.size });

            // Upload new file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw new Error(`File upload failed: ${uploadError.message}`);
            }

            console.log('New file uploaded successfully:', uploadData);

            // Get public URL for new file
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            // Delete old file from storage
            if (currentDoc.file_path) {
                const oldPathMatch = currentDoc.file_path.match(/form16\/.+/);
                if (oldPathMatch) {
                    await supabase.storage
                        .from('documents')
                        .remove([oldPathMatch[0]]);
                    console.log('Old file deleted from storage');
                }
            }

            fileUpdates = {
                file_name: file.name,
                file_path: publicUrl,
                file_size: file.size,
            };
        }

        // Update database record
        const { data, error } = await supabase
            .from('form16_documents')
            .update({
                financial_year: updates.financial_year,
                quarter: updates.quarter,
                ...fileUpdates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating Form 16 document:', error);
            throw error;
        }

        console.log('Form 16 document updated successfully:', data);
        return data;
    } catch (error: any) {
        console.error('Update Form 16 error:', error);
        throw error;
    }
}

/**
 * Delete a Form 16 document
 */
export async function deleteForm16Document(id: string): Promise<void> {
    const { data: doc, error: fetchError } = await supabase
        .from('form16_documents')
        .select('file_path')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching document:', fetchError);
        throw fetchError;
    }

    if (doc?.file_path) {
        const pathMatch = doc.file_path.match(/form16\/.+/);
        if (pathMatch) {
            await supabase.storage
                .from('documents')
                .remove([pathMatch[0]]);
        }
    }

    const { error: deleteError } = await supabase
        .from('form16_documents')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error('Error deleting Form 16 document:', deleteError);
        throw deleteError;
    }
}

/**
 * Get Form 16 statistics
 */
export async function getForm16Statistics() {
    const { data, error } = await supabase
        .from('form16_documents')
        .select('financial_year, employee_id');

    if (error) {
        console.error('Error fetching Form 16 statistics:', error);
        return {
            total: 0,
            employees: 0,
            years: [],
        };
    }

    const uniqueEmployees = new Set(data.map(d => d.employee_id)).size;
    const uniqueYears = [...new Set(data.map(d => d.financial_year))];

    return {
        total: data.length,
        employees: uniqueEmployees,
        years: uniqueYears,
    };
}

/**
 * Download a Form 16 document - forces immediate download
 */
export async function downloadForm16Document(id: string): Promise<void> {
    const { data, error } = await supabase
        .from('form16_documents')
        .select('file_path, file_name')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching document:', error);
        throw error;
    }

    if (!data?.file_path) {
        throw new Error('File path not found');
    }

    const pathMatch = data.file_path.match(/form16\/.+/);
    if (!pathMatch) {
        window.open(data.file_path, '_blank');
        return;
    }

    const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(pathMatch[0], 60);

    if (signedError || !signedUrlData) {
        console.error('Error creating signed URL:', signedError);
        throw new Error('Failed to generate download link');
    }

    try {
        const response = await fetch(signedUrlData.signedUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (fetchError) {
        console.error('Error downloading file:', fetchError);
        throw new Error('Failed to download file');
    }
}
