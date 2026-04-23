"use client";

import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "./actions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function OrderStatusActions({
    orderId,
    currentStatus,
    onStatusUpdate
}: {
    orderId: string;
    currentStatus: OrderStatus;
    onStatusUpdate?: (newStatus: OrderStatus) => void;
}) {
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (newStatus: OrderStatus) => {
        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus);
            if (onStatusUpdate) onStatusUpdate(newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update order status.");
        } finally {
            setLoading(false);
        }
    };

    const renderActionButtons = () => {
        switch (currentStatus) {
            case "PENDING":
                return (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 italic">
                            Waiting for Payment
                        </span>
                    </div>
                );
            case "PAID":
                return (
                    <button
                        onClick={() => handleUpdate("PREPARING")}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        Start Preparing
                    </button>
                );
            case "PREPARING":
                return (
                    <button
                        onClick={() => handleUpdate("READY")}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        Mark Ready for Pickup
                    </button>
                );
            case "READY":
                return (
                    <button
                        onClick={() => handleUpdate("COMPLETED")}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        Complete Order
                    </button>
                );
            default:
                return null;
        }
    };

    const isActive = currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED";

    if (!isActive) {
        return (
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/5 rounded-xl bg-white/5 italic">
                Order {currentStatus}
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStatus}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                >
                    {renderActionButtons()}

                    <button
                        onClick={async () => {
                            const ok = await confirm({ title: "Cancel Order", message: "Are you sure you want to cancel this order? This cannot be undone.", confirmLabel: "Cancel Order", variant: "danger" });
                            if (ok) handleUpdate("CANCELLED");
                        }}
                        disabled={loading}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition active:scale-95 disabled:opacity-50 italic"
                    >
                        Cancel
                    </button>
                </motion.div>
            </AnimatePresence>

            {loading && (
                <svg className="animate-spin h-4 w-4 text-orange-500 ml-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
        </div>
    );
}
