'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

export function DashboardRoleCheck({ children }: { children: React.ReactNode }) {
    const { role, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (role === 'client') {
                router.replace('/client');
            } else if (role === 'subcontractor') {
                router.replace('/subcontractor');
            } else {
                // Admin, Supervisor, or no role (will be handled by AuthGuard if exists, or show nothing)
                setIsAuthorized(true);
            }
        }
    }, [role, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}
