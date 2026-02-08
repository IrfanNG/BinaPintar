'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getProjects } from '@/lib/services/projects';
import type { Project } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FolderKanban, Eye, Loader2 } from 'lucide-react';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { MyClaimsList } from '@/components/claims/MyClaimsList';

export default function SubcontractorPortal() {
    const { user, loading, role, signOut } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const loadProjects = async () => {
            if (user?.id) {
                try {
                    const data = await getProjects({ userId: user.id, role: 'subcontractor' });
                    setProjects(data);
                } catch (error) {
                    console.error('Error loading projects:', error);
                } finally {
                    setLoadingProjects(false);
                }
            }
        };
        loadProjects();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sub-Contractor Portal</h1>
                </div>
                <p className="text-muted-foreground">
                    Welcome, <span className="font-medium text-slate-800">{user.user_metadata.full_name || user.email}</span>.
                    Manage your assigned projects and claims here.
                </p>
            </div>

            {/* Assigned Projects Section */}
            <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-primary" /> Assigned Projects
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingProjects ? (
                        <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No projects have been assigned to you yet.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {projects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="p-4 border rounded-xl hover:bg-slate-50 hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{project.name}</h3>
                                            <Badge variant={project.status === 'Active' ? 'active' : 'outline'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-1 text-primary font-medium">
                                                View Details <Eye className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 mt-8 mb-4">
                <h2 className="text-xl font-bold text-slate-900">My Claims</h2>
            </div>

            <ClaimForm />

            <div className="mt-8">
                <MyClaimsList />
            </div>
        </div>
    );
}
