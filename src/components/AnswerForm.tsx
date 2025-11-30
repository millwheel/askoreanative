'use client';

import { FormEvent, useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { createAnswerSchema } from '@/lib/validation';
import { useAuth } from './AuthContext';

interface AnswerFormProps {
  questionId: string;
  onSuccess?: (answer: any) => void;
  onCancel?: () => void;
}

export function AnswerForm({ questionId, onSuccess, onCancel }: AnswerFormProps) {
  const { user, profile } = useAuth();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${user?.id}`,
      },
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBodyError(null);

    try {
      // Validate form data
      const validationResult = createAnswerSchema.safeParse({
        questionId,
        body,
      });

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        if (fieldErrors.body) {
          setBodyError(fieldErrors.body[0]);
        }
        return;
      }

      setIsSubmitting(true);

      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          questionId,
          body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create answer');
      }

      const result = await response.json();
      setBody('');
      onSuccess?.(result.data);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Answer</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Share your knowledge and experience..."
          onImageUpload={handleImageUpload}
          error={bodyError}
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Post Answer'}
        </button>
      </div>
    </form>
  );
}
