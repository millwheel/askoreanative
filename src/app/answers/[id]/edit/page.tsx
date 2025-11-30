'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Answer } from '@/types';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/components/AuthContext';
import { createAnswerSchema } from '@/lib/validation';

interface AnswerEditPageProps {
  params: { id: string };
}

export default function AnswerEditPage({ params }: AnswerEditPageProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!user) {
      router.push('/login?redirectTo=' + encodeURIComponent(`/answers/${params.id}/edit`));
    }
  }, [user, router, params.id]);

  // Fetch answer
  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/answers/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch answer');

        const result = await response.json();
        const fetchedAnswer = result.data;
        setAnswer(fetchedAnswer);
        setBody(fetchedAnswer.body);

        // Check ownership
        if (fetchedAnswer.userId !== user?.id && profile?.userType !== 'ADMIN') {
          setError('You do not have permission to edit this answer');
        }
      } catch (err) {
        console.error('Error fetching answer:', err);
        setError('Failed to load answer');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && params.id) {
      fetchAnswer();
    }
  }, [user, params.id, profile?.userType]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBodyError(null);

    if (!answer) return;

    try {
      // Validate form data
      const validationResult = createAnswerSchema.safeParse({
        questionId: answer.questionId,
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

      const response = await fetch(`/api/answers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          questionId: answer.questionId,
          body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update answer');
      }

      router.push(`/questions/${answer.questionId}`);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to update answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f4fbfa]">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="space-y-4">
            <div className="h-12 bg-white rounded animate-pulse" />
            <div className="h-64 bg-white rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !answer) {
    return (
      <main className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link href="/questions" className="text-primary hover:underline">
            Back to Questions
          </Link>
        </div>
      </main>
    );
  }

  if (!answer) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f4fbfa]">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href={`/questions/${answer.questionId}`}
            className="text-sm text-primary hover:underline mb-4 inline-block"
          >
            ← Back to Question
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Your Answer</h1>
        </div>
      </section>

      {/* Edit Form */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
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
            <Link
              href={`/questions/${answer.questionId}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
