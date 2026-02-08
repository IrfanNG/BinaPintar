
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Plus, Loader2 } from 'lucide-react';
import { createProject } from '@/lib/services/projects';
import { getUsersByRole } from '@/lib/services/users';
import type { UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/lib/auth/auth-context';

export function AddProjectDialog() {
    const { role } = useAuth();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Assignment states
    const [clients, setClients] = useState<UserProfile[]>([]);
    const [subcontractors, setSubcontractors] = useState<UserProfile[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedSubconIds, setSelectedSubconIds] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);

    const router = useRouter();

    // Only Admin and Supervisor can create projects
    if (role !== 'admin' && role !== 'supervisor') {
        return null;
    }

    // Fetch users when dialog opens
    useEffect(() => {
        if (open) {
            fetchAssignableUsers();
        }
    }, [open]);

    const fetchAssignableUsers = async () => {
        setIsFetchingUsers(true);
        const [clientsData, subconsData] = await Promise.all([
            getUsersByRole('client'),
            getUsersByRole('subcontractor')
        ]);
        setClients(clientsData);
        setSubcontractors(subconsData);
        setIsFetchingUsers(false);
    };

    const toggleSubcon = (id: string) => {
        setSelectedSubconIds(prev =>
            prev.includes(id)
                ? prev.filter(sid => sid !== id)
                : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !startDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createProject({
                name: name.trim(),
                status: 'Active',
                start_date: startDate,
                end_date: endDate || null,
                client_id: selectedClientId || null,
                subcontractor_ids: selectedSubconIds,
                progress_percent: 0,
            });

            if (result) {
                toast.success('Project created successfully');
                setOpen(false);
                setName('');
                setStartDate('');
                setEndDate('');
                setSelectedClientId('');
                setSelectedSubconIds([]);
                router.refresh();
            } else {
                toast.error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Project</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Initialize a new construction site and assign stakeholders.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-muted-foreground">Project Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Menara TRX Phase 2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-muted/30 border-transparent focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-muted-foreground">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="bg-muted/30 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-muted-foreground">Target Completion</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-muted/30 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Client Assignment */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Assign Client</Label>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="bg-muted/30 border-transparent focus:bg-white transition-colors">
                                <SelectValue placeholder="Select a client..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.full_name || client.email}
                                    </SelectItem>
                                ))}
                                {clients.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground">No clients found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subcontractor Assignment */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Assign Subcontractors</Label>
                        <div className="border border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 bg-muted/10">
                            {isFetchingUsers ? (
                                <div className="flex justify-center text-muted-foreground">Loading...</div>
                            ) : subcontractors.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No subcontractors found</div>
                            ) : (
                                subcontractors.map((subcon) => (
                                    <div
                                        key={subcon.id}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                                            selectedSubconIds.includes(subcon.id)
                                                ? "bg-primary/5 text-primary"
                                                : "hover:bg-slate-100 text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => toggleSubcon(subcon.id)}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                            selectedSubconIds.includes(subcon.id) ? "bg-primary border-primary text-white" : "border-slate-300"
                                        )}>
                                            {selectedSubconIds.includes(subcon.id) && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className="text-sm font-medium">{subcon.full_name || subcon.email}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        {selectedSubconIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {selectedSubconIds.map(id => {
                                    const sub = subcontractors.find(s => s.id === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="text-xs font-normal">
                                            {sub?.full_name || 'Unknown'}
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Project
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
