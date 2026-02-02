'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Banknote, Loader2 } from 'lucide-react';
import { updateClaimStatus } from '@/lib/services/claims';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Claim } from '@/lib/supabase';

export function ClaimActions({ claim }: { claim: Claim }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdateStatus = async (status: 'Approved' | 'Paid') => {
        setIsLoading(true);
        try {
            await updateClaimStatus(claim.id, status);
            toast.success(`Claim marked as ${status}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    if (claim.status === 'Paid') {
        return null;
    }

    if (claim.status === 'Approved') {
        return (
            <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleUpdateStatus('Paid')}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4 mr-1" />}
                Mark Paid
            </Button>
        );
    }

    return (
        <Button
            size="sm"
            variant="outline"
            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
            onClick={() => handleUpdateStatus('Approved')}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Approve
        </Button>
    );
}
