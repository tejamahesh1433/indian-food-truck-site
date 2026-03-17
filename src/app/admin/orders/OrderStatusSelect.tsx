"use client";

import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "./actions";
import { useState } from "react";

export default function OrderStatusSelect({
    orderId,
    currentStatus
}: {
    orderId: string;
    currentStatus: OrderStatus
}) {
    const [loading, setLoading] = useState(false);

    const statusColors: Record<OrderStatus, string> = {
        PENDING: "text-gray-400",
        PAID: "text-green-400",
        PREPARING: "text-blue-400",
        READY: "text-orange-400",
        COMPLETED: "text-purple-400",
        CANCELLED: "text-red-400",
    };

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderStatus;
        if (newStatus === currentStatus) return;

        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <select
                title="Order status"
                aria-label="Order status"
                value={currentStatus}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none bg-black/60 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-orange-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${statusColors[currentStatus]}`}
            >
                {Object.values(OrderStatus).map(s => (
                    <option key={s} value={s} className="bg-[#1a1a1a] text-white uppercase">{s}</option>
                ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                {loading ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
        </div>
    );
}
