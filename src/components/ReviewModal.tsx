"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
}

interface ReviewModalProps {
    orderId: string;
    items: OrderItem[];
    customerName: string;
    initialReviews?: { rating: number; text: string; menuItemId: string }[];
    onSuccess?: () => void;
    onClose: () => void;
}

function StarRating({ rating, onChange, readOnly = false }: { rating: number; onChange: (r: number) => void; readOnly?: boolean }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readOnly && onChange(star)}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    className={readOnly ? "cursor-default" : "cursor-pointer"}
                    title={readOnly ? undefined : `Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                    <svg
                        className={`h-6 w-6 transition-colors ${
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

export default function ReviewModal({ orderId, items, customerName, initialReviews, onSuccess, onClose }: ReviewModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // Check if we are in read-only mode (view mode)
    const isReadOnly = !!(initialReviews && initialReviews.length > 0);

    const [reviews, setReviews] = useState<Record<string, { rating: number; text: string }>>(() => {
        // If we have initial reviews (read-only mode), map them to items by menuItemId
        if (isReadOnly && initialReviews) {
            return items.reduce((acc, item) => {
                const existing = initialReviews.find(r => r.menuItemId === item.menuItemId);
                return {
                    ...acc,
                    [item.id]: { 
                        rating: existing?.rating || 5, 
                        text: existing?.text || "" 
                    }
                };
            }, {});
        }
        
        // Initial state for new reviews
        return items.reduce((acc, item) => ({
            ...acc,
            [item.id]: { rating: 5, text: "" }
        }), {});
    });

    const handleSubmitAll = async () => {
        if (isReadOnly) {
            onClose();
            return;
        }

        const reviewsToSubmit = items
            .map(item => ({
                ...reviews[item.id],
                menuItemId: item.menuItemId,
                name: customerName || "Customer",
                orderId: orderId
            }))
            .filter(r => r.text.trim().length >= 3);

        if (reviewsToSubmit.length === 0) {
            toast.error("Please provide at least one review with at least 3 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewsToSubmit),
            });

            if (res.ok) {
                toast.success("Reviews submitted successfully!");
                onSuccess?.();
                setIsSubmitted(true);
            } else {
                const data = await res.json();
                toast.error(data.details ? `${data.error} (${data.details})` : data.error || "Failed to submit reviews.");
            }
        } catch (err) {
            console.error("Review error:", err);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl"
                >
                    <div className="text-5xl mb-6">✨</div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4">Thank You!</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">Your feedback helps us grow and keep cooking the food you love. We appreciate your support!</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-orange-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] flex flex-col"
            >
                <button 
                    onClick={onClose}
                    title="Close Review Modal"
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <header className="mb-6 shrink-0">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                        {isReadOnly ? "Your Feedback" : "Review Your Items"}
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Order #{orderId.slice(-6).toUpperCase()}</p>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {items.map((item) => {
                        const state = reviews[item.id];
                        return (
                            <div key={item.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                                <h3 className="font-black text-sm uppercase tracking-widest text-orange-500">{item.name}</h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        Rating
                                        <span className="text-orange-500/50">•</span>
                                        <span className="text-white">{state.rating} Stars</span>
                                    </label>
                                    <StarRating 
                                        rating={state.rating} 
                                        readOnly={isReadOnly}
                                        onChange={(r) => setReviews(prev => ({ ...prev, [item.id]: { ...prev[item.id], rating: r } }))} 
                                    />
                                </div>

                                <textarea
                                    readOnly={isReadOnly}
                                    placeholder={isReadOnly ? "No comment" : `How was the ${item.name}? (min 3 chars)`}
                                    value={state.text}
                                    onChange={(e) => setReviews(prev => ({ ...prev, [item.id]: { ...prev[item.id], text: e.target.value } }))}
                                    className={`w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none transition placeholder:text-gray-700 resize-none h-24 ${isReadOnly ? 'cursor-default' : 'focus:border-orange-500/50'}`}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 shrink-0">
                    <button
                        onClick={handleSubmitAll}
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-5 rounded-[1.5rem] shadow-xl shadow-orange-600/20 hover:bg-orange-500 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                        {isReadOnly ? "Close Feedback" : (isSubmitting ? "Submitting Reviews..." : "Submit All Feedback")}
                    </button>
                    {!isReadOnly && (
                        <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Only items with comments will be submitted</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
