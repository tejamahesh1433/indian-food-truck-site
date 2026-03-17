"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "@prisma/client";
import OrderChat from "@/components/OrderChat";

const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusSteps = ["PAID", "PREPARING", "READY"];

export default function OrderTrackingCard({ order: initialOrder }: { order: any }) {
    const [order, setOrder] = useState(initialOrder);

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

    return (
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
                            Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {/* Items List */}
            <div className="bg-black/20 rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 pb-2 border-b border-white/5">Order Details</h3>
                <div className="space-y-3">
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
    );
}
