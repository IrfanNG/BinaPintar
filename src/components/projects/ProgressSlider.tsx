'use client';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateProjectProgress } from '@/lib/services/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

interface ProgressSliderProps {
    projectId: string;
    initialProgress: number;
    readOnly?: boolean;
}

import { useAuth } from '@/lib/auth/auth-context';

export function ProgressSlider({ projectId, initialProgress, readOnly: propReadOnly = false }: ProgressSliderProps) {
    const { role, loading: authLoading } = useAuth();
    const [progress, setProgress] = useState(initialProgress);
    const [loading, setLoading] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    // Determine editability from client auth state
    const canEdit = role === 'admin' || role === 'supervisor';
    const isReadOnly = propReadOnly || (!authLoading && !canEdit);

    console.log('ProgressSlider Rendered:', {
        projectId,
        initialProgress,
        propReadOnly,
        role,
        canEdit,
        isReadOnly,
        currentProgress: progress
    });

    const handleValueChange = (value: number[]) => {
        console.log('Slider value changing:', value);
        setProgress(value[0]);
        setHasChanged(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const success = await updateProjectProgress(projectId, progress);
            if (success) {
                toast.success('Project progress updated');
                setHasChanged(false);
            } else {
                toast.error('Failed to update progress');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Physical Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <span className={cn(
                                "text-4xl font-bold block",
                                progress === 100 ? "text-emerald-600" : "text-primary"
                            )}>
                                {progress}%
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">Completed</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Slider
                            disabled={isReadOnly || authLoading}
                            value={[progress]}
                            onValueChange={handleValueChange}
                            max={100}
                            step={5}
                            className={cn("w-full transition-opacity duration-200", (isReadOnly || authLoading) && "cursor-not-allowed opacity-80")}
                        />

                        {/* Debug Fallback */}
                        {!isReadOnly && (
                            <div className="pt-2 opacity-50 hover:opacity-100 transition-opacity">
                                <label className="text-xs text-muted-foreground block mb-1">Debug Control (Native Input):</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progress}
                                    onChange={(e) => handleValueChange([parseInt(e.target.value)])}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        )}

                        {!isReadOnly && (
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!hasChanged || loading}
                                    className={cn(
                                        "transition-all duration-200",
                                        hasChanged ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                                    )}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Update
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
