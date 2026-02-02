import { supabase, type Claim } from '../supabase';

// Claims Service
export async function getClaims(projectId?: string): Promise<Claim[]> {
    let query = supabase
        .from('claims')
        .select(`
      *,
      project:projects(id, name)
    `)
        .order('created_at', { ascending: false });

    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getMyClaimsForSubcontractor(userId: string): Promise<Claim[]> {
    const { data, error } = await supabase
        .from('claims')
        .select(`
            *,
            project:projects(id, name)
        `)
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createClaim(claim: Omit<Claim, 'id' | 'created_at' | 'updated_at' | 'project'>) {
    const { data, error } = await supabase
        .from('claims')
        .insert(claim)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateClaimStatus(id: string, status: 'Approved' | 'Paid') {
    const { error } = await supabase
        .from('claims')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}

export async function uploadClaimInvoice(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('claim-invoices')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('claim-invoices')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
