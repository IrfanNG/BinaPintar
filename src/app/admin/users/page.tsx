
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsers, updateUserRole } from '@/lib/services/users';
import type { UserProfile, UserRole } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, UserCog } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === currentUser?.id) {
            toast.error("You cannot change your own role");
            return;
        }

        setUpdatingId(userId);
        const success = await updateUserRole(userId, newRole);

        if (success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success("User role updated");
        } else {
            toast.error("Failed to update role");
        }
        setUpdatingId(null);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 border-red-200';
            case 'supervisor': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'subcontractor': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'client': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manage system access and roles for all registered users.
                </p>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-primary" />
                        All Users
                    </CardTitle>
                    <CardDescription>
                        Total Users: {users.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Current Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.full_name || 'No Name'}
                                        {currentUser?.id === user.id && (
                                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            disabled={updatingId === user.id || currentUser?.id === user.id}
                                            value={user.role}
                                            onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                                <SelectItem value="client">Client</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
