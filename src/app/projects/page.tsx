
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Calendar, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getProjects } from '@/lib/services/projects';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import type { Project } from '@/lib/supabase';
import { cn } from '@/lib/utils';


import { supabase } from '@/lib/supabase';

// Get current user server-side
async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // We need the role from user_profiles
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    return {
        id: session.user.id,
        role: profile?.role
    };
}

function ProjectCard({ project }: { project: Project }) {
    const startDate = new Date(project.start_date).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <Link href={`/projects/${project.id}`}>
            <Card className="h-full bg-white border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-6 border-b border-dashed border-slate-100 bg-slate-50/50">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 font-bold text-xl group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                {project.name.charAt(0)}
                            </div>
                            <Badge className={cn(
                                "font-bold uppercase tracking-wide border-0 px-2.5 py-1",
                                project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                            )}>
                                {project.status}
                            </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {project.name}
                        </h3>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 mt-auto space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Start Date</p>
                                    <p className="text-slate-700">{startDate}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Location</p>
                                    <p className="text-slate-700">See Details</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <span className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                View Project <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

async function ProjectsList() {
    const user = await getCurrentUser();

    // Pass filtering context
    const projects = await getProjects({
        userId: user?.id,
        role: user?.role
    });

    const canCreate = user?.role === 'admin' || user?.role === 'supervisor';

    if (projects.length === 0) {
        return (
            <div className="col-span-full">
                <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                            <FolderKanban className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            {canCreate
                                ? "It looks like you haven't added any projects yet. Start by initializing a new construction site."
                                : "No projects have been assigned to you yet. Please contact your administrator."}
                        </p>
                        {canCreate && <AddProjectDialog />}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-[340px] bg-white border-border animate-pulse rounded-xl" />
            ))}
        </div>
    );
}

export default async function ProjectsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">All Projects</h1>
                    <p className="text-muted-foreground font-medium max-w-2xl">
                        Manage your ongoing construction sites, track progress, and view document status.
                    </p>
                </div>
                <AddProjectDialog />
            </div>

            {/* Projects List */}
            <Suspense fallback={<LoadingSkeleton />}>
                <ProjectsList />
            </Suspense>
        </div>
    );
}
