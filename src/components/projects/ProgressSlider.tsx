'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateProjectProgress } from '@/lib/services/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';

interface ProgressSliderProps {
    projectId: string;
    initialProgress: number;
}

export function ProgressSlider({ projectId, initialProgress }: ProgressSliderProps) {
    const { role, loading: authLoading } = useAuth();
    const [progress, setProgress] = useState(initialProgress);
    const [loading, setLoading] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    // Determine editability ONLY from client auth state (server prop is unreliable)
    const canEdit = role === 'admin' || role === 'supervisor';

    // While auth is loading, assume editable (will be corrected once loaded)
    const isReadOnly = authLoading ? false : !canEdit;

    const handleProgressChange = (newValue: number) => {
        const clampedValue = Math.min(Math.max(newValue, 0), 100);
        setProgress(clampedValue);
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
                    {/* Progress Bar Visualization */}
                    <div className="w-full h-3 bg-primary/20 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-300",
                                progress === 100 ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Percentage Display - Always visible */}
                    <div className="text-center">
                        <span className={cn(
                            "text-5xl font-bold block",
                            progress === 100 ? "text-emerald-600" : "text-primary"
                        )}>
                            {progress}%
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">Completed</span>
                    </div>

                    {/* Stepper Controls - Only for admin/supervisor */}
                    {!isReadOnly && (
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => handleProgressChange(progress - 5)}
                                disabled={progress <= 0}
                                className="h-12 w-12 rounded-full p-0"
                            >
                                <Minus className="w-5 h-5" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => handleProgressChange(progress + 5)}
                                disabled={progress >= 100}
                                className="h-12 w-12 rounded-full p-0"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {/* Save Button */}
                    {!isReadOnly && hasChanged && (
                        <div className="flex justify-center pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="min-w-[140px]"
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
            </CardContent>
        </Card>
    );
}
