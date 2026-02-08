
'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export function WelcomeBanner() {
    const { role, user, loading } = useAuth();

    // Helper to format role name nicely (e.g., "admin" -> "Administrator")
    const getRoleDisplay = (r: string | null) => {
        if (!r) return 'User';
        switch (r) {
            case 'admin': return 'Administrator';
            case 'supervisor': return 'Supervisor';
            case 'subcontractor': return 'Partner';
            case 'client': return 'Client';
            default: return r.charAt(0).toUpperCase() + r.slice(1);
        }
    };

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
                <div className="h-6 w-64 mt-1">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-2 font-medium">
                Welcome back, <span className="text-foreground">{getRoleDisplay(role)}</span>. Here's what's happening today.
            </p>
        </div>
    );
}
