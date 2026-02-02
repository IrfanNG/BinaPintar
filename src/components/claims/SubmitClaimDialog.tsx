'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Loader2, FileText } from 'lucide-react';
import { createClaim } from '@/lib/services/claims';
import { getProjects } from '@/lib/services/projects';
import { uploadSitePhoto } from '@/lib/services/site-logs'; // Reuse this or create generic
import { toast } from 'sonner';
import type { Project } from '@/lib/supabase';
import { useEffect } from 'react';

export function SubmitClaimDialog() {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            getProjects().then(setProjects);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectId || !amount || !description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            let proofUrl: string | null = null;
            if (proofFile) {
                // Reuse uploadSitePhoto but ideally use generic upload
                // Assuming 'claim-docs' bucket logic in database, here we might need to adjust service
                // For MVP we'll reuse the existing upload function which goes to site-photos
                // In production, update uploadSitePhoto to accept bucket name

                // Temp: Use existing upload function (goes to site-photos)
                proofUrl = await uploadSitePhoto(proofFile);
            }

            await createClaim({
                project_id: projectId,
                amount: parseFloat(amount),
                description: description.trim(),
                status: 'Pending',
                proof_url: proofUrl,
                submitted_by: null, // Auth user in future
                approved_by: null,
            });

            toast.success('Claim submitted successfully');
            setOpen(false);
            setAmount('');
            setDescription('');
            setProjectId('');
            setProofFile(null);
            router.refresh();

        } catch (error) {
            console.error('Error submitting claim:', error);
            toast.error('Failed to submit claim');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit New Claim
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Submit Payment Claim</DialogTitle>
                    <DialogDescription>
                        Submit a reimbursement claim or invoice for approval.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Project</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            required
                        >
                            <option value="">Select a project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (RM)</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Describe the expense details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    {/* Proof Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Invoice / Proof (Optional)</label>
                        <div className="border border-input rounded-md p-3 flex items-center gap-3">
                            <Input
                                type="file"
                                id="proof"
                                className="hidden"
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('proof')?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                            </Button>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {proofFile ? proofFile.name : 'No file selected'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Claim
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
