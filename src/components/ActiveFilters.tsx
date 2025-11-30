'use client';

import { CATEGORIES } from '@/lib/constants';

interface ActiveFiltersProps {
  search?: string;
  category?: string;
  sort?: 'newest' | 'mostViewed';
  onClearSearch?: () => void;
  onClearCategory?: () => void;
  onClearSort?: () => void;
  onClearAll?: () => void;
}

export function ActiveFilters({
  search,
  category,
  sort,
  onClearSearch,
  onClearCategory,
  onClearSort,
  onClearAll,
}: ActiveFiltersProps) {
  const hasActiveFilters = search || category || (sort && sort !== 'newest');

  if (!hasActiveFilters) {
    return null;
  }

  const getCategoryLabel = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  const getSortLabel = (s: string) => {
    return s === 'mostViewed' ? 'Most Viewed' : 'Newest';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Active Filters:</p>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {search && (
          <div className="inline-flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
            <span className="text-gray-700">
              🔍 <span className="font-medium">{search}</span>
            </span>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        )}

        {category && (
          <div className="inline-flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
            <span className="text-gray-700">
              <span className="font-medium">{getCategoryLabel(category)}</span>
            </span>
            {onClearCategory && (
              <button
                onClick={onClearCategory}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        )}

        {sort && sort !== 'newest' && (
          <div className="inline-flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
            <span className="text-gray-700">
              📊 <span className="font-medium">{getSortLabel(sort)}</span>
            </span>
            {onClearSort && (
              <button
                onClick={onClearSort}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
