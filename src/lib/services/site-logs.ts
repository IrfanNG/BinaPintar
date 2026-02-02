import { supabase, type SiteLog } from '../supabase';

export async function getSiteLogs(projectId: string): Promise<SiteLog[]> {
    const { data, error } = await supabase
        .from('site_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching site logs:', error);
        return [];
    }

    return data || [];
}

export async function createSiteLog(
    siteLog: Omit<SiteLog, 'id' | 'created_at'>
): Promise<SiteLog | null> {
    const { data, error } = await supabase
        .from('site_logs')
        .insert(siteLog)
        .select()
        .single();

    if (error) {
        console.error('Error creating site log:', error);
        return null;
    }

    return data;
}

export async function uploadSitePhoto(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `site-logs/${fileName}`;

    const { error } = await supabase.storage
        .from('site-photos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading photo:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('site-photos')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}
