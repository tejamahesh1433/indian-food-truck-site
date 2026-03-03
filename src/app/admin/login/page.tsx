"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/admin/catering");
            return;
        }
        setStatus("error");
    }

    return (
        <main className="min-h-screen bg-black text-white flex items-center">
            <div className="container-shell py-16">
                <div className="max-w-md card p-8">
                    <h1 className="text-2xl font-bold">Admin Login</h1>
                    <p className="mt-2 text-gray-300">Enter the admin password to view catering requests.</p>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin password"
                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                            required
                        />
                        <button
                            className="w-full bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-400 transition disabled:opacity-60"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? "Signing in..." : "Sign in"}
                        </button>
                        {status === "error" && (
                            <p className="text-red-300 text-sm">Wrong password.</p>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}
