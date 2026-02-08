'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, FolderKanban, FileWarning, HardHat,
    Banknote, UserCircle, ClipboardList, Eye, LogOut, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import type { UserRole } from '@/lib/supabase';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: (UserRole | null)[];
    exactMatch?: boolean;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        roles: ['admin', 'supervisor'],
        exactMatch: true,
    },
    {
        title: 'Projects',
        href: '/projects',
        icon: FolderKanban,
        roles: ['admin', 'supervisor'],
    },
    {
        title: 'Permits',
        href: '/permits',
        icon: FileWarning,
        roles: ['admin', 'supervisor'],
    },
    {
        title: 'Analytics',
        href: '/admin',
        icon: BarChart3,
        roles: ['admin'],
        exactMatch: true,
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: UserCircle,
        roles: ['admin'],
    },
    {
        title: 'Claims Management',
        href: '/claims',
        icon: Banknote,
        roles: ['admin'],
    },

    {
        title: 'My Claims Portal',
        href: '/subcontractor',
        icon: UserCircle,
        roles: ['subcontractor'],
    },
    {
        title: 'Project Progress',
        href: '/client',
        icon: Eye,
        roles: ['client'],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, role, signOut } = useAuth();

    // Filter navigation based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!role) return false;
        return item.roles.includes(role);
    });

    const getRoleDisplay = (r: UserRole | null) => {
        switch (r) {
            case 'admin': return 'Administrator';
            case 'supervisor': return 'Site Supervisor';
            case 'subcontractor': return 'Sub-Contractor';
            case 'client': return 'Client';
            default: return 'User';
        }
    };

    return (
        <aside className="hidden lg:flex flex-col h-screen w-72 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-30">
            {/* Branding */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border/50">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 shadow-sm">
                    <HardHat className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">BinaPintar</h1>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Construction CMS</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                <div className="px-3 mb-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Menu
                </div>
                {filteredNavItems.map((item) => {
                    const isActive = item.exactMatch
                        ? pathname === item.href
                        : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href + item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                'w-4 h-4 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )} />
                            <span>{item.title}</span>

                            {/* Active Dot instead of strip */}
                            {isActive && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div className="px-6 py-6 border-t border-sidebar-border/50 bg-black/10">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sidebar-accent border border-sidebar-foreground/10 flex items-center justify-center text-sidebar-foreground font-bold">
                            {user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
                            <p className="text-[10px] text-primary uppercase font-bold mt-0.5">
                                {getRoleDisplay(role)}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="p-2 text-sidebar-foreground/60 hover:text-red-400 hover:bg-sidebar-accent rounded-md transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Link href="/login" className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground text-center py-2 rounded text-sm font-medium">
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
