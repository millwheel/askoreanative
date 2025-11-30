'use client';

import { FormEvent, useState } from 'react';
import { createCommentSchema } from '@/lib/validation';
import { useAuth } from './AuthContext';

interface CommentFormProps {
  postType: 'QUESTION' | 'ANSWER';
  postId: string;
  onSuccess?: (comment: any) => void;
}

export function CommentForm({ postType, postId, onSuccess }: CommentFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form data
      const validationResult = createCommentSchema.safeParse({
        postType,
        postId,
        body,
      });

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        if (fieldErrors.body) {
          setError(fieldErrors.body[0]);
        }
        return;
      }

      setIsSubmitting(true);

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          postType,
          postId,
          body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create comment');
      }

      const result = await response.json();
      setBody('');
      onSuccess?.(result.data);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '...' : 'Post'}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {body.length}/500 characters
      </p>
    </form>
  );
}
