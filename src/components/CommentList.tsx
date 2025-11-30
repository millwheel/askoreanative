'use client';

import Image from 'next/image';
import { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './AuthContext';
import { useState } from 'react';

interface CommentListProps {
  comments: Comment[];
  onDelete?: (commentId: string) => void;
  canDelete?: (userId: string) => boolean;
}

export function CommentList({ comments, onDelete, canDelete }: CommentListProps) {
  const { user, profile } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!comments || comments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500 text-sm">No comments yet</p>
      </div>
    );
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      setDeletingId(commentId);
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onDelete?.(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const canUserDelete = (userId: string) => {
    return user && (user.id === userId || profile?.userType === 'ADMIN');
  };

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white border border-gray-100 rounded-lg p-3"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {comment.user?.avatarUrl && (
                <Image
                  src={comment.user.avatarUrl}
                  alt={comment.user.displayName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {comment.user?.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {canUserDelete(comment.userId) && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
                className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === comment.id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <p className="text-gray-700 text-sm">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
