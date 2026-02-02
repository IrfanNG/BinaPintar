import { supabase, type Permit } from '../supabase';

export async function getPermits(): Promise<Permit[]> {
    const { data, error } = await supabase
        .from('permits')
        .select(`
      *,
      project:projects(id, name, status)
    `)
        .order('expiry_date', { ascending: true });

    if (error) {
        console.error('Error fetching permits:', error);
        return [];
    }

    return data || [];
}

export async function getExpiringPermitsCount(): Promise<number> {
    // Get permits expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date().toISOString().split('T')[0];
    const futureDate = thirtyDaysFromNow.toISOString().split('T')[0];

    const { count, error } = await supabase
        .from('permits')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', futureDate)
        .gte('expiry_date', today);

    if (error) {
        console.error('Error counting expiring permits:', JSON.stringify(error, null, 2));
        // If the table doesn't exist, Supabase might return specific codes.
        // For now, return 0 to prevent crashing.
        return 0;
    }

    // Also count already expired permits
    const { count: expiredCount, error: expiredError } = await supabase
        .from('permits')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', today);

    if (expiredError) {
        console.error('Error counting expired permits:', expiredError);
    }

    return (count || 0) + (expiredCount || 0);
}

export async function createPermit(
    permit: Omit<Permit, 'id' | 'created_at' | 'project'>
): Promise<Permit | null> {
    const { data, error } = await supabase
        .from('permits')
        .insert(permit)
        .select()
        .single();

    if (error) {
        console.error('Error creating permit:', error);
        return null;
    }

    return data;
}

export function getPermitStatus(expiryDate: string): 'expired' | 'expiring' | 'valid' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'valid';
}
