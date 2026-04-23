"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import OrderStatusActions from "./OrderStatusActions";
import AdminOrderChat from "./AdminOrderChat";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    items: any[];
}

interface FilterResponse {
    orders: Order[];
    totalCount: number;
    totalPages: number;
    page: number;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(30);

    // Filter states
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch orders with filters
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                ...(statusFilter !== "ALL" && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
            });

            const response = await fetch(`/api/admin/orders/filtered?${params}`);
            if (!response.ok) throw new Error("Failed to fetch orders");

            const data: FilterResponse = await response.json();
            setOrders(data.orders);
            setTotalCount(data.totalCount);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchTerm, dateFrom, dateTo]);

    // Auto-refresh effect
    useEffect(() => {
        fetchOrders();
        setCountdown(30);

        if (!autoRefresh) return;

        const refreshInterval = setInterval(() => {
            fetchOrders();
            setCountdown(30);
        }, REFRESH_INTERVAL);

        return () => clearInterval(refreshInterval);
    }, [fetchOrders, autoRefresh]);

    // Countdown effect
    useEffect(() => {
        if (!autoRefresh || countdown === 0) return;

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [autoRefresh, countdown]);

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleDateChange = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        setPage(1);
    };

    const statusColors: Record<OrderStatus, string> = {
        PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        PAID: "bg-green-500/10 text-green-400 border-green-500/20",
        PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const statuses: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/admin" className="text-orange-500 hover:underline text-sm mb-2 inline-block font-bold uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Kitchen Display</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-medium">
                        {autoRefresh ? (
                            <>
                                🔄 Next refresh in{" "}
                                <span className={`font-black ${countdown <= 5 ? "text-orange-400" : "text-green-400"}`}>
                                    {countdown}s
                                </span>
                            </>
                        ) : (
                            "⏸ Manual mode"
                        )}{" "}
                        • {totalCount} total orders
                    </p>
                </div>
                <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest transition ${
                        autoRefresh
                            ? "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                            : "bg-gray-500/20 border border-gray-500/40 text-gray-400 hover:bg-gray-500/30"
                    }`}
                >
                    {autoRefresh ? "🔄 Auto" : "⏸ Manual"}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="space-y-4 mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                {/* Status Filter Dropdown */}
                <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Filter by Status</label>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        title="Open status filter menu"
                        className="flex items-center justify-between w-full md:w-64 bg-white/10 border border-white/20 p-2.5 px-4 rounded-xl hover:bg-white/15 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <svg className={`w-4 h-4 transition-colors ${isFilterOpen ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <title>Filter Icon</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-widest text-white">
                                {statusFilter === "ALL" ? `All Orders (${totalCount})` : statusFilter}
                            </span>
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
                                    className="absolute top-full mt-2 left-0 w-full md:w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl p-1.5"
                                >
                                    <button
                                        onClick={() => {
                                            handleStatusChange("ALL");
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 text-left
                                            ${statusFilter === "ALL" ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">All Orders</span>
                                        <span className="text-[10px] opacity-50">{totalCount}</span>
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    {statuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                handleStatusChange(status);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left
                                                ${statusFilter === status ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search */}
                <div>
                    <label htmlFor="order-search" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Search by Name, Email, Phone, or Order ID</label>
                    <input
                        id="order-search"
                        type="text"
                        placeholder="e.g., John Doe, john@example.com, 555-1234, abc123"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/40"
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date-from" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">From Date</label>
                        <input
                            id="date-from"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateChange(e.target.value, dateTo)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500/40"
                        />
                    </div>
                    <div>
                        <label htmlFor="date-to" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">To Date</label>
                        <input
                            id="date-to"
                            type="date"
                            value={dateTo}
                            onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500/40"
                        />
                    </div>
                </div>

                {/* Clear Filters */}
                {(statusFilter !== "ALL" || searchTerm || dateFrom || dateTo) && (
                    <button
                        onClick={() => {
                            handleStatusChange("ALL");
                            handleSearch("");
                            handleDateChange("", "");
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300"
                    >
                        ✕ Clear All Filters
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin">
                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Orders List */}
            {!loading && (
                <>
                    {orders.length === 0 ? (
                        <div className="p-12 text-center border border-white/10 rounded-3xl bg-white/5">
                            <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">No orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-white/10 rounded-3xl bg-white/5 p-8 hover:bg-white/10 transition group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                                        <div className="text-3xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                                        <a
                                            href={`/invoice/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
                                        >
                                            📄 Invoice
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 mb-6">
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Order ID</p>
                                            <p className="text-white font-bold">{order.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Customer</p>
                                            <p className="text-white font-bold">{order.customerName}</p>
                                            <p className="text-xs text-gray-400">{order.customerPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Time</p>
                                            <p className="text-white font-bold">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-6 space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-300">{item.quantity}x {item.name}</span>
                                                {item.notes && <span className="text-orange-400 italic">{item.notes}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${statusColors[order.status]}`}>
                                            {order.status}
                                        </div>
                                        <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                                    </div>

                                    {/* Chat */}
                                    {order.id && <AdminOrderChat orderId={order.id} />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                            >
                                ← Previous
                            </button>
                            <span className="text-white font-bold">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
