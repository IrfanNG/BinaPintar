
import { Suspense } from 'react';
import { getFinancialSummary, getProjectProgressData, getHighRiskPermits } from '@/lib/services/analytics';
import { FinancialChart } from '@/components/analytics/FinancialChart';
import { PermitRiskList } from '@/components/analytics/PermitRiskList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, LayoutDashboard, Clock } from 'lucide-react';

async function AdminDashboardContent() {
    const [financialData, projectProgress, highRiskPermits] = await Promise.all([
        getFinancialSummary(),
        getProjectProgressData(),
        getHighRiskPermits(14),
    ]);

    const chartData = [
        { status: 'Paid', amount: financialData.paid },
        { status: 'Pending', amount: financialData.pending },
        { status: 'Approved', amount: financialData.approved },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Chart - Spans 2 columns */}
            <div className="lg:col-span-2 h-[400px]">
                <FinancialChart data={chartData} />
            </div>

            {/* Permit Risk List - Spans 1 column */}
            <div className="lg:col-span-1 h-[400px]">
                <PermitRiskList permits={highRiskPermits} />
            </div>

            {/* Project Progress - Full Width */}
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Project Progress
                        </CardTitle>
                        <CardDescription>Active projects status overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectProgress.map((project) => {
                                const startDate = new Date(project.startDate);
                                const endDate = project.endDate ? new Date(project.endDate) : null;
                                const now = new Date();

                                // Simple calculation for progress bar simulation
                                // In a real app, this would be based on actual tasks completed or % set in DB
                                let progress = 0;
                                if (endDate) {
                                    const totalDuration = endDate.getTime() - startDate.getTime();
                                    const elapsed = now.getTime() - startDate.getTime();
                                    progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
                                } else {
                                    // If no end date, just assume some default 'active' progress or calculate based on start date age
                                    progress = 25;
                                }

                                return (
                                    <div key={project.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 line-clamp-1">{project.name}</h4>
                                            <Badge variant="secondary" className="bg-white text-slate-600 border-slate-200">
                                                {project.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 mb-3">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Progress</span>
                                                <span className="font-medium text-primary">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            Start: {startDate.toLocaleDateString('en-MY')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sidebar text-white flex items-center justify-center shadow-md">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Analytics</h1>
                    <p className="text-slate-500 font-medium">System-wide performance and risks overview.</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                    <div className="lg:col-span-2 h-[400px] bg-slate-100 rounded-xl" />
                    <div className="lg:col-span-1 h-[400px] bg-slate-100 rounded-xl" />
                    <div className="lg:col-span-3 h-[200px] bg-slate-100 rounded-xl" />
                </div>
            }>
                <AdminDashboardContent />
            </Suspense>
        </div>
    );
}
