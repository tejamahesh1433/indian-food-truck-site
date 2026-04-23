"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PromoCode = {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    maxUsage: number | null;
    currentUsage: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
};

export default function PromoCodesClient() {
    const [mounted, setMounted] = useState(false);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");

    const [newPromo, setNewPromo] = useState({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "10",
        minOrderAmount: "0",
        maxDiscountAmount: "",
        maxUsage: "",
        expiresAt: "",
    });

    useEffect(() => {
        setMounted(true);
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch("/api/admin/promo-codes");
            const data = await res.json();
            setPromoCodes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError("");

        if (Number(newPromo.discountValue) < 0 || Number(newPromo.minOrderAmount) < 0) {
            setError("Values cannot be negative");
            setIsCreating(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/promo-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newPromo,
                    discountValue: Number(newPromo.discountValue),
                    minOrderAmount: Math.round(Number(newPromo.minOrderAmount) * 100), // to cents
                    maxDiscountAmount: newPromo.maxDiscountAmount ? Math.round(Number(newPromo.maxDiscountAmount) * 100) : null,
                    maxUsage: newPromo.maxUsage ? Number(newPromo.maxUsage) : null,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create promo code");
            }
            await fetchPromoCodes();
            setNewPromo({
                code: "",
                description: "",
                discountType: "PERCENTAGE",
                discountValue: "10",
                minOrderAmount: "0",
                maxDiscountAmount: "",
                maxUsage: "",
                expiresAt: "",
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promo code?")) return;
        try {
            await fetch("/api/admin/promo-codes/" + id, { method: "DELETE" });
            setPromoCodes(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await fetch("/api/admin/promo-codes/" + id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current }),
            });
            setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
        } catch (err) {
            console.error(err);
        }
    };

    const statsCards = [
        { label: "Total Codes", value: promoCodes.length, icon: "🏷️", color: "text-blue-400" },
        { label: "Active Now", value: promoCodes.filter(p => p.isActive).length, icon: "🟢", color: "text-green-400" },
        { label: "Total Uses", value: promoCodes.reduce((acc, p) => acc + p.currentUsage, 0), icon: "📈", color: "text-orange-400" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Promo Codes</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage discounts and rewards</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statsCards.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4"
                    >
                        <div className="text-2xl">{stat.icon}</div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{stat.label}</div>
                            <div className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sticky top-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6">Create New</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Code</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="TRUCK10"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition uppercase"
                                    value={newPromo.code}
                                    onChange={e => setNewPromo({ ...newPromo, code: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Type</label>
                                    <select
                                        title="Discount Type"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                        value={newPromo.discountType}
                                        onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value as any })}
                                    >
                                        <option value="PERCENTAGE">% Off</option>
                                        <option value="FIXED">$ Off</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Value</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            title="Discount Value"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                            value={newPromo.discountValue}
                                            onChange={e => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                                        />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Min Order ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    title="Minimum Order Amount"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                    value={newPromo.minOrderAmount}
                                    onChange={e => setNewPromo({ ...newPromo, minOrderAmount: e.target.value })}
                                />
                            </div>

                            {newPromo.discountType === "PERCENTAGE" && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Max Discount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="No limit"
                                        title="Maximum Discount Amount"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                        value={newPromo.maxDiscountAmount}
                                        onChange={e => setNewPromo({ ...newPromo, maxDiscountAmount: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Max Uses (Optional)</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    title="Maximum Uses"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                    value={newPromo.maxUsage}
                                    onChange={e => setNewPromo({ ...newPromo, maxUsage: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    title="Expiry Date"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition"
                                    value={newPromo.expiresAt}
                                    onChange={e => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                                />
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 px-1">{error}</p>
                            )}

                            <button
                                disabled={isCreating}
                                type="submit"
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? "Creating..." : "Create Promo Code"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                        </div>
                    ) : promoCodes.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center">
                            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">No promo codes found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {promoCodes.map((promo) => (
                                <motion.div
                                    layout
                                    key={promo.id}
                                    className={`bg-white/5 border rounded-3xl p-6 transition-all ${promo.isActive ? 'border-white/10' : 'border-white/5 opacity-60'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic ${promo.isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/10 text-gray-500'}`}>
                                                🏷️
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black italic uppercase tracking-tight text-white">{promo.code}</h3>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {promo.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `$${(promo.discountValue / 100).toFixed(2)} OFF`}
                                                    {promo.minOrderAmount > 0 && ` • Min $${(promo.minOrderAmount / 100).toFixed(2)}`}
                                                    {promo.maxDiscountAmount && ` • Max $${(promo.maxDiscountAmount / 100).toFixed(2)}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(promo.id, promo.isActive)}
                                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition text-gray-400 hover:text-white"
                                                title={promo.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {promo.isActive ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition text-red-400"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Usage</p>
                                            <p className="text-xs font-bold text-white">
                                                {promo.currentUsage} / {promo.maxUsage || '∞'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Expires</p>
                                            <p className="text-xs font-bold text-white">
                                                {mounted && promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : (mounted ? 'Never' : '...')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Created</p>
                                            <p className="text-xs font-bold text-white">
                                                {mounted ? new Date(promo.createdAt).toLocaleDateString() : '...'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
