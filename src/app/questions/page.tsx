'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Question } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';

const CATEGORIES = [
  'All Categories',
  'TRANSPORT',
  'FOOD',
  'ACCOMMODATION',
  'CULTURE',
  'ACTIVITIES',
  'VISA_DOCUMENTS',
  'SAFETY',
];

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || 'All Categories');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('pageSize', '10');
        if (search) params.set('search', search);
        if (category !== 'All Categories') params.set('category', category);

        const response = await fetch(`/api/questions?${params}`);
        if (!response.ok) throw new Error('Failed to fetch questions');

        const result = await response.json();
        setQuestions(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, search, category]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#f4fbfa]">
      {/* Header Section */}
      <section className="border-b border-[#d7f3ef] bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Browse Questions
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find real questions from travelers and answers from local Korean
              experts.
            </p>
          </div>
          <Link
            href="/questions/new"
            className="mt-2 w-full rounded-full bg-[#2EC4B6] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#27A89D] md:mt-0 md:w-auto inline-block text-center"
          >
            ⊕ Ask a Question
          </Link>
        </div>
      </section>

      {/* Filter Section */}
      <section className="border-b border-[#e0f4f1] bg-[#f9fefe]">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search questions about Korea..."
                className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6]"
              />
            </div>

            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] md:w-52"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All Categories'
                    ? 'All Categories'
                    : {
                        TRANSPORT: '🚗 Transport',
                        FOOD: '🍜 Food',
                        ACCOMMODATION: '🏨 Accommodation',
                        CULTURE: '🎭 Culture',
                        ACTIVITIES: '🎪 Activities',
                        VISA_DOCUMENTS: '📄 Visa/Documents',
                        SAFETY: '🛡️ Safety',
                      }[c] || c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Questions List */}
      <section className="mx-auto max-w-5xl px-4 py-8">
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
            icon="🔍"
            title="No Questions Found"
            description="Try a different search term or category. Or be the first to ask!"
            action={{
              label: 'Ask a Question',
              href: '/questions/new',
            }}
          />
        )}

        {!loading && !error && questions.length > 0 && (
          <>
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/questions"
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
