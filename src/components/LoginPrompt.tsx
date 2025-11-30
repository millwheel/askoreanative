'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LoginPromptProps {
  message?: string;
  redirectTo?: string;
}

export function LoginPrompt({
  message = 'Sign in to participate',
  redirectTo = '/',
}: LoginPromptProps) {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirectTo') || redirectTo;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-primary-light text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 mb-4">
        Create an account or sign in to ask questions, answer, and join our community.
      </p>

      <Link
        href={`/login?redirectTo=${encodeURIComponent(redirectParam)}`}
        className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
      >
        Sign In with Google
      </Link>
    </div>
  );
}
