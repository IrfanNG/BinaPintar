
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { getComments, createComment } from '@/lib/services/comments';
import type { Comment } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SiteLogCommentsProps {
    siteLogId: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function SiteLogComments({ siteLogId, isOpen, onToggle }: SiteLogCommentsProps) {
    const { user, role } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Only admin and supervisor can post comments
    const canComment = role === 'admin' || role === 'supervisor';

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen]);

    const fetchComments = async () => {
        setLoading(true);
        const data = await getComments(siteLogId);
        setComments(data);
        setLoading(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !canComment) return;

        setSubmitting(true);
        try {
            const comment = await createComment(siteLogId, user.id, newComment);
            if (comment) {
                setComments([...comments, comment]);
                setNewComment('');
                toast.success('Comment posted');
            } else {
                toast.error('Failed to post comment');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!isOpen) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-muted-foreground hover:text-primary pl-0"
            >
                <MessageSquare className="w-4 h-4 mr-2" />
                {comments.length > 0 ? `${comments.length} Comments` : 'View Comments'}
            </Button>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground">Discussion</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                    Hide
                </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 italic">
                        No comments yet. Start the discussion.
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 text-sm group">
                            <Avatar className="w-8 h-8 border border-border">
                                <AvatarFallback className={cn(
                                    "text-xs font-bold",
                                    comment.user?.role === 'admin' ? "bg-primary text-white" :
                                        comment.user?.role === 'supervisor' ? "bg-orange-100 text-orange-700" :
                                            "bg-slate-100 text-slate-600"
                                )}>
                                    {getInitials(comment.user?.full_name || 'User')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">
                                        {comment.user?.full_name || 'Unknown User'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleDateString('en-MY', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg rounded-tl-none">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            {canComment ? (
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <Avatar className="w-8 h-8 hidden sm:block">
                        <AvatarFallback className="bg-slate-100">
                            {user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type your question or comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={submitting}
                            className="pr-10"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newComment.trim() || submitting}
                            className="absolute right-1 top-1 h-7 w-7"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="text-xs text-center text-muted-foreground bg-slate-50 p-2 rounded">
                    Only Admins and Supervisors can post comments.
                </div>
            )}
        </div>
    );
}
