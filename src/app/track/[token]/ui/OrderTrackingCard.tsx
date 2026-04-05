"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "@prisma/client";
import OrderChat from "@/components/OrderChat";
import ReviewModal from "@/components/ReviewModal";

const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusSteps = ["PAID", "PREPARING", "READY"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OrderTrackingCard({ order: initialOrder }: { order: any }) {
    const [order, setOrder] = useState(initialOrder);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/track/${order.chatToken}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [order.chatToken]);

    const currentStepIndex = statusSteps.indexOf(order.status);
    const hasReviews = order.reviews && order.reviews.length > 0;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md space-y-8"
            >
                {/* Header Info */}
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status as OrderStatus]}`}>
                                {order.status}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Customer: {order.customerName}</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Paid via Stripe</p>
                    </div>
                </div>

                {/* Status Visual Tracker */}
                {statusSteps.includes(order.status) && (
                    <div className="py-4">
                        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`
                                }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                        </div>
                        <div className="mt-6 flex justify-between">
                            {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center gap-3">
                                    <motion.div 
                                        animate={{
                                            scale: idx === currentStepIndex ? [1, 1.2, 1] : 1,
                                            backgroundColor: idx <= currentStepIndex ? "#f97316" : "#262626"
                                        }}
                                        transition={{ repeat: idx === currentStepIndex ? Infinity : 0, duration: 2 }}
                                        className="h-3 w-3 rounded-full border-4 border-[#0b0b0b] ring-1 ring-white/10" 
                                    />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${idx <= currentStepIndex ? 'text-white' : 'text-gray-600'}`}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completion / Review Prompt Section */}
                {order.status === "COMPLETED" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-8 rounded-[2rem] bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-orange-500 rotate-12" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="text-2xl mb-2">✨</div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">
                                {hasReviews ? "Thank you for your feedback!" : "How was your meal?"}
                            </h3>
                            <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
                                {hasReviews 
                                    ? "We appreciate you sharing your thoughts. Hope to see you again soon!" 
                                    : "We'd love to hear what you thought about your order today."}
                            </p>
                            
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className={`mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                    hasReviews 
                                    ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" 
                                    : "bg-orange-500 text-black shadow-lg shadow-orange-500/20 hover:bg-orange-400"
                                }`}
                            >
                                {hasReviews ? "View Review" : "Leave a Review"}
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Items List */}
                <div className="bg-black/20 rounded-3xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-2 border-b border-white/5">Order Details</h3>
                    <div className="space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-black text-orange-500 text-xs">
                                        {item.quantity}
                                    </span>
                                    <span className="font-bold text-gray-300">{item.name}</span>
                                </div>
                                <span className="text-gray-500 font-mono text-sm">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Section */}
                <div className="pt-4">
                    <OrderChat orderId={order.id} />
                </div>
            </motion.div>

            <AnimatePresence>
                {isReviewModalOpen && (
                    <ReviewModal
                        orderId={order.id}
                        items={order.items}
                        customerName={order.customerName}
                        initialReviews={order.reviews}
                        onSuccess={() => {
                            // Fetch latest order data to refresh reviews
                            fetch(`/api/orders/track/${order.chatToken}`).then(res => res.json()).then(setOrder);
                        }}
                        onClose={() => setIsReviewModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
