'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 py-24">
      <div className="relative w-full max-w-lg">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

        <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Oops! Something went wrong
          </h1>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            We encountered an unexpected error. Don&apos;t worry, it&apos;s not you, it&apos;s us. Our team has been notified.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              Return Home
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-white/40 text-sm italic">
              &quot;Cooking is a series of mistakes... until it&apos;s delicious.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
