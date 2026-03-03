import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center">
            <div className="container-shell py-20">
                <div className="max-w-xl card p-10">
                    <div className="text-sm text-gray-400">404</div>
                    <h1 className="mt-2 text-3xl md:text-4xl font-bold">
                        Page not found
                    </h1>
                    <p className="mt-3 text-gray-300">
                        That link doesn’t exist. Try the menu or go back to the homepage.
                    </p>

                    <div className="mt-8 flex gap-3 flex-wrap">
                        <Link
                            href="/"
                            className="bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-400 transition"
                        >
                            Go Home
                        </Link>
                        <Link
                            href="/menu"
                            className="border border-white/15 bg-white/5 px-6 py-3 rounded-full hover:border-white/40 transition"
                        >
                            View Menu
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
