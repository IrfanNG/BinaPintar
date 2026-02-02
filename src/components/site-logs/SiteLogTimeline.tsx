'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, ImageIcon } from 'lucide-react';
import type { SiteLog } from '@/lib/supabase';
import Image from 'next/image';

interface SiteLogTimelineProps {
    siteLogs: SiteLog[];
}

export function SiteLogTimeline({ siteLogs }: SiteLogTimelineProps) {
    return (
        <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border" />

            {siteLogs.map((log, index) => {
                const date = new Date(log.created_at);
                const formattedDate = date.toLocaleDateString('en-MY', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
                const formattedTime = date.toLocaleTimeString('en-MY', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                return (
                    <div key={log.id} className="relative flex gap-4 md:gap-6 pb-6">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                            <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                {log.photo_url ? (
                                    <div className="w-10 md:w-14 h-10 md:h-14 rounded-full overflow-hidden">
                                        <Image
                                            src={log.photo_url}
                                            alt="Site log"
                                            width={56}
                                            height={56}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <Card className="flex-1 bg-card border-border hover:border-primary/30 transition-colors">
                            <CardContent className="p-4">
                                {/* Date and Time */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Clock className="w-3 h-3" />
                                    <span>{formattedDate}</span>
                                    <span>•</span>
                                    <span>{formattedTime}</span>
                                </div>

                                {/* Photo */}
                                {log.photo_url && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                                        <Image
                                            src={log.photo_url}
                                            alt="Site progress"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                )}

                                {/* Description */}
                                <p className="text-sm text-foreground leading-relaxed">
                                    {log.description}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
