"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
    const [form, setForm] = useState({
        phone: "",
        instagramUrl: "",
    });

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setForm({
                    phone: data.phone || "",
                    instagramUrl: data.instagramUrl || "",
                });
            }
            setLoading(false);
        })();
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) setStatus("saved");
            else setStatus("error");
        } catch {
            setStatus("error");
        }
        setSaving(false);
        setTimeout(() => setStatus("idle"), 3000);
    }

    if (loading) return <div className="p-10 text-white text-center">Loading Settings...</div>;

    return (
        <main className="mx-auto max-w-3xl px-6 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-semibold mb-2">Site Settings</h1>
            <p className="text-gray-400 text-sm mb-10">Manage globals like your display phone number and Instagram linkage.</p>

            <form onSubmit={handleSave} className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Public Phone Number</label>
                    <input
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                        placeholder="e.g. +1 555-555-5555"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Instagram URL</label>
                    <input
                        value={form.instagramUrl}
                        onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                        placeholder="https://instagram.com/yourhandle"
                    />
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button
                        disabled={saving}
                        className="bg-purple-500 text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-400 transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                    {status === "saved" && <span className="text-green-400 text-sm font-medium">Saved!</span>}
                    {status === "error" && <span className="text-red-400 text-sm font-medium">Failed to save.</span>}
                </div>
            </form>
        </main>
    );
}
