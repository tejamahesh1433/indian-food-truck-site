"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
            <h1 className="text-2xl font-semibold">Admin Login</h1>
            <p className="mt-2 text-sm opacity-80">Enter the admin password to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
                <input
                    className="w-full rounded-xl border px-4 py-3 bg-black text-white"
                    type="password"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {err && <div className="text-sm text-red-600">{err}</div>}

                <button
                    className="w-full rounded-xl bg-orange-500 font-bold px-4 py-3 text-black disabled:opacity-60 transition hover:bg-orange-600"
                    disabled={loading || !password}
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    );
}
