"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderChat from "@/components/OrderChat";

export default function AdminOrderChat({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-4 border-t border-white/5 pt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isOpen ? "text-orange-500" : "text-gray-500 hover:text-white"
                    }`}
            >
                <svg className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {isOpen ? "Hide Chat" : "Chat with Customer"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4"
                    >
                        <OrderChat orderId={orderId} isAdmin={true} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
