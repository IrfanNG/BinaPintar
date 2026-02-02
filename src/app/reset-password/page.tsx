'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, HardHat, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function ResetPasswordPage() {
    const { user, loading: authLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    // If user is not authenticated and not loading, the link is likely invalid (hash missing or expired)
    // However, sometimes it takes a split second for the hash to process.
    // AuthContext's loading state should handle this.

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setUpdating(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Password updated successfully!');
            router.push('/');
        } catch (error) {
            console.error('Update password error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invalid Link</h2>
                    <p className="text-slate-500">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Button
                        onClick={() => router.push('/forgot-password')}
                        className="w-full"
                    >
                        Request New Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            {/* Split layout consistent with login */}
            <div className="hidden lg:flex lg:w-1/2 bg-blueprint relative flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <HardHat className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">BinaPintar</span>
                </div>
                <div className="max-w-md">
                    <h2 className="text-4xl font-extrabold mb-4">Reset Password</h2>
                    <p className="text-slate-400">Create a new secure password for your account.</p>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Secure 256-bit Encryption
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">New Password</h2>
                        <p className="text-slate-500">
                            Please enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-medium">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                            type="submit"
                            disabled={updating}
                        >
                            {updating ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
