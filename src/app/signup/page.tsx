'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, HardHat, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'subcontractor'
                    }
                }
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data.user) {
                toast.success('Account created successfully!');
                if (data.session) {
                    router.push('/');
                    router.refresh();
                } else {
                    toast.info('Please check your email to confirm your account.');
                    router.push('/login');
                }
            }

        } catch (error) {
            console.error('Signup error:', error);
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

                <div className="max-w-md space-y-6">
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Join the <span className="text-primary">Network</span>.<br />
                        Scale your <span className="text-slate-400">Claims</span>.
                    </h1>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-primary/20 rounded-full mt-1">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-slate-300">Submit construction claims digitally and get paid faster with instant approvals.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-primary/20 rounded-full mt-1">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-slate-300">Track all your sub-contracted projects in one unified dashboard.</p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-slate-500 font-medium">
                    Trusted by 500+ Sub-contractors across Malaysia
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-center space-y-2">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <HardHat className="text-white w-7 h-7" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
                        <p className="text-slate-500">
                            Register as a sub-contractor to start submitting claims
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name / Company Name</Label>
                            <Input
                                id="fullName"
                                placeholder="e.g. Maju Jaya Constructions"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contractor@site.com"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
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
                                "Create Workspace"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm font-medium text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 inline-flex items-center gap-1 group">
                            Sign In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
