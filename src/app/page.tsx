import { Suspense } from 'react';
import { ProjectReportButton } from '@/components/projects/ProjectReportButton';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, FileWarning, Calendar, ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getProjects, getActiveProjectCount } from '@/lib/services/projects';
import { getExpiringPermitsCount } from '@/lib/services/permits';
import type { Project } from '@/lib/supabase';
import { cn } from '@/lib/utils';

async function DashboardStats() {
  const [activeProjects, expiringPermits] = await Promise.all([
    getActiveProjectCount(),
    getExpiringPermitsCount(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Active Projects Card */}
      <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Projects</p>
              <h3 className="text-4xl font-bold text-foreground tabular-nums tracking-tight">{activeProjects}</h3>
              <p className="text-sm text-primary font-medium flex items-center gap-1 mt-1">
                <Activity className="w-3.5 h-3.5" />
                In Progress
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <FolderKanban className="h-7 w-7 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Permits Card */}
      <Card className={cn(
        "bg-white border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative",
        expiringPermits > 0 && "bg-striped-warning/5 border-accent/20"
      )}>
        <div className={cn("absolute top-0 left-0 w-1 h-full", expiringPermits > 0 ? "bg-accent" : "bg-muted-foreground")} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Expiring Permits</p>
              <h3 className={cn("text-4xl font-bold tabular-nums tracking-tight", expiringPermits > 0 ? "text-accent" : "text-foreground")}>
                {expiringPermits}
              </h3>
              <p className={cn("text-sm font-medium flex items-center gap-1 mt-1", expiringPermits > 0 ? "text-accent" : "text-muted-foreground")}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Next 30 Days
              </p>
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300",
              expiringPermits > 0 ? "bg-accent/10" : "bg-muted"
            )}>
              <FileWarning className={cn("h-7 w-7", expiringPermits > 0 ? "text-accent" : "text-muted-foreground")} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const startDate = new Date(project.start_date).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full bg-white border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
              {project.name.charAt(0)}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "font-semibold border-0 px-3 py-1",
                project.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {project.status.toUpperCase()}
            </Badge>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>

          <div className="mt-auto pt-4 border-t border-dashed border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{startDate}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

async function ProjectsList() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return (
      <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
            <FolderKanban className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No projects started</h3>
          <p className="text-slate-500 text-center max-w-sm mb-6">
            Get started by initializing your first construction project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-white border-border h-32 animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-8 bg-slate-100 rounded w-16" />
                </div>
                <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <WelcomeBanner />
        <div className="text-sm text-muted-foreground font-semibold bg-white px-4 py-2 rounded-lg border border-border shadow-sm">
          {new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            Current Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 group"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 bg-white border-border animate-pulse" />
              ))}
            </div>
          }
        >
          <ProjectsList />
        </Suspense>
      </div>
    </div>
  );
}
