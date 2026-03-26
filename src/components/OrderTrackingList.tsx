"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "@prisma/client";
import OrderChat from "./OrderChat";

interface OrderItem {
    id: string;
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
}

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
export default function OrderTrackingList({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders as Order[]);

    useEffect(() => {
        // Poll for updates every 30 seconds
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch("/api/user/orders", { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    if (orders.length === 0) return null;

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
                                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-2xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                                    <a 
                                        href={`/invoice/${order.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        View Invoice
                                    </a>
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

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <ChatToggle orderId={order.id} />
                            </div>
                        </motion.div>
                    );
                })}
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
