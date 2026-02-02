'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, type UserRole } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            console.log('AuthContext: initAuth starting');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('AuthContext: getSession result', { hasSession: !!session, error });

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchUserRole(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: onAuthStateChange', event);
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchUserRole(session.user.id);
                } else {
                    setRole(null);
                    setLoading(false);
                }
            }
        });

        initAuth();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId: string) => {
        console.log('AuthContext: fetchUserRole starting for', userId);

        // Timeout to prevent hanging indefinitely (3 seconds)
        const timeoutPromise = new Promise<{ data: null, error: { message: string } }>((resolve) => {
            setTimeout(() => {
                resolve({ data: null, error: { message: 'Timeout' } });
            }, 3000);
        });

        try {
            // Race the DB query against 3s timeout
            const { data, error } = await Promise.race([
                supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', userId)
                    .single(),
                timeoutPromise
            ]) as any;

            console.log('AuthContext: fetchUserRole completed', { data, error });

            if (error) {
                console.warn('Fetch role error or timeout:', error.message);
                // Fallback: If user is the specific admin email, grant admin to unblock them
                if (user?.email === 'mnifanmohdariff@gmail.com') {
                    setRole('admin');
                } else {
                    setRole('subcontractor');
                }
                setLoading(false);
                return;
            }

            if (data && data.role) {
                setRole(data.role as UserRole);
            } else {
                setRole('subcontractor');
            }
        } catch (error) {
            console.error('Exception fetching user role:', error);
            setRole('subcontractor');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        console.log('AuthContext: signOut called (fire-and-forget)');

        // Don't wait for network - just clear local state immediately
        supabase.auth.signOut().catch(e => console.error('SignOut background error:', e));

        setRole(null);
        setUser(null);
        setSession(null);
        router.push('/login');
        router.refresh();
        console.log('AuthContext: signOut complete, redirecting');
    };

    return (
        <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
