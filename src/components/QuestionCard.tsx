'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Question } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface QuestionCardProps {
  question: Question;
  showPreview?: boolean;
}

export function QuestionCard({ question, showPreview = true }: QuestionCardProps) {
  const excerpt = question.body
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 150)
    .concat('...');

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
    <Link href={`/questions/${question.id}`}>
      <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-primary-light text-primary px-3 py-1 rounded-full font-medium">
            {categoryLabel}
          </span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
          {question.title}
        </h3>

        {/* Preview */}
        {showPreview && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* User and Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            {question.user?.avatarUrl && (
              <Image
                src={question.user.avatarUrl}
                alt={question.user.displayName}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-gray-700">{question.user?.displayName}</span>
          </div>

          <div className="flex gap-4">
            <span>📝 {question.answers?.length || 0} answers</span>
            <span>💬 {question.comments?.length || 0} comments</span>
            {question.viewCount && <span>👁️ {question.viewCount} views</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
