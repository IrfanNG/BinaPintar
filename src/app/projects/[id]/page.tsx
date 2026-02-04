import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Camera, Clock, Building2, MapPin, Banknote, FileText } from 'lucide-react';
import Link from 'next/link';
import { getProject } from '@/lib/services/projects';
import { getSiteLogs } from '@/lib/services/site-logs';
import { getPermits } from '@/lib/services/permits';
import { getClaims } from '@/lib/services/claims';
import { SiteLogTimeline } from '@/components/site-logs/SiteLogTimeline';
import { AddSiteLogDialog } from '@/components/site-logs/AddSiteLogDialog';
import { ProjectReportButton } from '@/components/projects/ProjectReportButton';

interface ProjectDetailPageProps {
    params: Promise<{ id: string }>;
}

async function ProjectHeader({ projectId }: { projectId: string }) {
    // Fetch data needed for report and header
    const [project, siteLogs, allPermits] = await Promise.all([
        getProject(projectId),
        getSiteLogs(projectId),
        getPermits()
    ]);

    if (!project) {
        notFound();
    }

    const projectPermits = allPermits.filter(p => p.project_id === projectId);

    const startDate = new Date(project.start_date).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const endDate = project.end_date
        ? new Date(project.end_date).toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : 'Ongoing';

    return (
        <div className="bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Project ID: {project.id.slice(0, 8)}
                        </div>
                        <Badge
                            variant={project.status === 'Active' ? 'default' : 'secondary'}
                            className={
                                project.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 px-3 py-1 font-bold'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border-0 px-3 py-1 font-bold'
                            }
                        >
                            {project.status.toUpperCase()}
                        </Badge>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        {project.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground pt-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>Commercial Construction</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Kuala Lumpur, Malaysia</span>
                        </div>

                        {/* Generate Report Button - Desktop Placement */}
                        <div className="hidden md:block">
                            <ProjectReportButton project={project} siteLogs={siteLogs} permits={projectPermits} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px] bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Duration</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Start Date</p>
                            <p className="text-sm font-bold text-foreground">{startDate}</p>
                        </div>
                    </div>

                    {project.end_date && (
                        <>
                            <div className="w-px h-4 bg-slate-200 ml-4 my-1" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Target Completion</p>
                                    <p className="text-sm font-bold text-foreground">{endDate}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Report Button */}
                <div className="md:hidden">
                    <ProjectReportButton project={project} siteLogs={siteLogs} permits={projectPermits} />
                </div>
            </div>
        </div>
    );
}

async function ProjectStats({ projectId }: { projectId: string }) {
    const [siteLogs, claims, project] = await Promise.all([
        getSiteLogs(projectId),
        getClaims(projectId),
        getProject(projectId)
    ]);

    const photosCount = siteLogs.filter(l => l.photo_url).length;
    const pendingClaimsAmount = claims
        .filter(c => c.status === 'Pending')
        .reduce((sum, c) => sum + c.amount, 0);

    // Calculate days remaining
    let daysRemaining = 'Ongoing';
    if (project?.end_date) {
        const end = new Date(project.end_date);
        const today = new Date();
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = diff > 0 ? `${diff} Days` : 'Ended';
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{photosCount}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Photos</div>
                </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                        <Banknote className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">RM {pendingClaimsAmount < 1000 ? pendingClaimsAmount : `${(pendingClaimsAmount / 1000).toFixed(1)}k`}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending Claims</div>
                </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{daysRemaining}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Timeline</div>
                </CardContent>
            </Card>
        </div>
    );
}

async function SiteLogsSection({ projectId }: { projectId: string }) {
    const siteLogs = await getSiteLogs(projectId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between sticky top-14 bg-background/95 backdrop-blur z-10 py-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Site Progress Log
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{siteLogs.length}</span>
                </h2>
                <AddSiteLogDialog projectId={projectId} />
            </div>

            {siteLogs.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Camera className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            No site logs recorded
                        </h3>
                        <p className="text-sm text-slate-500 text-center max-w-xs mb-6">
                            Start documenting the construction progress by uploading photos and notes.
                        </p>
                        <AddSiteLogDialog projectId={projectId} variant="outline" />
                    </CardContent>
                </Card>
            ) : (
                <SiteLogTimeline siteLogs={siteLogs} />
            )}
        </div>
    );
}

import { supabase } from '@/lib/supabase';
import { ProgressSlider } from '@/components/projects/ProgressSlider';

// Helper to get current user server-side
async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

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

async function ProjectProgressSection({ projectId }: { projectId: string }) {
    const project = await getProject(projectId);

    if (!project) return null;

    return (
        <div className="grid gap-6">
            <ProgressSlider
                projectId={projectId}
                initialProgress={project.progress_percent || 0}
            />
        </div>
    );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { id } = await params;

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            {/* Back Button */}
            <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Projects List
            </Link>

            {/* Project Header */}
            <Suspense fallback={<div className="h-64 bg-white rounded-xl animate-pulse" />}>
                <ProjectHeader projectId={id} />
            </Suspense>

            {/* Progress Section */}
            <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse" />}>
                <ProjectProgressSection projectId={id} />
            </Suspense>

            {/* Summary Stats */}
            <Suspense fallback={<div className="h-32 bg-slate-100 rounded-xl animate-pulse" />}>
                <ProjectStats projectId={id} />
            </Suspense>

            {/* Site Logs Section */}
            <Suspense
                fallback={
                    <div className="space-y-6">
                        <div className="h-10 bg-slate-100 rounded w-48" />
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                                        <div className="h-32 bg-white rounded-xl border border-slate-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            >
                <SiteLogsSection projectId={id} />
            </Suspense>
        </div>
    );
}
