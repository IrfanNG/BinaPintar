'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getMyClaimsForSubcontractor } from '@/lib/services/claims';
import type { Claim } from '@/lib/supabase';

export function MyClaimsList() {
    const { user } = useAuth();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClaims = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getMyClaimsForSubcontractor(user.id);
            setClaims(data);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchClaims();
        } else if (!useAuth().loading) {
            // If auth is done loading and no user, stop loading claims
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return null; // Or show "Please login"
    }

    if (loading) {
        return <div className="text-center py-8 text-slate-500">Loading your claims...</div>;
    }

    if (claims.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500 mb-2">You haven&apos;t submitted any claims yet.</p>
                <p className="text-xs text-slate-400">Use the form above to submit your first claim.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-slate-900">My Claims History</h3>
                <Button variant="ghost" size="sm" onClick={fetchClaims}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-3">
                {claims.map((claim) => (
                    <Card key={claim.id} className="overflow-hidden border-l-4" style={{
                        borderLeftColor:
                            claim.status === 'Paid' ? '#10b981' :
                                claim.status === 'Approved' ? '#3b82f6' :
                                    '#f59e0b'
                    }}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-slate-900 text-lg">RM {claim.amount.toFixed(2)}</p>
                                    <p className="text-sm font-medium text-slate-600">{claim.project?.name}</p>
                                </div>
                                <StatusBadge status={claim.status} />
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded">
                                {claim.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                                {claim.proof_url && (
                                    <a
                                        href={claim.proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        <FileText className="h-3 w-3" /> View Invoice
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Paid') {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 gap-1"><CheckCircle className="h-3 w-3" /> Paid</Badge>;
    }
    if (status === 'Approved') {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
}
