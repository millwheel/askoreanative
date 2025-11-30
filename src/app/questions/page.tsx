'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Question } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionFilters } from '@/components/QuestionFilters';
import { ActiveFilters } from '@/components/ActiveFilters';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [sort, setSort] = useState<'newest' | 'mostViewed'>(
    (searchParams?.get('sort') as 'newest' | 'mostViewed') || 'newest'
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('pageSize', '10');
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        params.set('sort', sort);

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
  }, [currentPage, search, category, sort]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: 'newest' | 'mostViewed') => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
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
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
          <QuestionFilters
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            initialSearch={search}
            initialCategory={category}
            initialSort={sort}
          />

          <ActiveFilters
            search={search}
            category={category}
            sort={sort}
            onClearSearch={() => handleSearchChange('')}
            onClearCategory={() => handleCategoryChange('')}
            onClearSort={() => handleSortChange('newest')}
            onClearAll={handleClearAll}
          />
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
