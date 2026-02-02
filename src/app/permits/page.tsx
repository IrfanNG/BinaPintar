import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileWarning, AlertTriangle, CheckCircle, Clock, CalendarDays, ExternalLink } from 'lucide-react';
import { getPermits, getPermitStatus } from '@/lib/services/permits';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Permit } from '@/lib/supabase';
import { AddPermitDialog } from '@/components/permits/AddPermitDialog';

async function PermitsTable() {
    const permits = await getPermits();

    if (permits.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                        <FileWarning className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        No permit records
                    </h3>
                    <p className="text-sm text-slate-500 text-center max-w-sm">
                        Permit documentation will appear here once added to your projects.
                    </p>
                    <div className="mt-6">
                        <AddPermitDialog variant="outline" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-5">Document Details</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-5">Related Project</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-5">Expiry Date</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-5 text-right pr-6">Current Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permits.map((permit, index) => {
                                const status = getPermitStatus(permit.expiry_date);
                                const expiryDate = new Date(permit.expiry_date).toLocaleDateString('en-MY', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                });

                                return (
                                    <TableRow
                                        key={permit.id}
                                        className={cn(
                                            'border-b border-border/50 bg-white transition-colors hover:bg-slate-50/50',
                                            status === 'expired' && 'bg-red-50/30 hover:bg-red-50/50',
                                            // Zebra striping logic could go here if preferred
                                        )}
                                    >
                                        <TableCell className="py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-slate-100 text-slate-500">
                                                    <FileWarning className="w-4 h-4" />
                                                </div>
                                                {permit.doc_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {permit.project ? (
                                                <Link
                                                    href={`/projects/${permit.project.id}`}
                                                    className="text-primary hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1 group"
                                                >
                                                    {permit.project.name}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">No Project Linked</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium tabular-nums">
                                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                                {expiryDate}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <PermitStatusBadge status={status} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {permits.map((permit) => {
                    const status = getPermitStatus(permit.expiry_date);
                    const expiryDate = new Date(permit.expiry_date).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });

                    return (
                        <Card
                            key={permit.id}
                            className={cn(
                                'bg-white border-border shadow-sm overflow-hidden',
                                status === 'expired' && 'border-red-200 border-l-4 border-l-red-500',
                                status === 'expiring' && 'border-amber-200 border-l-4 border-l-amber-500',
                                status === 'valid' && 'border-l-4 border-l-emerald-500'
                            )}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name</p>
                                        <h3 className="font-bold text-foreground text-lg">{permit.doc_name}</h3>
                                    </div>
                                    <PermitStatusBadge status={status} iconOnly />
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    {permit.project && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-slate-500">Project</span>
                                            <Link
                                                href={`/projects/${permit.project.id}`}
                                                className="text-sm font-bold text-primary hover:underline text-right truncate max-w-[180px]"
                                            >
                                                {permit.project.name}
                                            </Link>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-500">Expiry Date</span>
                                        <span className={cn("text-sm font-bold tabular-nums",
                                            status === 'expired' ? "text-red-600" :
                                                status === 'expiring' ? "text-amber-600" : "text-slate-700"
                                        )}>
                                            {expiryDate}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}

function PermitStatusBadge({ status, iconOnly = false }: { status: 'expired' | 'expiring' | 'valid', iconOnly?: boolean }) {
    if (status === 'expired') {
        return (
            <Badge className={cn("bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 px-2.5 py-0.5", iconOnly && "p-2 rounded-full")}>
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                {!iconOnly && <span className="ml-1.5 font-bold uppercase text-[10px] tracking-wide">Expired</span>}
            </Badge>
        );
    }

    if (status === 'expiring') {
        return (
            <Badge className={cn("bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 px-2.5 py-0.5", iconOnly && "p-2 rounded-full")}>
                <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                {!iconOnly && <span className="ml-1.5 font-bold uppercase text-[10px] tracking-wide">Expiring Soon</span>}
            </Badge>
        );
    }

    return (
        <Badge className={cn("bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 px-2.5 py-0.5", iconOnly && "p-2 rounded-full")}>
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
            {!iconOnly && <span className="ml-1.5 font-bold uppercase text-[10px] tracking-wide">Valid</span>}
        </Badge>
    );
}

function LoadingSkeleton() {
    return (
        <div className="bg-white border server-border rounded-xl p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-lg" />
            ))}
        </div>
    )
}

export default function PermitsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Permit Management</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Track regulatory compliance and document expiration dates across all projects.
                    </p>
                </div>

                {/* Simple Legend for Desktop */}
                <div className="hidden md:flex items-center gap-4 text-xs font-semibold bg-white px-4 py-2 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-600">Expired</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Warning (&lt;30 Days)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Valid</span>
                    </div>
                </div>

                <AddPermitDialog />
            </div>

            {/* Permits Table */}
            <Suspense fallback={<LoadingSkeleton />}>
                <PermitsTable />
            </Suspense>
        </div>
    );
}
