"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErr(data?.error || "Login failed");
            return;
        }

        router.push("/admin");
    }

    return (
        <div className="mx-auto max-w-md p-6 mt-20">
            <Link href="/" className="inline-block mb-6 text-sm text-orange-500 hover:text-orange-400 transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Website
            </Link>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md">
                <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
                <p className="mt-2 text-sm text-gray-400">Enter the admin password to continue.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <input
                        className="w-full rounded-xl border border-white/10 px-4 py-3 bg-black/50 text-white outline-none focus:border-orange-500/50 transition"
                        type="password"
                        placeholder="Admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />

                    {err && <div className="text-sm text-red-500">{err}</div>}

                    <button
                        className="w-full rounded-xl bg-orange-500 font-bold px-4 py-3 text-black disabled:opacity-60 transition hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                        disabled={loading || !password}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
