import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, CheckCircle, Clock, Banknote, Filter, ExternalLink } from 'lucide-react';
import { getClaims, updateClaimStatus } from '@/lib/services/claims';
import { SubmitClaimDialog } from '@/components/claims/SubmitClaimDialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

// Client component for Actions
import { ClaimActions } from './actions';

async function ClaimsList() {
    const claims = await getClaims();

    // Calculate totals
    const totalPending = claims
        .filter(c => c.status === 'Pending')
        .reduce((sum, c) => sum + c.amount, 0);

    const totalPaid = claims
        .filter(c => c.status === 'Paid')
        .reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                            <h3 className="text-2xl font-bold text-slate-900">RM {totalPending.toFixed(2)}</h3>
                        </div>
                        <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Paid</p>
                            <h3 className="text-2xl font-bold text-slate-900">RM {totalPaid.toFixed(2)}</h3>
                        </div>
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Banknote className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Claims</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No claims found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                claims.map((claim) => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {new Date(claim.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {claim.project?.name || 'Unknown Project'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{claim.description}</span>
                                                {claim.proof_url && (
                                                    <a
                                                        href={claim.proof_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        <FileText className="h-3 w-3" /> View Proof
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">RM {claim.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <ClaimStatusBadge status={claim.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ClaimActions claim={claim} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function ClaimStatusBadge({ status }: { status: string }) {
    if (status === 'Paid') {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Paid</Badge>;
    }
    if (status === 'Approved') {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Approved</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Pending</Badge>;
}

export default function ClaimsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Financial Claims</h1>
                    <p className="text-muted-foreground mt-1">Manage contractor claims, approvals, and payments.</p>
                </div>
                <SubmitClaimDialog />
            </div>

            <Suspense fallback={<div>Loading claims...</div>}>
                <ClaimsList />
            </Suspense>
        </div>
    );
}
