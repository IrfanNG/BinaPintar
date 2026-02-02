'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X, Loader2, Camera } from 'lucide-react';
import { createSiteLog, uploadSitePhoto } from '@/lib/services/site-logs';
import { toast } from 'sonner';
import Image from 'next/image';
import { extractImageMetadata, type ImageMetadata } from '@/lib/utils/exif-extractor';
import { MapPin, CalendarClock } from 'lucide-react';

interface AddSiteLogDialogProps {
    projectId: string;
    variant?: 'default' | 'outline';
}

export function AddSiteLogDialog({ projectId, variant = 'default' }: AddSiteLogDialogProps) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<ImageMetadata>({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);

            // Extract metadata
            const meta = await extractImageMetadata(file);
            setMetadata(meta);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setMetadata({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setIsLoading(true);

        try {
            let photoUrl: string | null = null;

            // Upload photo if selected
            if (photoFile) {
                photoUrl = await uploadSitePhoto(photoFile);
                if (!photoUrl) {
                    toast.error('Failed to upload photo');
                    setIsLoading(false);
                    return;
                }
            }

            // Create site log
            const result = await createSiteLog({
                project_id: projectId,
                supervisor_id: null,
                description: description.trim(),
                photo_url: photoUrl,
                metadata: metadata,
            });

            if (result) {
                toast.success('Site log added successfully');
                setDescription('');
                setPhotoFile(null);
                setPhotoPreview(null);
                setOpen(false);
                router.refresh();
            } else {
                toast.error('Failed to create site log');
            }
        } catch (error) {
            console.error('Error creating site log:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Site Log
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add Site Log</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Document your site progress with a photo and description.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Photo (optional)
                        </label>

                        {photoPreview ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={photoPreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={removePhoto}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                {(metadata.latitude || metadata.timestamp) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] text-white backdrop-blur-sm space-y-1">
                                        {metadata.latitude && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-red-500" />
                                                <span>Verified Location Found</span>
                                            </div>
                                        )}
                                        {metadata.timestamp && (
                                            <div className="flex items-center gap-1.5">
                                                <CalendarClock className="w-3 h-3 text-blue-400" />
                                                <span>{new Date(metadata.timestamp).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 cursor-pointer transition-colors"
                            >
                                <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Tap to take or upload photo
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Description *
                        </label>
                        <Textarea
                            placeholder="Describe the work completed, progress made, or any issues..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="bg-background border-input resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={isLoading || !description.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Save Log
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
