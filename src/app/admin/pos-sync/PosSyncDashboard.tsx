"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PosItem {
    id: string;
    name: string;
    category: string | null;
    priceCents: number;
    isAvailable: boolean;
    inPos: boolean;
    updatedAt: Date | string;
}

interface PosStatus {
    connected: boolean;
    lastConnected?: Date | string;
    lastSyncAt?: Date | string;
    nextSyncAt?: Date | string;
    error?: string;
}

interface SyncLog {
    id: string;
    type: "manual" | "auto" | "webhook";
    status: "success" | "error";
    message: string;
    timestamp: Date;
}

type SortKey = "name" | "category" | "updatedAt" | "price" | "status";
type SortDirection = "asc" | "desc";

export default function PosSyncDashboard({
    initialItems,
    initialStatus
}: {
    initialItems: PosItem[];
    initialStatus: PosStatus;
}) {
    const [mounted, setMounted] = useState(false);
    const [items] = useState<PosItem[]>(initialItems);
    const [status, setStatus] = useState<PosStatus>(initialStatus);
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [syncingItems, setSyncingItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sorting & Filtering State
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
        key: "name", 
        direction: "asc" 
    });
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activePopover, setActivePopover] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.category).filter(Boolean) as string[]);
        return Array.from(cats);
    }, [items]);

    const filteredAndSortedItems = useMemo(() => {
        return [...items]
            .filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = !filterCategory || item.category === filterCategory;
                const matchesStatus = filterStatus === null || item.isAvailable === filterStatus;
                return matchesSearch && matchesCategory && matchesStatus;
            })
            .sort((a, b) => {
                const key = sortConfig.key;
                let valA: string | number = "";
                let valB: string | number = "";
                
                if (key === "name") {
                    valA = a.name;
                    valB = b.name;
                } else if (key === "category") {
                    valA = a.category || "";
                    valB = b.category || "";
                } else if (key === "price") {
                    valA = a.priceCents;
                    valB = b.priceCents;
                } else if (key === "status") {
                    valA = a.isAvailable ? 1 : 0;
                    valB = b.isAvailable ? 1 : 0;
                } else if (key === "updatedAt") {
                    valA = new Date(a.updatedAt).getTime();
                    valB = new Date(b.updatedAt).getTime();
                }

                if (sortConfig.direction === "asc") {
                    return valA > valB ? 1 : -1;
                } else {
                    return valA < valB ? 1 : -1;
                }
            });
    }, [items, searchQuery, filterCategory, filterStatus, sortConfig]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/pos/sync");
            const data = await res.json();
            if (data.success) {
                setStatus(data.status);
            }
        } catch {
            console.error("Failed to fetch POS status");
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/pos/sync", { method: "POST" });
            const data = await res.json();
            
            if (data.success) {
                showToast("Manual sync complete", "success");
                setStatus(data.status);
                addLog("manual", "success", "All menu items synchronized successfully.");
            } else {
                showToast(data.error || "Sync failed", "error");
                addLog("manual", "error", data.message || "Manual sync failed.");
            }
        } catch (_err) {
            showToast("Network error during sync", _err instanceof Error ? "error" : "error");
            addLog("manual", "error", "Connection timed out.");
        } finally {
            setIsSyncing(false);
        }
    };
    const handleItemSync = async (id: string, name: string) => {
        setSyncingItems(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/admin/pos/items/${id}`, { method: "POST" });
            const data = await res.json();
            
            if (data.success) {
                showToast(`Synced ${name} to POS`, "success");
                setStatus(data.status);
                addLog("manual", "success", `Successfully synced "${name}" to POS.`);
            } else {
                showToast(data.error || "Item sync failed", "error");
                addLog("manual", "error", `Failed to sync "${name}": ${data.message}`);
            }
        } catch {
            showToast("Network error during item sync", "error");
            addLog("manual", "error", `Network error syncing "${name}".`);
        } finally {
            setSyncingItems(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };
    const addLog = (type: SyncLog["type"], status: SyncLog["status"], message: string) => {
        const newLog: SyncLog = {
            id: Math.random().toString(36).substring(7),
            type,
            status,
            message,
            timestamp: new Date(),
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "Never";
        if (!mounted) return "Loading...";
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="min-h-full bg-black text-white selection:bg-orange-500/30 font-sans">
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${
                            toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${toast.type === "error" ? "bg-red-400" : "bg-green-400"} animate-pulse`} />
                        <span className="text-sm font-medium tracking-wide">{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2 mb-4 group">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                        </Link>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent"
                    >
                        POS Synchronization
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 mt-2 max-w-xl"
                    >
                        Manage real-time menu and order sync between your website and POS kitchen display.
                    </motion.p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManualSync}
                    disabled={isSyncing || !status.connected}
                    className="relative group overflow-hidden px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm uppercase tracking-widest transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {isSyncing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Syncing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Sync Now
                            </>
                        )}
                    </span>
                </motion.button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Status Card */}
                <StatusCard 
                    label="Connection Health" 
                    value={status.connected ? "Live" : "Offline"} 
                    subValue={status.connected ? "Mock POS Adapter Active" : (status.error || "Disconnected")}
                    icon={<div className={`w-3 h-3 rounded-full ${status.connected ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-red-500"} animate-pulse`} />}
                    color={status.connected ? "green" : "red"}
                    delay={0}
                />
                
                {/* Last Sync Card */}
                <StatusCard 
                    label="Last Bulk Sync" 
                    value={formatDate(status.lastSyncAt)} 
                    subValue="Website → POS Kitchen"
                    icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="blue"
                    delay={0.1}
                />

                {/* Next Sync Card */}
                <StatusCard 
                    label="Auto-Sync Status" 
                    value="Active" 
                    subValue={`Interval: 30s • Next: ${formatDate(status.nextSyncAt)}`}
                    icon={<svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    color="orange"
                    delay={0.2}
                />

                {/* Items Card */}
                <StatusCard 
                    label="Synced Content" 
                    value={`${items.length} Items`} 
                    subValue="Marked for POS Display"
                    icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    color="purple"
                    delay={0.3}
                />
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Sync Feed */}
                <div className="flex-1">
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <span className="w-2 h-6 bg-orange-500 rounded-full" />
                                Active Items in POS
                            </h2>
                            {filterCategory || searchQuery || filterStatus !== null ? (
                                <button 
                                    onClick={() => { setFilterCategory(null); setSearchQuery(""); setFilterStatus(null); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            ) : null}
                        </div>
                        
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 relative">
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActivePopover(activePopover === 'name' ? null : 'name')}>
                                                <span className="text-xs uppercase tracking-widest text-gray-500 font-black group-hover:text-gray-300 transition-colors">Item Name</span>
                                                <FilterIcon active={!!searchQuery || sortConfig.key === 'name'} />
                                            </div>
                                            <FilterPopover 
                                                isOpen={activePopover === 'name'} 
                                                onClose={() => setActivePopover(null)}
                                            >
                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Search</label>
                                                        <input 
                                                            type="text" 
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            placeholder="Filter by name..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50 transition-colors"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Sort</label>
                                                        <SortButton 
                                                            active={sortConfig.key === 'name' && sortConfig.direction === 'asc'}
                                                            onClick={() => setSortConfig({ key: 'name', direction: 'asc' })}
                                                            label="Alphabetical A-Z"
                                                        />
                                                        <SortButton 
                                                            active={sortConfig.key === 'name' && sortConfig.direction === 'desc'}
                                                            onClick={() => setSortConfig({ key: 'name', direction: 'desc' })}
                                                            label="Alphabetical Z-A"
                                                        />
                                                        <SortButton 
                                                            active={sortConfig.key === 'updatedAt'}
                                                            onClick={() => setSortConfig({ key: 'updatedAt', direction: 'desc' })}
                                                            label="Most Recently Updated"
                                                        />
                                                    </div>
                                                </div>
                                            </FilterPopover>
                                        </th>
                                        <th className="pb-4 relative">
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActivePopover(activePopover === 'category' ? null : 'category')}>
                                                <span className="text-xs uppercase tracking-widest text-gray-500 font-black group-hover:text-gray-300 transition-colors">Category</span>
                                                <FilterIcon active={!!filterCategory} />
                                            </div>
                                            <FilterPopover 
                                                isOpen={activePopover === 'category'} 
                                                onClose={() => setActivePopover(null)}
                                            >
                                                <div className="p-4 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Select Category</label>
                                                    <SortButton 
                                                        active={filterCategory === null}
                                                        onClick={() => setFilterCategory(null)}
                                                        label="All Categories"
                                                    />
                                                    {categories.map(cat => (
                                                        <SortButton 
                                                            key={cat}
                                                            active={filterCategory === cat}
                                                            onClick={() => setFilterCategory(cat)}
                                                            label={cat}
                                                        />
                                                    ))}
                                                </div>
                                            </FilterPopover>
                                        </th>
                                        <th className="pb-4 relative">
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActivePopover(activePopover === 'price' ? null : 'price')}>
                                                <span className="text-xs uppercase tracking-widest text-gray-500 font-black group-hover:text-gray-300 transition-colors">Price</span>
                                                <FilterIcon active={sortConfig.key === 'price'} />
                                            </div>
                                            <FilterPopover 
                                                isOpen={activePopover === 'price'} 
                                                onClose={() => setActivePopover(null)}
                                            >
                                                <div className="p-4 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Sort By Price</label>
                                                    <SortButton 
                                                        active={sortConfig.key === 'price' && sortConfig.direction === 'asc'}
                                                        onClick={() => setSortConfig({ key: 'price', direction: 'asc' })}
                                                        label="Lowest to Highest"
                                                    />
                                                    <SortButton 
                                                        active={sortConfig.key === 'price' && sortConfig.direction === 'desc'}
                                                        onClick={() => setSortConfig({ key: 'price', direction: 'desc' })}
                                                        label="Highest to Lowest"
                                                    />
                                                </div>
                                            </FilterPopover>
                                        </th>
                                        <th className="pb-4 relative">
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActivePopover(activePopover === 'status' ? null : 'status')}>
                                                <span className="text-xs uppercase tracking-widest text-gray-500 font-black group-hover:text-gray-300 transition-colors">Live Status</span>
                                                <FilterIcon active={filterStatus !== null || sortConfig.key === 'status'} />
                                            </div>
                                            <FilterPopover 
                                                isOpen={activePopover === 'status'} 
                                                onClose={() => setActivePopover(null)}
                                            >
                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Filter Availability</label>
                                                        <div className="space-y-1">
                                                            <SortButton 
                                                                active={filterStatus === null}
                                                                onClick={() => setFilterStatus(null)}
                                                                label="All Items"
                                                            />
                                                            <SortButton 
                                                                active={filterStatus === true}
                                                                onClick={() => setFilterStatus(true)}
                                                                label="Available Only"
                                                            />
                                                            <SortButton 
                                                                active={filterStatus === false}
                                                                onClick={() => setFilterStatus(false)}
                                                                label="Sold Out Only"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Sort</label>
                                                        <SortButton 
                                                            active={sortConfig.key === 'status'}
                                                            onClick={() => setSortConfig({ key: 'status', direction: 'desc' })}
                                                            label="By Availability"
                                                        />
                                                    </div>
                                                </div>
                                            </FilterPopover>
                                        </th>
                                        <th className="pb-4 text-xs uppercase tracking-widest text-gray-500 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredAndSortedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-500 italic">
                                                {items.length === 0 ? (
                                                    <>No items marked for POS. Update them in <Link href="/admin/menu-items" className="text-orange-400 hover:underline">Menu Management</Link>.</>
                                                ) : (
                                                    <>No items match your active filters.</>
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAndSortedItems.map((item, idx) => (
                                            <motion.tr 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                                className="group hover:bg-white/5 transition-colors"
                                            >
                                                <td className="py-5 pr-4 font-medium text-sm">{item.name}</td>
                                                <td className="py-5 pr-4">
                                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                                        {item.category || "General"}
                                                    </span>
                                                </td>
                                                <td className="py-5 pr-4 font-mono text-sm">${(item.priceCents / 100).toFixed(2)}</td>
                                                <td className="py-5 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${item.isAvailable ? "text-green-500" : "text-red-400"}`}>
                                                            {item.isAvailable ? "Available" : "Sold Out"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-right space-x-3">
                                                    <button 
                                                        disabled={syncingItems.has(item.id) || isSyncing}
                                                        onClick={() => handleItemSync(item.id, item.name)}
                                                        title="Sync individual item"
                                                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition disabled:opacity-50 group-hover:opacity-100"
                                                    >
                                                        {syncingItems.has(item.id) ? (
                                                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>


                {/* Sidebar Logs */}
                <div className="w-full xl:w-96 space-y-6">
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative h-full max-h-[600px] flex flex-col">
                        <div className="shrink-0 mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center justify-between">
                                System Logs
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] rounded-full tracking-normal font-bold">Session Feed</span>
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="py-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest h-full flex items-center justify-center">
                                    Waiting for events...
                                </div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === "success" ? "text-green-500" : "text-red-400"}`}>
                                                {log.type} • {log.status}
                                            </span>
                                            <span className="text-[9px] font-mono text-gray-600">{formatDate(log.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">{log.message}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 shrink-0">
                            <p className="text-[10px] text-gray-600 leading-relaxed italic">
                                Note: Logs are temporary and reset on page refresh. Persistent logging can be enabled in Site Settings.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, value, subValue, icon, color, delay }: {
    label: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    color: "green" | "blue" | "red" | "orange" | "purple";
    delay: number;
}) {
    const accents = {
        green: "border-green-500/10 hover:border-green-500/30 shadow-green-900/10",
        blue: "border-blue-500/10 hover:border-blue-500/30 shadow-blue-900/10",
        red: "border-red-500/10 hover:border-red-500/30 shadow-red-900/10",
        orange: "border-orange-500/10 hover:border-orange-500/30 shadow-orange-900/10",
        purple: "border-purple-500/10 hover:border-purple-500/30 shadow-purple-900/10",
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-6 bg-white/5 border rounded-3xl backdrop-blur-sm transition-all shadow-xl group cursor-default ${accents[color]}`}
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                    {label}
                </span>
                <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform">{value}</div>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{subValue}</div>
        </motion.div>
    );
}

function FilterIcon({ active }: { active: boolean }) {
    return (
        <svg 
            className={`w-3 h-3 transition-colors ${active ? "text-orange-500" : "text-gray-600 group-hover:text-gray-400"}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
    );
}

function FilterPopover({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 z-50 w-64 bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SortButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between group ${
                active ? "bg-orange-500/10 text-orange-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
        >
            {label}
            {active && <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
        </button>
    );
}
