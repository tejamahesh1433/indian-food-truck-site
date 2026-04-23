"use client";

import { useEffect, useState } from "react";
import OrderStatusActions from "./orders/OrderStatusActions";
import AdminOrderChat from "./orders/AdminOrderChat";
import { Order, OrderItem, PromoCode, OrderStatus } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type OrderWithItems = Order & { items: OrderItem[], promoCode?: PromoCode | null };

function OrderCard({ order, mounted, onStatusUpdate }: { order: OrderWithItems, mounted: boolean, onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void }) {
    return (
        <div className="w-[340px] min-h-[500px] border border-white/10 rounded-2xl bg-zinc-900 overflow-hidden flex flex-col hover:border-white/20 transition-all shadow-xl shrink-0 snap-start">
            {/* Card Header */}
            <div className="bg-black/40 p-4 border-b border-white/5 flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-lg tracking-tight text-white">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest 
                            ${order.status === 'PAID' || order.status === 'PENDING' ? 'bg-red-500/20 text-red-400' :
                              order.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' :
                              order.status === 'READY' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-white/10 text-gray-400'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                    <div className="font-bold text-gray-300 text-sm flex items-center gap-1.5 pt-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {order.customerName}
                    </div>
                    <div className="font-medium text-gray-400 text-[11px] flex items-center gap-1.5 pt-0.5">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {mounted ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "..."}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="text-lg font-bold text-orange-400">${(order.totalAmount / 100).toFixed(2)}</div>
                    {order.promoCode && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                                {order.promoCode.code}
                            </span>
                        </div>
                    )}
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
                    </div>
                </div>
            </div>
            
            {/* Order Details */}
            <div className="p-4 flex-1 space-y-3 bg-zinc-900 border-b border-white/5">
                {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                        <div className="font-black text-gray-400 w-6 shrink-0 text-right">{item.quantity}x</div>
                        <div className="font-semibold text-white break-words">{item.name}</div>
                    </div>
                ))}
            </div>
            
            {/* Call to action row */}
            <div className="p-3 bg-zinc-950 flex flex-col gap-3">
                <div className="w-full">
                    <OrderStatusActions 
                        orderId={order.id} 
                        currentStatus={order.status} 
                        onStatusUpdate={(newStatus) => onStatusUpdate?.(order.id, newStatus)}
                    />
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                   <a 
                        href={`/invoice/${order.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        title="Print Invoice"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Invoice
                    </a>
                    <AdminOrderChat orderId={order.id} />
                </div>
            </div>
        </div>
    );
}

export default function AdminOrdersClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
    const [mounted, setMounted] = useState(false);
    const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
    const [activeTab, setActiveTab] = useState<string>("NEW");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Initialize audio (simple clean notification "Ding")
        const newOrderSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//w==");
        // Note: The above is a placeholder very short click. For a real ding, a longer base64 or public URL is better.
        // Let's use a slightly better sounding short beep/ding URL if possible, or just a more robust base64.
        const bellSound = new Audio("https://cdn.pixabay.com/audio/2022/03/10/audio_c3523a5460.mp3");

        // Keep track of IDs we've already seen to avoid double-dinging on page load
        const seenIds = new Set(initialOrders.map(o => o.id));

        // Heartbeat polling
        const heartbeat = setInterval(async () => {
            try {
                const res = await fetch('/api/admin/orders/live', { cache: 'no-store' });
                if (res.ok) {
                    const freshOrders: OrderWithItems[] = await res.json();
                    
                    // Check for new orders that weren't in the seenIds set
                    const hasNewOrder = freshOrders.some(o => 
                        !seenIds.has(o.id) && (o.status === "PAID" || o.status === "PENDING")
                    );

                    if (hasNewOrder) {
                        bellSound.play().catch(e => console.log("Audio play blocked by browser:", e));
                        // Update seenIds
                        freshOrders.forEach(o => seenIds.add(o.id));
                    }

                    setOrders(freshOrders);
                }
            } catch (err) {
                console.error("Failed to poll live orders", err);
            }
        }, 8000); // 8 seconds heartbeat
        
        return () => clearInterval(heartbeat);
    }, [initialOrders]);

    const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const columns = [
        { 
            id: "NEW", 
            label: "New Orders", 
            statuses: ["PAID", "PENDING"], 
            accent: "bg-red-500", 
            text: "text-red-400" 
        },
        { 
            id: "PREPARING", 
            label: "Preparing", 
            statuses: ["PREPARING"], 
            accent: "bg-blue-500", 
            text: "text-blue-400" 
        },
        { 
            id: "READY", 
            label: "Ready", 
            statuses: ["READY"], 
            accent: "bg-orange-500", 
            text: "text-orange-400" 
        },
    ];

    const currentColumn = columns.find(c => c.id === activeTab) || columns[0];
    const filteredOrders = orders.filter(o => currentColumn.statuses.includes(o.status));

    return (
        <div className="flex flex-col space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 italic tracking-tighter uppercase">
                        <span className="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
                        Orders Control Center
                    </h1>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-[11px] font-black pl-5 flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </span>
                        Live Auto-Refresh Active
                    </p>
                </div>

                {/* Dashboard Quick Stats */}
                <div className="flex gap-4">
                    <Link href="/admin/promo-codes" className="group">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all flex items-center gap-4 min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition">
                                🏷️
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Promo Codes</div>
                                <div className="text-sm font-bold text-white group-hover:text-orange-400 transition">Manage & Track</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Dropdown Filter Navigation */}
                <div className="relative flex justify-center">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        title="Filter orders by status"
                        className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 px-5 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <svg className={`w-4 h-4 transition-colors ${isFilterOpen ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <title>Filter Icon</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Filter By Status:</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${currentColumn.accent}`} />
                                <span className="text-xs font-black uppercase tracking-widest text-white">{currentColumn.label}</span>
                            </div>
                        </div>
                        <svg className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <title>Dropdown Arrow</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[240px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl p-1.5"
                                >
                                    {columns.map((col) => {
                                        const count = orders.filter(o => col.statuses.includes(o.status)).length;
                                        const isActive = activeTab === col.id;
                                        
                                        return (
                                            <button
                                                key={col.id}
                                                onClick={() => {
                                                    setActiveTab(col.id);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                                                    ${isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full ${col.accent} ${isActive ? 'shadow-[0_0_8px_currentColor]' : ''}`} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest">{col.label}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-600'}`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Order Feed Sections */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col min-h-[400px]"
                >
                    {/* Section Header (Optional now, but good for context) */}
                    <div className="flex items-center gap-3 mb-8 pl-2">
                        <div className={`w-3 h-3 rounded-full ${currentColumn.accent} shadow-[0_0_12px_rgba(0,0,0,0.8)]`} />
                        <h2 className="font-black text-2xl tracking-widest uppercase text-white italic">{currentColumn.label} Feed</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                    </div>
                    
                    {/* Order Cards Grid */}
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01] backdrop-blur-sm">
                            <div className={`w-16 h-16 rounded-3xl ${currentColumn.accent} opacity-5 flex items-center justify-center mb-6`}>
                                <svg className={`w-8 h-8 ${currentColumn.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-lg font-bold uppercase tracking-[0.2em] text-gray-500 italic">No {currentColumn.label.toLowerCase()} orders at the moment</p>
                            <p className="text-xs text-gray-600 mt-2 uppercase font-black tracking-widest">Everything is up to date</p>
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory items-stretch hide-scrollbars no-scrollbar">
                            {filteredOrders.map(order => (
                                <motion.div 
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="shrink-0 snap-start"
                                >
                                    <OrderCard order={order} mounted={mounted} onStatusUpdate={handleStatusUpdate} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
