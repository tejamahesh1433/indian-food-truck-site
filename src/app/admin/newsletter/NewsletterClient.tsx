"use client";

import { useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface Subscriber {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export default function NewsletterClient({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
    const [search, setSearch] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filtered = subscribers.filter(s => 
        s.email.toLowerCase().includes(search.toLowerCase()) || 
        (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleDelete(id: string) {
        const ok = await confirm({ title: "Remove Subscriber", message: "This email will be removed from your newsletter list.", confirmLabel: "Remove", variant: "danger" });
        if (!ok) return;
        setIsDeleting(id);
        
        try {
            const res = await fetch(`/api/newsletter?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSubscribers(prev => prev.filter(s => s.id !== id));
            } else {
                toast.error("Failed to remove subscriber.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(null);
        }
    }

    function handleExportCSV() {
        const headers = ["Email", "Name", "Joined At"];
        const rows = filtered.map(s => [
            s.email,
            s.name || "",
            new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(c => `"${c}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-orange-500/50 transition"
                    />
                </div>
                <button
                    onClick={handleExportCSV}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Export CSV
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Joined</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length > 0 ? (
                            filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4 font-medium">{s.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{s.name || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            disabled={isDeleting === s.id}
                                            className="text-red-400 hover:text-red-300 font-medium text-sm transition disabled:opacity-50"
                                        >
                                            {isDeleting === s.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                    No subscribers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="text-sm text-gray-500">
                Total Subscribers: {filtered.length} {search && `(matching "${search}")`}
            </div>
        </div>
    );
}
