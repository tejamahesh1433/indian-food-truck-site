"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLocationsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
    const [form, setForm] = useState({
        truckToday: "",
        truckNext: "",
    });

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setForm({
                    truckToday: data.truckToday || "",
                    truckNext: data.truckNext || "",
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

    if (loading) return <div className="p-10 text-white text-center">Loading Schedule...</div>;

    return (
        <main className="mx-auto max-w-3xl px-6 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-semibold mb-2">Truck Schedule</h1>
            <p className="text-gray-400 text-sm mb-10">Manage today&apos;s active location and the next upcoming stop.</p>

            <form onSubmit={handleSave} className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Today&apos;s Stop</label>
                    <p className="text-xs text-gray-500 mb-3">Where is the truck currently parked?</p>
                    <input
                        value={form.truckToday}
                        onChange={e => setForm({ ...form, truckToday: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                        placeholder="e.g. Downtown Square (11am - 3pm)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Next Upcoming Stop</label>
                    <p className="text-xs text-gray-500 mb-3">Where will you be heading next?</p>
                    <input
                        value={form.truckNext}
                        onChange={e => setForm({ ...form, truckNext: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                        placeholder="e.g. Marina District (Dinner Service)"
                    />
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button
                        disabled={saving}
                        className="bg-green-500 text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-green-400 transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Update Schedule"}
                    </button>
                    {status === "saved" && <span className="text-green-400 text-sm font-medium">Saved!</span>}
                    {status === "error" && <span className="text-red-400 text-sm font-medium">Failed to save.</span>}
                </div>
            </form>
        </main>
    );
}
