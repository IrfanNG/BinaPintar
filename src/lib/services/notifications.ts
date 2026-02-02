import { supabase, type Notification } from '../supabase';

export async function getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        // Suppress error if it's likely due to missing table in dev
        // console.error('Error fetching notifications:', error);
        return [];
    }
    return data || [];
}

export async function markAsRead(id: string) {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
}

export async function markAllAsRead() {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
    const { error } = await supabase
        .from('notifications')
        .insert(notification);

    if (error) console.error('Error creating notification:', error);
}
