'use client';

import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, icon = '📭', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>

      {action && (
        <Link
          href={action.href}
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
