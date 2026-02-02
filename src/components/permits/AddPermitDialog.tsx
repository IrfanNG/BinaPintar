'use client';

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { createPermit } from '@/lib/services/permits';
import { getProjects } from '@/lib/services/projects';
import { toast } from 'sonner';
import type { Project } from '@/lib/supabase';

export function AddPermitDialog({ variant = "default" }: { variant?: "default" | "outline" }) {
    const [open, setOpen] = useState(false);
    const [docName, setDocName] = useState('');
    const [projectId, setProjectId] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
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

        if (!docName || !projectId || !expiryDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createPermit({
                doc_name: docName.trim(),
                project_id: projectId,
                expiry_date: expiryDate,
            });

            if (result) {
                toast.success('Permit added successfully');
                setOpen(false);
                setDocName('');
                setProjectId('');
                setExpiryDate('');
                router.refresh();
            } else {
                toast.error('Failed to add permit');
            }
        } catch (error) {
            console.error('Error adding permit:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2" variant={variant}>
                    <Plus className="h-4 w-4" />
                    Add Permit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Permit</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Register a document to track its expiration status.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="docName">Document Name *</Label>
                        <Input
                            id="docName"
                            placeholder="e.g. Fire Safety Certificate"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <select
                            id="project"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            required
                        >
                            <option value="">Select a project...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                            id="expiryDate"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Permit
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
