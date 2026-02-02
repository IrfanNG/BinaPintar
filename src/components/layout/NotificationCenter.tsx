'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getUnreadNotifications, markAsRead, markAllAsRead } from '@/lib/services/notifications';
import type { Notification } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Polling for demo purposes (In production use Realtime subscriptions)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Simple realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getUnreadNotifications();
            setNotifications(data);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string, link: string | null) => {
        await markAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (link) router.push(link);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications([]);
    };

    const unreadCount = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 rounded-full text-[10px]">
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-8 text-xs text-muted-foreground">
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                        <Bell className="h-8 w-8 text-slate-200 mb-2" />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50"
                                onClick={() => handleMarkRead(n.id, n.link)}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <span className="font-semibold text-sm text-foreground">{n.title}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                {n.link && (
                                    <div className="flex items-center gap-1 text-[10px] text-primary font-medium mt-1">
                                        View Details <ExternalLink className="h-3 w-3" />
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
