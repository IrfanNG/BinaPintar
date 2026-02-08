'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export function ProjectBackButton() {
    const { role } = useAuth();
    const isClient = role === 'client';
    const isSubcontractor = role === 'subcontractor';

    let href = "/projects";
    let text = "Back to Projects List";

    if (isClient) {
        href = "/client";
        text = "Back to Client Portal";
    } else if (isSubcontractor) {
        href = "/subcontractor";
        text = "Back to My Claims Portal";
    }

    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
        >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {text}
        </Link>
    );
}
