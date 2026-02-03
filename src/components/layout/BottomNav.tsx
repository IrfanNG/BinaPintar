'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, FolderKanban, FileWarning,
    Banknote, UserCircle, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import type { UserRole } from '@/lib/supabase';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { title: 'Home', href: '/', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { title: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin', 'supervisor', 'subcontractor'] },
    { title: 'Permits', href: '/permits', icon: FileWarning, roles: ['admin', 'supervisor'] },
    { title: 'Claims', href: '/claims', icon: Banknote, roles: ['admin'] },
    { title: 'My Claims', href: '/subcontractor', icon: UserCircle, roles: ['subcontractor'] },
    { title: 'Progress', href: '/client', icon: Eye, roles: ['client'] },
];

export function BottomNav() {
    const pathname = usePathname();
    const { role } = useAuth();

    // Filter items based on role
    const filteredItems = navItems.filter(item => {
        if (!role) return false;
        return item.roles.includes(role);
    }).slice(0, 5); // Max 5 items for mobile

    if (!role) return null;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border shadow-2xl">
            <div className="flex justify-around items-center h-16">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                'w-5 h-5',
                                isActive && 'text-primary'
                            )} />
                            <span className="text-[10px] font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
