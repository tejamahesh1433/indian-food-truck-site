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
        <select
            defaultValue={currentStatus}
            onChange={handleChange}
            disabled={loading}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500 disabled:opacity-50"
        >
            {Object.values(OrderStatus).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );
}
