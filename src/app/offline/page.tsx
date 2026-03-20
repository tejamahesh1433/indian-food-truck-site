import Link from "next/link";

export const metadata = {
  title: "You're Offline | Indian Food Truck",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-900/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-center">
          <svg
            className="w-10 h-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-3">
          You&apos;re offline
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Looks like you&apos;ve lost your connection. Check your internet and try again — our{" "}
          <span className="text-orange-400 font-semibold">menu</span> and{" "}
          <span className="text-orange-400 font-semibold">catering</span> pages are available
          offline if you&apos;ve visited them before.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/menu"
            className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest text-xs transition"
          >
            Try Menu
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl border border-white/10 hover:border-orange-500/40 text-gray-300 font-bold uppercase tracking-widest text-xs transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
