
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, FileText } from 'lucide-react';
import type { Permit } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PermitRiskListProps {
    permits: Permit[];
}

export function PermitRiskList({ permits }: PermitRiskListProps) {
    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <Card className="h-full border-red-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Permit Risk
                        </CardTitle>
                        <CardDescription>Expiring within 14 days</CardDescription>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                        {permits.length} Alert{permits.length !== 1 && 's'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {permits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                        <FileText className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No immediate risks detected</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {permits.map((permit) => {
                            const daysLeft = getDaysUntilExpiry(permit.expiry_date);
                            const isExpired = daysLeft < 0;

                            return (
                                <div
                                    key={permit.id}
                                    className={cn(
                                        "flex items-start justify-between p-3 rounded-lg border transition-colors",
                                        isExpired ? "bg-red-50 border-red-100" : "bg-orange-50/50 border-orange-100"
                                    )}
                                >
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm text-slate-800 line-clamp-1">{permit.doc_name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="font-medium text-slate-600">{permit.project?.name || 'Unknown Project'}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-bold border-0",
                                                isExpired ? "bg-red-200 text-red-800" : "bg-orange-100 text-orange-700"
                                            )}
                                        >
                                            {isExpired ? 'EXPIRED' : `${daysLeft} Days`}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(permit.expiry_date).toLocaleDateString('en-MY')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
            <div className="p-4 pt-0">
                <Link
                    href="/permits"
                    className="text-xs text-center block w-full text-slate-500 hover:text-primary hover:underline"
                >
                    View all permits
                </Link>
            </div>
        </Card>
    );
}
