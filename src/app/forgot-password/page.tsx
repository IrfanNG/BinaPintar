'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, HardHat, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Redirect directly to the reset password page where client SDK will handle the has fragment
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            setSuccess(true);
            toast.success('Password reset link sent!');
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

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
                    <h2 className="text-4xl font-extrabold mb-4">Account Recovery</h2>
                    <p className="text-slate-400">Securely recover access to your construction workspace.</p>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Secure 256-bit Encryption
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password?</h2>
                        <p className="text-slate-500">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleReset} className="space-y-6">
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

                            <Button
                                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 text-center bg-green-50 p-6 rounded-lg border border-green-100">
                            <h3 className="text-green-800 font-bold">Check your inbox</h3>
                            <p className="text-green-700 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full mt-2 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                                onClick={() => setSuccess(false)}
                            >
                                Try another email
                            </Button>
                        </div>
                    )}

                    <div className="text-center text-sm font-medium text-slate-600">
                        <Link href="/login" className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 group transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
