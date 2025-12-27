import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentUploadRequest } from '@/types/documents';

/**
 * Fetch all documents (Admin only)
 */
export async function fetchAllDocuments(): Promise<Document[]> {
    try {
        const { data, error } = await supabase
            .from('documents' as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch documents error:', error);
            throw error;
        }

        return (data as unknown as Document[]) || [];
    } catch (error: any) {
        console.error('Fetch all documents error:', error);
        throw error;
    }
}

/**
 * Fetch documents for a specific employee
 */
export async function fetchEmployeeDocuments(employeeId: string): Promise<Document[]> {
    try {
        const { data, error } = await supabase
            .from('documents' as any)
            .select('*')
            .or(`employee_id.eq.${employeeId},accessible_employees.cs.{${employeeId}},and(visibility.eq.public,employee_id.is.null)`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch employee documents error:', error);
            throw error;
        }

        return (data as unknown as Document[]) || [];
    } catch (error: any) {
        console.error('Fetch employee documents error:', error);
        throw error;
    }
}

/**
 * Upload a new document
 */
export async function uploadDocument(request: DocumentUploadRequest): Promise<Document> {
    try {
        const { file, ...metadata } = request;

        if (!file) {
            throw new Error('No file provided');
        }

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('User not authenticated');
        }

        // Create a unique file name
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const sanitizedTitle = metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${sanitizedTitle}_${timestamp}.${fileExt}`;
        const filePath = `documents/${metadata.category}/${fileName}`;

        console.log('Uploading file:', { fileName, filePath, size: file.size });

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents1')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`File upload failed: ${uploadError.message}`);
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents1')
            .getPublicUrl(filePath);

        // Get admin ID
        let uploadedById = null;
        let uploadedByName = 'Unknown';
        try {
            const { data: adminData } = await supabase
                .from('admins')
                .select('id, first_name, last_name')
                .eq('user_id', user.id)
                .single();

            if (adminData) {
                uploadedById = adminData.id;
                uploadedByName = `${adminData.first_name} ${adminData.last_name}`;
            }
        } catch (err) {
            console.warn('Could not find admin record');
        }

        // Get employee name if employee_id is provided
        let employeeName = undefined;
        if (metadata.employee_id) {
            try {
                const { data: empData } = await supabase
                    .from('employees')
                    .select('first_name, last_name')
                    .eq('employee_id', metadata.employee_id)
                    .single();

                if (empData) {
                    employeeName = `${empData.first_name} ${empData.last_name}`;
                }
            } catch (err) {
                console.warn('Could not find employee record');
            }
        }

        // Create database record
        const { data, error: dbError } = await supabase
            .from('documents' as any)
            .insert([{
                title: metadata.title,
                description: metadata.description,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_url: publicUrl,
                category: metadata.category,
                subcategory: metadata.subcategory,
                tags: metadata.tags || [],
                visibility: metadata.visibility,
                accessible_roles: metadata.accessible_roles || [],
                accessible_departments: metadata.accessible_departments || [],
                accessible_employees: metadata.accessible_employees || [],
                employee_id: metadata.employee_id,
                employee_name: employeeName,
                is_confidential: metadata.is_confidential || false,
                approval_status: 'approved', // Auto-approve admin uploads
                approved_by: uploadedByName,
                approved_date: new Date().toISOString(),
                uploaded_by: uploadedById,
                uploaded_by_name: uploadedByName,
                uploaded_date: new Date().toISOString(),
                version: 1,
                is_active: true,
                access_count: 0,
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Database insert error:', dbError);
            // Clean up uploaded file
            await supabase.storage.from('documents1').remove([filePath]);
            throw new Error(`Database error: ${dbError.message}`);
        }

        console.log('Document record created:', data);

        // Create notifications for assigned employees
        const targetEmployeeIds = metadata.accessible_employees || [];
        
        if (targetEmployeeIds.length > 0) {
            // Send notifications to all employees in accessible_employees
            try {
                for (const empId of targetEmployeeIds) {
                    // Get employee id (UUID) from employee_id string
                    const { data: empData } = await supabase
                        .from('employees')
                        .select('id')
                        .eq('employee_id', empId)
                        .single();

                    if (empData && empData.id) {
                        await supabase
                            .from('notifications')
                            .insert([{
                                recipient_id: empData.id,
                                title: 'New Document Available',
                                message: `A new document "${metadata.title}" has been uploaded and is now available.`,
                                type: 'document',
                                related_id: (data as any).id,
                                related_table: 'documents',
                                is_read: false,
                            }]);
                    }
                }
            } catch (notifError) {
                console.error('Error creating notifications:', notifError);
            }
        } else if (metadata.employee_id) {
            // Fallback: Send to single employee if no accessible_employees but employee_id is set
            try {
                const { data: empData } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('employee_id', metadata.employee_id)
                    .single();

                if (empData && empData.id) {
                    await supabase
                        .from('notifications')
                        .insert([{
                            recipient_id: empData.id,
                            title: 'New Document Available',
                            message: `A new document "${metadata.title}" has been uploaded and is now available.`,
                            type: 'document',
                            related_id: (data as any).id,
                            related_table: 'documents',
                            is_read: false,
                        }]);
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }
        }

        return data as unknown as Document;
    } catch (error: any) {
        console.error('Upload document error:', error);
        throw error;
    }
}

/**
 * Update document metadata
 */
export async function updateDocument(
    id: string,
    updates: Partial<DocumentUploadRequest>
): Promise<Document> {
    try {
        const { file, ...metadata } = updates;
        let fileUpdates = {};

        // If a new file is provided, upload it
        if (file) {
            const timestamp = new Date().getTime();
            const fileExt = file.name.split('.').pop();
            const sanitizedTitle = (metadata.title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${sanitizedTitle}_${timestamp}.${fileExt}`;
            const category = metadata.category || 'other';
            const filePath = `documents/${category}/${fileName}`;

            console.log('Uploading new file:', { fileName, filePath, size: file.size });

            const { error: uploadError } = await supabase.storage
                .from('documents1')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw new Error(`File upload failed: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('documents1')
                .getPublicUrl(filePath);

            fileUpdates = {
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_url: publicUrl,
            };
        }

        const { data, error } = await supabase
            .from('documents' as any)
            .update({
                ...metadata,
                ...fileUpdates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update document error:', error);
            throw error;
        }

        // Create notification if assigned to an employee
        if (metadata.employee_id) {
            try {
                // Get employee user_id from employee_id
                const { data: empData } = await supabase
                    .from('employees')
                    .select('user_id')
                    .eq('employee_id', metadata.employee_id)
                    .single();

                if (empData && empData.user_id) {
                    await supabase
                        .from('notifications')
                        .insert([{
                            recipient_id: empData.user_id,
                            title: 'Document Updated',
                            message: `The document "${metadata.title || (data as any).title}" has been updated.`,
                            type: 'document',
                            related_id: id,
                            related_table: 'documents',
                            is_read: false,
                        }]);
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }
        }

        return data as unknown as Document;
    } catch (error: any) {
        console.error('Update document error:', error);
        throw error;
    }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
    try {
        // First, get the document to find the file path
        const { data: doc, error: fetchError } = await supabase
            .from('documents' as any)
            .select('file_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Fetch document error:', fetchError);
            throw fetchError;
        }

        // Delete from storage
        const docData = doc as any;
        if (docData?.file_url) {
            const pathMatch = docData.file_url.match(/documents\/.+/);
            if (pathMatch) {
                await supabase.storage
                    .from('documents1')
                    .remove([pathMatch[0]]);
            }
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('documents' as any)
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete document error:', deleteError);
            throw deleteError;
        }
    } catch (error: any) {
        console.error('Delete document error:', error);
        throw error;
    }
}

/**
 * Download a document
 */
export async function downloadDocument(id: string): Promise<void> {
    try {
        // Get document
        const { data: doc, error: fetchError } = await supabase
            .from('documents' as any)
            .select('file_url, file_name, access_count')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Fetch document error:', fetchError);
            throw fetchError;
        }

        const docData = doc as any;

        // Increment access count
        const newAccessCount = (docData?.access_count || 0) + 1;
        await supabase
            .from('documents' as any)
            .update({ access_count: newAccessCount })
            .eq('id', id);

        // Force download file by fetching as blob
        if (docData?.file_url && docData?.file_name) {
            try {
                // Fetch the file as a blob
                const response = await fetch(docData.file_url);
                const blob = await response.blob();

                // Create a blob URL
                const blobUrl = window.URL.createObjectURL(blob);

                // Create download link
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = docData.file_name;
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (downloadError) {
                console.error('Download error:', downloadError);
                // Fallback to opening in new tab
                window.open(docData.file_url, '_blank');
            }
        }
    } catch (error: any) {
        console.error('Download document error:', error);
        throw error;
    }
}

/**
 * Approve a document
 */
export async function approveDocument(id: string, approvedBy: string): Promise<Document> {
    try {
        const { data, error } = await supabase
            .from('documents' as any)
            .update({
                approval_status: 'approved',
                approved_by: approvedBy,
                approved_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Approve document error:', error);
            throw error;
        }

        return data as unknown as Document;
    } catch (error: any) {
        console.error('Approve document error:', error);
        throw error;
    }
}

/**
 * Reject a document
 */
export async function rejectDocument(id: string, rejectedBy: string): Promise<Document> {
    try {
        const { data, error } = await supabase
            .from('documents' as any)
            .update({
                approval_status: 'rejected',
                approved_by: rejectedBy,
                approved_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Reject document error:', error);
            throw error;
        }

        return data as unknown as Document;
    } catch (error: any) {
        console.error('Reject document error:', error);
        throw error;
    }
}

/**
 * Get document statistics
 */
export async function getDocumentStatistics() {
    try {
        const { data: allDocs, error } = await supabase
            .from('documents' as any)
            .select('approval_status, category, is_confidential');

        if (error) {
            console.error('Fetch statistics error:', error);
            throw error;
        }

        const docs = (allDocs || []) as any[];

        const stats = {
            total: docs.length,
            pending: docs.filter(d => d.approval_status === 'pending').length,
            approved: docs.filter(d => d.approval_status === 'approved').length,
            rejected: docs.filter(d => d.approval_status === 'rejected').length,
            confidential: docs.filter(d => d.is_confidential).length,
            byCategory: docs.reduce((acc: Record<string, number>, doc: any) => {
                acc[doc.category] = (acc[doc.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
        };

        return stats;
    } catch (error: any) {
        console.error('Get statistics error:', error);
        throw error;
    }
}
