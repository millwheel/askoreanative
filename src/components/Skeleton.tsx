/**
 * Skeleton Loading Component
 * Generic reusable skeleton for loading states
 */

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width = '100%', height = '1rem' }: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={style}
    />
  );
}

/**
 * Question Card Skeleton
 * Loading state for question cards in list
 */
export function QuestionCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={20} />
      </div>
      <Skeleton width="80%" height={24} />
      <Skeleton height={16} />
      <Skeleton width="60%" height={16} />
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Skeleton width={24} height={24} className="rounded-full" />
          <Skeleton width={100} height={16} />
        </div>
        <div className="flex gap-4">
          <Skeleton width={60} height={16} />
          <Skeleton width={60} height={16} />
        </div>
      </div>
    </div>
  );
}

/**
 * Answer Card Skeleton
 * Loading state for answer cards
 */
export function AnswerCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} className="rounded-full" />
          <div className="space-y-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={60} height={20} />
      </div>
      <Skeleton height={16} />
      <Skeleton width="80%" height={16} />
    </div>
  );
}

/**
 * Comment Skeleton
 * Loading state for comments
 */
export function CommentSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton width={32} height={32} className="rounded-full" />
        <div className="space-y-1">
          <Skeleton width={100} height={14} />
          <Skeleton width={70} height={12} />
        </div>
      </div>
      <Skeleton height={14} />
      <Skeleton width="80%" height={14} />
    </div>
  );
}

/**
 * Generic List Skeleton
 * Loading state for lists with multiple items
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <QuestionCardSkeleton key={i} />
      ))}
    </div>
  );
}
