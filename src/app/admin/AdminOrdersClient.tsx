"use client";

import { useEffect, useState } from "react";
import OrderStatusActions from "./orders/OrderStatusActions";
import AdminOrderChat from "./orders/AdminOrderChat";
import { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

function OrderCard({ order }: { order: OrderWithItems }) {
    return (
        <div className="border border-white/10 rounded-2xl bg-zinc-900 overflow-hidden flex flex-col hover:border-white/20 transition-all shadow-xl shrink-0">
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
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="text-lg font-bold text-orange-400">${(order.totalAmount / 100).toFixed(2)}</div>
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
                    <OrderStatusActions orderId={order.id} currentStatus={order.status} />
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
    const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);

    useEffect(() => {
        // Heartbeat polling: direct client fetch to completely bypass aggressive Next.js routing cache
        const heartbeat = setInterval(async () => {
            try {
                const res = await fetch('/api/admin/orders/live', { cache: 'no-store' });
                if (res.ok) {
                    const freshOrders = await res.json();
                    setOrders(freshOrders);
                }
            } catch (err) {
                console.error("Failed to poll live orders", err);
            }
        }, 8000); // 8 seconds heartbeat
        
        return () => clearInterval(heartbeat);
    }, []);

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

    return (
        <div className="flex flex-col space-y-8 pb-12">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
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
            </div>

            {/* Order Feed Sections */}
            <div className="space-y-10">
                {columns.map((col) => {
                    const colOrders = orders.filter((o) => col.statuses.includes(o.status));
                    
                    return (
                        <div key={col.id} className="w-full flex flex-col">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-3 h-3 rounded-full ${col.accent} shadow-[0_0_12px_rgba(0,0,0,0.8)]`} />
                                <h2 className="font-black text-xl tracking-widest uppercase text-white">{col.label}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-black bg-white/10 ${col.text}`}>
                                    {colOrders.length}
                                </span>
                            </div>
                            
                            {/* Order Cards Grid */}
                            {colOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500">No {col.label.toLowerCase()} orders</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 items-stretch">
                                    {colOrders.map(order => <OrderCard key={order.id} order={order} />)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
