
import { supabase, type Comment } from '../supabase';

export async function getComments(siteLogId: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            user:user_profiles(id, full_name, role, email)
        `)
        .eq('site_log_id', siteLogId)
        .order('created_at', { ascending: true }); // Oldest first for chat-like flow

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return data || [];
}

export async function createComment(
    siteLogId: string,
    userId: string,
    content: string
): Promise<Comment | null> {
    const { data, error } = await supabase
        .from('comments')
        .insert({
            site_log_id: siteLogId,
            user_id: userId,
            content: content
        })
        .select(`
            *,
            user:user_profiles(id, full_name, role, email)
        `)
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        return null;
    }

    return data;
}
