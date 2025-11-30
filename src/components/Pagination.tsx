'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  className = '',
}: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  // Previous button
  if (currentPage > 1) {
    pages.push(
      <Link
        key="prev"
        href={getPageUrl(currentPage - 1)}
        className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
      >
        ← Previous
      </Link>
    );
  }

  // First page if not in range
  if (startPage > 1) {
    pages.push(
      <Link
        key="1"
        href={getPageUrl(1)}
        className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
      >
        1
      </Link>
    );
    if (startPage > 2) {
      pages.push(
        <span key="ellipsis-start" className="px-2 py-2">
          ...
        </span>
      );
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const isCurrentPage = i === currentPage;
    pages.push(
      <Link
        key={i}
        href={getPageUrl(i)}
        className={`px-3 py-2 rounded border ${
          isCurrentPage
            ? 'bg-primary text-white border-primary'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        {i}
      </Link>
    );
  }

  // Last page if not in range
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis-end" className="px-2 py-2">
          ...
        </span>
      );
    }
    pages.push(
      <Link
        key={totalPages}
        href={getPageUrl(totalPages)}
        className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
      >
        {totalPages}
      </Link>
    );
  }

  // Next button
  if (currentPage < totalPages) {
    pages.push(
      <Link
        key="next"
        href={getPageUrl(currentPage + 1)}
        className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50"
      >
        Next →
      </Link>
    );
  }

  return (
    <div className={`flex gap-2 items-center justify-center flex-wrap ${className}`}>
      {pages}
    </div>
  );
}
