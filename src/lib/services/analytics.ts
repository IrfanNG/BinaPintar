
import { supabase, type Claim, type Project, type Permit } from '../supabase';

export interface FinancialSummary {
    paid: number;
    pending: number;
    approved: number;
}

export interface ProjectProgress {
    id: string;
    name: string;
    status: 'Active' | 'Completed';
    startDate: string;
    endDate: string | null;
    progressPercent: number;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
    const { data: claims, error } = await supabase
        .from('claims')
        .select('amount, status');

    if (error) {
        console.error('Error fetching claims for financial summary:', error);
        return { paid: 0, pending: 0, approved: 0 };
    }

    const summary = claims.reduce(
        (acc, claim) => {
            if (claim.status === 'Paid') acc.paid += claim.amount;
            else if (claim.status === 'Pending') acc.pending += claim.amount;
            else if (claim.status === 'Approved') acc.approved += claim.amount;
            return acc;
        },
        { paid: 0, pending: 0, approved: 0 }
    );

    return summary;
}

export async function getProjectProgressData(): Promise<ProjectProgress[]> {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, status, start_date, end_date, progress_percent')
        .eq('status', 'Active') // Focus on active projects for progress
        .order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching project progress:', error);
        return [];
    }

    return projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        startDate: p.start_date,
        endDate: p.end_date,
        progressPercent: p.progress_percent || 0,
    }));
}

export async function getHighRiskPermits(days: number = 14): Promise<Permit[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const todayStr = new Date().toISOString().split('T')[0];
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const { data: permits, error } = await supabase
        .from('permits')
        .select(`
      *,
      project:projects(name)
    `)
        .lte('expiry_date', targetDateStr) // Expires on or before target date
        // .gte('expiry_date', todayStr) // Optional: If we ONLY want future expiries, but usually seeing past due is good too
        .order('expiry_date', { ascending: true });

    if (error) {
        console.error('Error fetching high risk permits:', error);
        return [];
    }

    return permits || [];
}
