"use client";

import { useEffect, useState } from "react";

type Review = { id: string; name: string; rating: number; text: string; createdAt: string };

function StarRating({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? "button" : undefined}
                    title={interactive ? `Rate ${star} stars` : undefined}
                    onClick={() => interactive && onChange?.(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
                >
                    <svg
                        className={`h-5 w-5 transition-colors ${
                            star <= (hovered || rating) ? "text-orange-400" : "text-gray-700"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
    const [form, setForm] = useState({ name: "", rating: 5, text: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [isApproved, setIsApproved] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.text) { setError("Please fill in all fields."); return; }
        setStatus("loading"); setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            const data = await res.json();
            setIsApproved(data.isApproved);
            setStatus("success");
            onSubmitted();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not submit review.");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className={`${isApproved ? "bg-orange-500/10 border-orange-500/20" : "bg-green-500/10 border-green-500/20"} border rounded-2xl p-6 text-center`}>
                <div className="text-3xl mb-2">{isApproved ? "✨" : "🙏"}</div>
                <p className={`font-black text-sm ${isApproved ? "text-orange-400" : "text-green-400"} uppercase tracking-widest`}>
                    {isApproved ? "Published!" : "Thank you!"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {isApproved 
                        ? "Your review is now live on the site." 
                        : "Your review is being reviewed and will appear shortly."}
                </p>
                {!isApproved && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Are you the owner?</p>
                        <a 
                            href="/truckadmin/reviews" 
                            className="inline-block text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 underline-offset-4 transition"
                        >
                            Go to Admin to Approve
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest">Leave a Review</h3>

            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Your rating</label>
                <StarRating rating={form.rating} interactive onChange={(r) => setForm({ ...form, rating: r })} />
            </div>

            <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition placeholder:text-gray-700"
            />

            <textarea
                placeholder="Tell us about your experience..."
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition placeholder:text-gray-700 resize-none"
            />

            {error && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest transition"
            >
                {status === "loading" ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    const fetchReviews = async () => {
        try {
            // Only fetch 'general' reviews for the homepage section
            const res = await fetch("/api/reviews?type=general");
            if (res.ok) { const d = await res.json(); setReviews(d.reviews || []); }
        } finally { setLoading(false); }
    };

    useEffect(() => { 
        fetchReviews(); 
        
        // Auto-refresh reviews every 10 seconds
        const pollInterval = setInterval(() => {
            fetch("/api/reviews?type=general", { cache: "no-store" })
                .then(res => res.json())
                .then(d => setReviews(d.reviews || []))
                .catch(err => console.error("Failed to poll reviews:", err));
        }, 10000);
        
        return () => clearInterval(pollInterval);
    }, []);

    if (loading) return null;

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = reviews.length > visibleCount;

    if (reviews.length === 0 && !showForm) {
        return (
            <section id="reviews" className="container-shell py-16 border-t border-white/5">
                <div className="text-center">
                    <p className="text-orange-500 font-black text-[11px] uppercase tracking-[0.3em] mb-3">Reviews</p>
                    <h2 className="text-3xl font-black italic tracking-tighter mb-6">Be the first to review</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-[0_12px_40px_rgba(249,115,22,0.25)]"
                    >
                        Write a Review
                    </button>
                    {showForm && <div className="mt-8 max-w-md mx-auto"><ReviewForm onSubmitted={() => { setShowForm(false); fetchReviews(); }} /></div>}
                </div>
            </section>
        );
    }

    const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0";

    return (
        <section id="reviews" className="container-shell py-16 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <p className="text-orange-500 font-black text-[11px] uppercase tracking-[0.3em] mb-3">What people say</p>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">
                            Customer Reviews
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-3xl font-black italic text-orange-500">{avg}</span>
                        <StarRating rating={Math.round(Number(avg))} />
                        <span className="text-xs text-gray-500">({reviews.length} general review{reviews.length !== 1 ? "s" : ""})</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="shrink-0 border border-white/15 bg-white/5 hover:border-orange-500/40 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition"
                >
                    {showForm ? "Cancel" : "Write a Review"}
                </button>
            </div>

            {showForm && (
                <div className="mb-10 max-w-md">
                    <ReviewForm onSubmitted={() => { setShowForm(false); fetchReviews(); }} />
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleReviews.map((review) => (
                    <div key={review.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-3">
                        <StarRating rating={review.rating} />
                        <p className="text-gray-300 text-sm leading-relaxed flex-1 italic">&ldquo;{review.text}&rdquo;</p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="font-black text-[11px] uppercase tracking-widest text-white">{review.name}</span>
                            <span className="text-[10px] text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="group flex flex-col items-center gap-2 mx-auto"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-orange-500 transition-colors">Load More Experience</span>
                        <div className="h-10 w-[1px] bg-gradient-to-b from-orange-500 to-transparent" />
                    </button>
                </div>
            )}
        </section>
    );
}
