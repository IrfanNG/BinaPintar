'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FolderKanban, ClipboardList, FileText, Eye } from 'lucide-react';
import { getProjects } from '@/lib/services/projects';
import type { Project } from '@/lib/supabase';
import Link from 'next/link';

export default function ClientPortal() {
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
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        };
        if (user) loadProjects();
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Portal</h1>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                        Log Out
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Welcome, <span className="font-medium text-slate-800">{user.user_metadata?.full_name || user.email}</span>.
                    View your project progress and payment status here.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Projects</p>
                            <h3 className="text-2xl font-bold text-slate-900">{projects.length}</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FolderKanban className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Projects</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {projects.filter(p => p.status === 'Active').length}
                            </h3>
                        </div>
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {projects.filter(p => p.status === 'Completed').length}
                            </h3>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Projects List */}
            <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" /> Your Projects
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingProjects ? (
                        <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No projects assigned to you yet.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900">{project.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Started: {new Date(project.start_date).toLocaleDateString()}
                                                {project.end_date && ` • Target: ${new Date(project.end_date).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={project.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0'
                                            }>
                                                {project.status}
                                            </Badge>
                                            <Link href={`/projects/${project.id}`}>
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </Link>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${project.progress_percent === 100 ? 'bg-emerald-500' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${project.progress_percent || 0}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold min-w-[45px] text-right ${project.progress_percent === 100 ? 'text-emerald-600' : 'text-primary'
                                            }`}>
                                            {project.progress_percent || 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
