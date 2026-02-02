'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { createClaim, uploadClaimInvoice } from '@/lib/services/claims';
import { getProjects } from '@/lib/services/projects';
import type { Project } from '@/lib/supabase';

export function ClaimForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    // Form States
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    useEffect(() => {
        // Load active projects
        const loadProjects = async () => {
            try {
                const data = await getProjects();
                // Filter for active projects only if needed, but getProjects might return all
                setProjects(data.filter(p => p.status === 'Active'));
            } catch (err) {
                console.error('Failed to load projects', err);
            }
        };
        loadProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit a claim');
            return;
        }

        if (!projectId || !amount || !description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            let proofUrl: string | null = null;
            if (invoiceFile) {
                proofUrl = await uploadClaimInvoice(invoiceFile);
            }

            await createClaim({
                project_id: projectId,
                amount: parseFloat(amount),
                description: description.trim(),
                status: 'Pending',
                proof_url: proofUrl,
                submitted_by: user.id,
                approved_by: null,
            });

            toast.success('Claim submitted successfully!');

            // Reset form
            setAmount('');
            setDescription('');
            setProjectId('');
            setInvoiceFile(null);

            router.refresh(); // Refresh server components (MyClaimsList)
        } catch (error) {
            console.error('Error submitting claim:', error);
            toast.error('Failed to submit claim. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full bg-white shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-xl">Submit New Claim</CardTitle>
                <CardDescription>Enter claim details for reimbursement</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Project</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Project --</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Amount (RM)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 font-medium">RM</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <Textarea
                            placeholder="What is this claim for? (e.g. Material purchase, Labor cost)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    {/* Invoice Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Invoice / Receipt</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 transition-colors hover:border-primary/50 text-center">
                            <input
                                type="file"
                                id="invoice-upload"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="invoice-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="text-sm text-slate-600">
                                    {invoiceFile ? (
                                        <span className="text-primary font-medium flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {invoiceFile.name}
                                        </span>
                                    ) : (
                                        <span>Click to upload PDF or Image</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Claim
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
