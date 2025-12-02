'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Question } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { EmptyState } from '@/components/EmptyState';

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/questions?page=1&pageSize=5');
        if (!response.ok) throw new Error('Failed to fetch questions');

        const result = await response.json();
        setQuestions(result.data || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4fbfa]">
      {/* Hero Section */}
      <section className="bg-[#2EC4B6] text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Welcome to Korea Travel Q&A
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#eafffc] sm:text-base">
            Connect with local Korean experts who speak your language. Get
            authentic travel advice, cultural insights, and practical tips for
            your journey.
          </p>
          <Link
            href="/questions/new"
            className="mt-8 rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#2EC4B6] shadow-sm transition hover:bg-[#e2fffb]"
          >
            Ask Your First Question
          </Link>
        </div>
      </section>

      {/* Search Bar */}
      <section className="-mt-7">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions about Korea..."
                className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6]"
              />
            </div>
            <button className="flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-[#2EC4B6] hover:bg-[#27A89D]">
              🔍
            </button>

            <select className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] md:w-40">
              <option>All Categories</option>
              <option value="TRANSPORT">Transport</option>
              <option value="FOOD">Food</option>
              <option value="ACCOMMODATION">Accommodation</option>
              <option value="CULTURE">Culture</option>
              <option value="ACTIVITIES">Activities</option>
              <option value="VISA_DOCUMENTS">Visa/Documents</option>
              <option value="SAFETY">Safety</option>
            </select>
          </div>
        </div>
      </section>

      {/* Recent Questions */}
      <section className="mx-auto mt-10 max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Questions
          </h2>
          <Link
            href="/questions/new"
            className="flex items-center gap-2 rounded-full bg-[#2EC4B6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#27A89D]"
          >
            ⊕ Ask a Question
          </Link>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg bg-white p-4 h-32 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            icon="⚠️"
            title="Error Loading Questions"
            description={error}
          />
        )}

        {!loading && !error && questions.length === 0 && (
          <EmptyState
            icon="📭"
            title="No Questions Yet"
            description="Be the first to ask a question about your Korea travel plans!"
            action={{
              label: 'Ask the First Question',
              href: '/questions/new',
            }}
          />
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/questions"
              className="inline-block rounded-lg bg-primary text-white px-6 py-2 font-medium hover:bg-opacity-90 transition-all"
            >
              View All Questions
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
