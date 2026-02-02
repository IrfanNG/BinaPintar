'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, HardHat, Building2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Logged in successfully');
            router.push('/');
            router.refresh();

        } catch (error) {
            console.error('Login error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            {/* Left Panel - Brand / Blueprint (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-blueprint relative flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <HardHat className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">BinaPintar</span>
                </div>

                <div className="max-w-md space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Build <span className="text-primary">Smarter</span>.<br />
                        Manage <span className="text-slate-400">Better</span>.
                    </h1>
                    <p className="text-slate-400 text-lg">
                        The all-in-one Smart Construction CMS for modern contractors, supervisors, and clients.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Project Management</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <div>Site Logs</div>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <div>Smart Permits</div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-center space-y-2">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <HardHat className="text-white w-7 h-7" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                        <p className="text-slate-500">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="engineer@site.com"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                "Sign In to Workspace"
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400 font-medium">
                                or continue with
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-sm font-medium text-slate-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary hover:text-primary/80 inline-flex items-center gap-1 group">
                            Create Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400">
                    &copy; 2026 BinaPintar Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
}
