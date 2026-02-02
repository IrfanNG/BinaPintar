'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { MyClaimsList } from '@/components/claims/MyClaimsList';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubcontractorPortal() {
    const { user, loading, role, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sub-Contractor Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Log Out
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Welcome, <span className="font-medium text-slate-800">{user.user_metadata.full_name || user.email}</span>.
                    Submit your claims and track payment status here.
                </p>
            </div>

            <ClaimForm />

            <div className="mt-8">
                <MyClaimsList />
            </div>
        </div>
    );
}
