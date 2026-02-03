
'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            // Optional: Redirect immediately
            // router.push('/');
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || role !== 'admin') {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 max-w-md mb-6">
                    You do not have permission to view the Admin Analytics Dashboard. This effective area is restricted to administrators only.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
