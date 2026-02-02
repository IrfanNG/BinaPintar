'use client';

import { AuthProvider } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>
                <AppShell>{children}</AppShell>
            </AuthGuard>
            <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
            />
        </AuthProvider>
    );
}
