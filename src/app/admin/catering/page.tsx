"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequestType = {
    id: string;
    name: string;
    phone: string;
    email: string;
    eventDate: string | null;
    guests: string | null;
    location: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
};

export default function AdminCateringPage() {
    const [requests, setRequests] = useState<RequestType[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchRequests() {
        const res = await fetch("/api/admin/catering");
        if (res.ok) {
            const data = await res.json();
            setRequests(data.requests || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        (async () => {
            await fetchRequests();
        })();
    }, []);

    async function updateStatus(id: string, newStatus: string) {
        // optimistic UI
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        await fetch("/api/admin/catering", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus })
        });
    }

    if (loading) return <div className="p-10 text-white text-center">Loading inbound requests...</div>;

    return (
        <main className="mx-auto max-w-5xl px-6 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="flex items-end justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Catering Inbox</h1>
                    <p className="text-gray-400 text-sm">Review incoming quotes and mark them as contacted or completed.</p>
                </div>
                <div className="text-sm border border-white/10 px-4 py-2 rounded-xl bg-white/5 font-medium">
                    {requests.length} Requests
                </div>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 text-gray-400">
                        No catering requests yet.
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className={`p-6 rounded-2xl border ${req.status === 'DONE' ? 'border-green-500/20 bg-green-500/5' : req.status === 'CONTACTED' ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/10 bg-white/5'} transition`}>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold">{req.name}</h3>
                                        <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-6 flex flex-wrap gap-x-6 gap-y-2">
                                        <a href={`mailto:${req.email}`} className="hover:text-white transition">✉️ {req.email}</a>
                                        <a href={`tel:${req.phone}`} className="hover:text-white transition">📞 {req.phone}</a>
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {req.eventDate && (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Event Date</div>
                                                <div className="text-sm">{req.eventDate}</div>
                                            </div>
                                        )}
                                        {req.guests && (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Guests</div>
                                                <div className="text-sm">{req.guests}</div>
                                            </div>
                                        )}
                                        {req.location && (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</div>
                                                <div className="text-sm">{req.location}</div>
                                            </div>
                                        )}
                                    </div>

                                    {req.notes && (
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Notes</div>
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{req.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                                    <select
                                        value={req.status}
                                        onChange={(e) => updateStatus(req.id, e.target.value)}
                                        className={`w-full appearance-none px-4 py-2.5 rounded-xl border font-semibold text-sm outline-none cursor-pointer ${req.status === 'NEW' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                            : req.status === 'CONTACTED' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                                : 'bg-green-500/10 border-green-500/30 text-green-400'
                                            }`}
                                    >
                                        <option value="NEW" className="bg-neutral-900 text-white">Status: NEW</option>
                                        <option value="CONTACTED" className="bg-neutral-900 text-white">Status: CONTACTED</option>
                                        <option value="DONE" className="bg-neutral-900 text-white">Status: DONE</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
