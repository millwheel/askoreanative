'use client';

import { useState, useMemo } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface QuestionFiltersProps {
  onSearchChange?: (search: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: 'newest' | 'mostViewed') => void;
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: 'newest' | 'mostViewed';
}

export function QuestionFilters({
  onSearchChange,
  onCategoryChange,
  onSortChange,
  initialSearch = '',
  initialCategory = '',
  initialSort = 'newest',
}: QuestionFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<'newest' | 'mostViewed'>(initialSort);

  // Debounce search input
  const debouncedSearch = useDebounce(search, 300);

  // Call callback when debounced search changes
  useMemo(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    onCategoryChange?.(newCategory);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as 'newest' | 'mostViewed';
    setSort(newSort);
    onSortChange?.(newSort);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Search Questions
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            📁 Category
          </label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            📊 Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="mostViewed">Most Viewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
