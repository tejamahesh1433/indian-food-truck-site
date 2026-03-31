"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "@prisma/client";
import OrderChat from "./OrderChat";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import ReviewModal from "./ReviewModal";

interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    priceCents: number;
}

interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
    customerName: string;
    reviews?: { 
        id: string;
        rating: number;
        text: string;
        menuItemId: string;
        createdAt: string;
    }[];
}

const statusSteps = ["PAID", "PREPARING", "READY"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OrderTrackingList({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders as Order[]);
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

    const refreshOrders = async () => {
        try {
            const res = await fetch("/api/user/orders", { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error("Polling error:", err);
        }
    };

    useEffect(() => {
        // Poll for updates every 15 seconds for near real-time order tracking
        const pollInterval = setInterval(refreshOrders, 15000);
        return () => clearInterval(pollInterval);
    }, []);

    // Refresh component every second to ensure the 15s cancel window is accurate in the UI
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order? If you have already paid, a full refund will be automatically initiated to your original payment method.")) {
            return;
        }

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Order cancelled successfully. Refund initiated if applicable.");
                // Immediately update local state
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" as OrderStatus } : o));
            } else {
                toast.error(data.error || "Failed to cancel order.");
            }
        } catch (err) {
            console.error("Cancel error:", err);
            toast.error("An unexpected error occurred while trying to cancel the order.");
        }
    };

    if (orders.length === 0) return null;

    const statusColors: Record<OrderStatus, string> = {
        PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        PAID: "bg-green-500/10 text-green-400 border-green-500/20",
        PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
                {orders.map((order) => {
                    const currentStepIndex = statusSteps.indexOf(order.status);

                    return (
                        <motion.div
                            layout
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition group"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-black text-xl italic tracking-tighter text-white">#{order.id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-2xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                                    <div className="flex items-center gap-2">
                                        {order.status === "COMPLETED" && (!order.reviews || order.reviews.length === 0) && (
                                            <button
                                                onClick={() => setReviewingOrder(order)}
                                                className="text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/30 text-orange-400 hover:text-white hover:bg-orange-600 transition flex items-center gap-1.5"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Review
                                            </button>
                                        )}
                                        {order.status === "COMPLETED" && order.reviews && order.reviews.length > 0 && (
                                            <button
                                                onClick={() => setReviewingOrder(order)}
                                                className="text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full bg-green-600/10 border border-green-500/30 text-green-500 hover:text-white hover:bg-green-600 transition flex items-center gap-1.5"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Review
                                            </button>
                                        )}
                                        <a
                                            href={`/invoice/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Order Invoice"
                                            className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </a>
                                    </div>

                                    {/* Cancel Button - Only visible for 15 seconds after creation */}
                                    {order.status !== "CANCELLED" && (now - new Date(order.createdAt).getTime() < 15000) && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition flex items-center gap-1.5"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Tracker */}
                            {["PAID", "PREPARING", "READY"].includes(order.status) && (
                                <div className="mb-8 px-2">
                                    <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`
                                            }}
                                            transition={{ duration: 1, ease: "circOut" }}
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        {statusSteps.map((step, idx) => (
                                            <div key={step} className="flex flex-col items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${idx <= currentStepIndex ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/10'}`} />
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${idx <= currentStepIndex ? 'text-white' : 'text-gray-600'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-orange-500 italic text-[10px]">{item.quantity}x</span>
                                            <span className="font-bold text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-mono font-bold">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {order.status === "READY" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-orange-500 text-black rounded-xl text-center font-black uppercase tracking-widest text-[10px]"
                                >
                                    Your order is ready for pickup! 🎊
                                </motion.div>
                            )}

                            {/* Reorder button */}
                            {["COMPLETED", "CANCELLED"].includes(order.status) && (
                                <button
                                    onClick={() => {
                                        for (const item of order.items) {
                                            for (let i = 0; i < item.quantity; i++) {
                                                addToCart({
                                                    id: item.menuItemId,
                                                    name: item.name,
                                                    priceCents: item.priceCents,
                                                });
                                            }
                                        }
                                        toast.success(`${order.items.length} item${order.items.length > 1 ? "s" : ""} added to cart!`);
                                    }}
                                    className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition group"
                                >
                                    <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reorder
                                </button>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <ChatToggle orderId={order.id} />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <AnimatePresence>
                {reviewingOrder && (
                    <ReviewModal
                        orderId={reviewingOrder.id}
                        items={reviewingOrder.items}
                        customerName={reviewingOrder.customerName}
                        initialReviews={reviewingOrder.reviews}
                        onSuccess={refreshOrders}
                        onClose={() => setReviewingOrder(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ChatToggle({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isOpen ? "text-orange-500" : "text-gray-500 hover:text-white"
                    }`}
            >
                <svg className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {isOpen ? "Close Chat" : "Chat with Kitchen"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <OrderChat orderId={orderId} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
