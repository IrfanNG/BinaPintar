
import { supabase } from '../supabase';
import type { UserProfile, UserRole } from '../supabase';

export async function getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data || [];
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role)
        .order('full_name', { ascending: true });

    if (error) {
        console.error(`Error fetching ${role}s:`, error);
        return [];
    }

    return data || [];
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        console.error('Error updating role:', error);
        return false;
    }

    return true;
}
