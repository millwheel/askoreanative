'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Question } from '@/types';
import { AnswerCard } from '@/components/AnswerCard';
import { CommentList } from '@/components/CommentList';
import { LoginPrompt } from '@/components/LoginPrompt';
import { EmptyState } from '@/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';

interface QuestionDetailPageProps {
  params: { id: string };
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/questions/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch question');

        const result = await response.json();
        setQuestion(result.data);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchQuestion();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4fbfa]">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="space-y-4">
            <div className="h-12 bg-white rounded animate-pulse" />
            <div className="h-32 bg-white rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <EmptyState
          icon="⚠️"
          title="Question Not Found"
          description={error || 'The question you are looking for does not exist.'}
          action={{
            label: 'Back to Questions',
            href: '/questions',
          }}
        />
      </main>
    );
  }

  const categoryLabel = {
    TRANSPORT: '🚗 Transport',
    FOOD: '🍜 Food',
    ACCOMMODATION: '🏨 Accommodation',
    CULTURE: '🎭 Culture',
    ACTIVITIES: '🎪 Activities',
    VISA_DOCUMENTS: '📄 Visa/Documents',
    SAFETY: '🛡️ Safety',
  }[question.category] || question.category;

  const timeAgo = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

  return (
    <main className="min-h-screen bg-[#f4fbfa]">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href="/questions"
            className="text-sm text-primary hover:underline mb-4 inline-block"
          >
            ← Back to Questions
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {question.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="bg-primary-light text-primary px-3 py-1 rounded-full font-medium">
                  {categoryLabel}
                </span>
                <span>{timeAgo}</span>
                {question.viewCount && <span>👁️ {question.viewCount} views</span>}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {question.user?.avatarUrl && (
                  <img
                    src={question.user.avatarUrl}
                    alt={question.user.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {question.user?.displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.user?.userType === 'ANSWERER' && '🏠 Answerer'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {question.answers?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Answers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Question Body */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <article className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="prose prose-sm max-w-none mb-4">
            <p className="text-gray-700 whitespace-pre-wrap">{question.body}</p>
          </div>

          {/* Attachments */}
          {question.attachments && question.attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {question.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={att.fileUrl}
                    alt="Attachment"
                    className="w-full h-32 object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Comments on Question */}
          {question.comments && question.comments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                💬 Comments ({question.comments.length})
              </h3>
              <CommentList comments={question.comments} />
            </div>
          )}
        </article>
      </section>

      {/* Answers Section */}
      <section className="mx-auto max-w-4xl px-4 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Answers ({question.answers?.length || 0})
        </h2>

        {!question.answers || question.answers.length === 0 ? (
          <EmptyState
            icon="🤔"
            title="No Answers Yet"
            description="Be the first to answer this question and help this traveler!"
            action={{
              label: 'Sign In to Answer',
              href: '/login?redirectTo=' + encodeURIComponent(`/questions/${question.id}`),
            }}
          />
        ) : (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <div key={answer.id} className="space-y-2">
                <AnswerCard answer={answer} />

                {/* Comments on Answer */}
                {answer.comments && answer.comments.length > 0 && (
                  <div className="ml-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Comments ({answer.comments.length})
                    </h4>
                    <CommentList comments={answer.comments} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Login Prompt for unregistered users */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <LoginPrompt
          message="Want to answer this question?"
          redirectTo={`/questions/${question.id}`}
        />
      </section>
    </main>
  );
}
