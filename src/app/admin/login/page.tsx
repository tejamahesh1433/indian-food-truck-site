"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErr(data.error || "Login failed");
            return;
        }

        router.push("/admin/menu-items");
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h1>Admin Login</h1>
            <p>Enter admin password to continue.</p>

            <form onSubmit={onSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    style={{ width: "100%", padding: 10, marginTop: 10, color: "black" }}
                />
                {err && <p style={{ color: "red" }}>{err}</p>}
                <button style={{ marginTop: 12, padding: 10, width: "100%" }}>Login</button>
            </form>
        </div>
    );
}
