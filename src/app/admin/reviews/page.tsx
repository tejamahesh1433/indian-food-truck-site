"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type Review = { id: string; name: string; rating: number; text: string; isApproved: boolean; createdAt: string };

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
                <svg key={s} className={`h-4 w-4 ${s <= rating ? "text-orange-400" : "text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function AdminReviewsPage() {
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

    const fetch_ = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/reviews");
        if (res.ok) { const d = await res.json(); setReviews(d.reviews); }
        setLoading(false);
    };

    useEffect(() => { fetch_(); }, []);

    const patch = async (id: string, isApproved: boolean) => {
        await fetch("/api/admin/reviews", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isApproved }),
        });
        fetch_();
    };

    const del = async (id: string) => {
        const ok = await confirm({ title: "Delete Review", message: "This review will be permanently removed.", confirmLabel: "Delete", variant: "danger" });
        if (!ok) return;
        await fetch("/api/admin/reviews", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetch_();
    };

    const filtered = reviews.filter(r =>
        filter === "all" ? true : filter === "pending" ? !r.isApproved : r.isApproved
    );

    const pendingCount = reviews.filter(r => !r.isApproved).length;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Customer Reviews</h1>
                    {pendingCount > 0 && (
                        <p className="text-sm text-orange-400 mt-1">{pendingCount} pending approval</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {(["pending", "approved", "all"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                                filter === f
                                    ? "bg-orange-600 text-white"
                                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                    <div className="text-5xl mb-4">⭐</div>
                    <p className="font-black uppercase tracking-widest text-sm">No {filter} reviews</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(review => (
                        <div key={review.id} className={`bg-white/5 border rounded-2xl p-5 flex gap-4 ${review.isApproved ? "border-green-500/20" : "border-orange-500/20"}`}>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-sm">{review.name}</span>
                                    <Stars rating={review.rating} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                        review.isApproved ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                                    }`}>
                                        {review.isApproved ? "Approved" : "Pending"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{review.text}</p>
                                <p className="text-[10px] text-gray-600">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                {!review.isApproved ? (
                                    <button
                                        onClick={() => patch(review.id, true)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
                                    >
                                        Approve
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => patch(review.id, false)}
                                        className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
                                    >
                                        Unpublish
                                    </button>
                                )}
                                <button
                                    onClick={() => del(review.id)}
                                    className="border border-red-500/30 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
