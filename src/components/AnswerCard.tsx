'use client';

import Image from 'next/image';
import { Answer } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface AnswerCardProps {
  answer: Answer;
  onDelete?: (answerId: string) => void;
  canDelete?: boolean;
}

export function AnswerCard({ answer, onDelete, canDelete = false }: AnswerCardProps) {
  const excerpt = answer.body
    .replace(/<[^>]*>/g, '')
    .substring(0, 200)
    .concat('...');

  const timeAgo = formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true });

  // Badge for ANSWERER type
  const isExpert = answer.user?.userType === 'ANSWERER';

  return (
    <article className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {answer.user?.avatarUrl && (
            <Image
              src={answer.user.avatarUrl}
              alt={answer.user.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{answer.user?.displayName}</h4>
              {isExpert && (
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded font-medium">
                  {answer.user?.answererType === 'KOREAN_NATIVE' ? '🇰🇷 Native' : '🏠 Local'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete?.(answer.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>

      {/* Body */}
      <div className="text-gray-700 mb-3 whitespace-pre-wrap">{excerpt}</div>

      {/* Attachments */}
      {answer.attachments && answer.attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {answer.attachments.map((att) => (
            <a
              key={att.id}
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded overflow-hidden hover:opacity-80 transition-opacity"
            >
              <Image
                src={att.fileUrl}
                alt="Attachment"
                width={150}
                height={96}
                className="w-full h-24 object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {/* Comments */}
      {answer.comments && answer.comments.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            💬 {answer.comments.length} Comments
          </p>
          <div className="space-y-2">
            {answer.comments.slice(0, 3).map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded p-2">
                <p className="text-xs font-medium text-gray-700">
                  {comment.user?.displayName}
                </p>
                <p className="text-xs text-gray-600">{comment.body}</p>
              </div>
            ))}
            {answer.comments.length > 3 && (
              <p className="text-xs text-gray-500">
                +{answer.comments.length - 3} more comments
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
