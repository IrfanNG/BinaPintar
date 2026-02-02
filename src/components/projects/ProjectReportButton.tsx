'use client';

import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { generateWeeklyReport } from '@/lib/services/pdf-report';
import type { Project, SiteLog, Permit } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProjectReportButtonProps {
    project: Project;
    siteLogs: SiteLog[];
    permits: Permit[];
}

export function ProjectReportButton({ project, siteLogs, permits }: ProjectReportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const pdfBlob = await generateWeeklyReport(project, siteLogs, permits);

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `WeeklyReport_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Report generated successfully');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={isLoading}
            className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Generate Weekly Report
        </Button>
    );
}
