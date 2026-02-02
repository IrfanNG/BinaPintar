'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/lib/auth/auth-context';
import { LogOut } from 'lucide-react';

// Pages that should NOT show sidebar/nav (auth pages)
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isAuthPage = AUTH_PATHS.includes(pathname);

    // For login/signup pages, render without sidebar
    if (isAuthPage) {
        return <>{children}</>;
    }

    // For authenticated pages, render with full layout
    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 pb-20 lg:pb-0 bg-background min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="sticky top-0 z-20 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 h-14 flex items-center justify-end gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {user?.email?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="ml-2 p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav />
        </div>
    );
}
