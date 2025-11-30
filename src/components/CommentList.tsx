'use client';

import { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentListProps {
  comments: Comment[];
  onDelete?: (commentId: string) => void;
  canDelete?: (userId: string) => boolean;
}

export function CommentList({ comments, onDelete, canDelete }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500 text-sm">No comments yet</p>
      </div>
    );
  }

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
                <img
                  src={comment.user.avatarUrl}
                  alt={comment.user.displayName}
                  className="w-8 h-8 rounded-full"
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

            {canDelete?.(comment.userId) && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            )}
          </div>

          <p className="text-gray-700 text-sm">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
