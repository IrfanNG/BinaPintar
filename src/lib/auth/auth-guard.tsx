'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        console.log('AuthGuard Check:', { user, loading, pathname, isRedirecting });

        // Only redirect after loading is complete
        if (loading) return;

        if (!user && !isPublicPath) {
            console.log('AuthGuard: Redirecting to login');
            setIsRedirecting(true);
            router.push('/login');
        } else if (user && isPublicPath) {
            console.log('AuthGuard: Redirecting to home');
            setIsRedirecting(true);
            router.push('/');
        } else {
            if (isRedirecting) {
                console.log('AuthGuard: Redirecting done');
                setIsRedirecting(false);
            }
        }
    }, [user, loading, isPublicPath, router, pathname]); // Added isRedirecting intentionally? No, creates loop if not careful.

    // Show loading only while auth is initializing
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-slate-500 mt-2">Loading Auth...</p>
                </div>
            </div>
        );
    }

    // Show loading during redirect
    if (isRedirecting) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-slate-500 mt-2">Redirecting...</p>
                </div>
            </div>
        );
    }

    // If not logged in and not on public path, show nothing (redirect will happen)
    if (!user && !isPublicPath) {
        console.log('AuthGuard: Block render');
        return null;
    }

    console.log('AuthGuard: Rendering children');
    return <>{children}</>;
}
