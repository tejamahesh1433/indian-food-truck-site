"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MenuItem = {
    id: string;
    name: string;
    category: string;
    priceCents: number;
    description: string;
    isVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
    inPos: boolean;
    sortOrder: number;
    imageUrl: string | null;
};

const CATEGORIES = ["Starters", "Mains", "Wraps", "Drinks", "Dessert"] as const;

function money(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminMenuItemsPage() {
    // form state
    const [name, setName] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [category, setCategory] = useState<any>("Starters");
    const [price, setPrice] = useState<string>("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isVeg, setIsVeg] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const [isPopular, setIsPopular] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [inPos, setInPos] = useState(true);

    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // list state
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [q, setQ] = useState("");
    const [fCategory, setFCategory] = useState<string>("All");
    const [fVeg, setFVeg] = useState(false);
    const [fSpicy, setFSpicy] = useState(false);
    const [fPopular, setFPopular] = useState(false);
    const [fAvailability, setFAvailability] = useState<"all" | "available" | "unavailable">("all");

    // editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<Partial<MenuItem>>({});

    // sorting
    const [sortBy, setSortBy] = useState<"updatedAt" | "priceCents" | "name" | "sortOrder">("sortOrder");

    async function fetchItems() {
        setLoading(true);
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (fCategory !== "All") params.set("category", fCategory);
        if (fVeg) params.set("veg", "1");
        if (fSpicy) params.set("spicy", "1");
        if (fPopular) params.set("popular", "1");
        if (fAvailability === "available") params.set("available", "1");
        if (fAvailability === "unavailable") params.set("available", "0");
        params.set("orderBy", sortBy);

        const res = await fetch(`/api/admin/menu-items?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setItems(data.items ?? []);
        setLoading(false);
    }

    useEffect(() => {
        (async () => {
            await fetchItems();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchItems(), 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, fCategory, fVeg, fSpicy, fPopular, fAvailability, sortBy]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (q) count++;
        if (fCategory !== "All") count++;
        if (fVeg) count++;
        if (fSpicy) count++;
        if (fPopular) count++;
        if (fAvailability !== "all") count++;
        return count;
    }, [q, fCategory, fVeg, fSpicy, fPopular, fAvailability]);

    function resetFilters() {
        setQ("");
        setFCategory("All");
        setFVeg(false);
        setFSpicy(false);
        setFPopular(false);
        setFAvailability("all");
        setSortBy("sortOrder");
    }

    const totals = useMemo(() => {
        const total = items.length;
        const available = items.filter((i) => i.isAvailable).length;
        return { total, available };
    }, [items]);

    async function addItem(e: React.FormEvent) {
        e.preventDefault();

        const p = Number(price);
        if (!name.trim()) return showToast("Name is required", "error");
        if (!Number.isFinite(p) || p < 0) return showToast("Price must be a number >= 0", "error");

        setIsSaving(true);
        const res = await fetch("/api/admin/menu-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                category,
                price: p,
                description,
                imageUrl,
                isVeg,
                isSpicy,
                isPopular,
                isAvailable,
                inPos,
            }),
        });

        const data = await res.json();
        setIsSaving(false);
        if (!data.ok) return showToast(data.error || "Failed to add item", "error");

        showToast("Item added successfully!", "success");

        // reset
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setIsVeg(false);
        setIsSpicy(false);
        setIsPopular(false);
        setIsAvailable(true);
        setInPos(true);

        fetchItems();
    }

    function showToast(msg: string, type: "success" | "error" = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    function beginEdit(item: MenuItem) {
        setEditingId(item.id);
        setEditDraft({
            name: item.name,
            category: item.category,
            description: item.description,
            imageUrl: item.imageUrl,
            priceCents: item.priceCents,
            isVeg: item.isVeg,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            isAvailable: item.isAvailable,
            inPos: item.inPos,
        });
    }

    async function saveEdit(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = { ...editDraft };

        // convert cents -> dollars field if user changed price via input
        if (typeof payload.priceCents === "number") {
            payload.price = payload.priceCents / 100;
            delete payload.priceCents;
        }

        const res = await fetch(`/api/admin/menu-items/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.ok) return showToast(data.error || "Failed to update item", "error");

        showToast("Item updated successfully!", "success");
        setEditingId(null);
        setEditDraft({});
        fetchItems();
    }

    async function removeItem(id: string) {
        const perform = window.confirm("Delete this menu item entirely? This action cannot be reversed.");
        if (!perform) return;
        const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.ok) return showToast(data.error || "Failed to delete item", "error");

        showToast("Item deleted", "success");
        setEditingId(null);
        fetchItems();
    }

    async function duplicateItem() {
        if (!editDraft) return;
        setIsSaving(true);
        const res = await fetch("/api/admin/menu-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: (editDraft.name || "New Item") + " (Copy)",
                category: editDraft.category || "Starters",
                price: (editDraft.priceCents || 0) / 100,
                description: editDraft.description || "",
                imageUrl: editDraft.imageUrl || "",
                isVeg: editDraft.isVeg || false,
                isSpicy: editDraft.isSpicy || false,
                isPopular: editDraft.isPopular || false,
                isAvailable: editDraft.isAvailable ?? true,
                inPos: editDraft.inPos ?? true,
            }),
        });
        const data = await res.json();
        setIsSaving(false);
        if (!data.ok) return showToast(data.error || "Failed to duplicate item", "error");

        showToast("Item duplicated successfully!", "success");
        setEditingId(null);
        setEditDraft({});
        fetchItems();
    }

    async function toggleAvailability(item: MenuItem) {
        await fetch(`/api/admin/menu-items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
        });
        showToast("Website availability updated", "success");
        fetchItems();
    }

    async function togglePos(item: MenuItem) {
        await fetch(`/api/admin/menu-items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, inPos: !item.inPos }),
        });
        showToast("POS Sync status updated", "success");
        fetchItems();
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-12 text-white relative">
            {toast && (
                <div className={`fixed top-4 center left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-semibold transition animate-fade-in ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-black"
                    }`}>
                    {toast.msg}
                </div>
            )}

            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Menu Management</h1>
                    <p className="text-sm text-gray-400">
                        {activeFiltersCount > 0
                            ? `Showing ${items.length} of ${totals.total} items (Filters active)`
                            : `Total items: ${totals.total} • Available: ${totals.available}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Add form */}
                <div className="xl:col-span-1">
                    <form onSubmit={addItem} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-medium">Add New Menu Item</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Name <span className="text-red-400">*</span></label>
                                <input
                                    required
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Garlic Naan"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Category</label>
                                <select
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white"
                                    value={category}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={(e) => setCategory(e.target.value as any)}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c} className="bg-neutral-900">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Price ($) <span className="text-red-400">*</span></label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 5.99"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Image URL</label>
                                <input
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="/images/menu/naan.png"
                                />
                                {imageUrl && (
                                    <div className="mt-3 flex items-center gap-3 animate-fade-in">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="h-14 w-14 rounded-lg border border-white/10 object-cover bg-black/50"
                                            onError={(e) => ((e.currentTarget.style.display = "none"))}
                                        />
                                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Preview</p>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-4">
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Freshly baked in our tandoor oven, brushed with garlic..."
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-6 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isSpicy} onChange={(e) => setIsSpicy(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Spicy</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Popular</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Website Availability</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={inPos} onChange={(e) => setInPos(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition" title="Shows on POS screen but can still be hidden on website">In POS</span>
                            </label>
                        </div>

                        <button disabled={isSaving} className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 transition text-black font-semibold px-4 py-3 disabled:opacity-50">
                            {isSaving ? "Saving..." : "Save & Add Another"}
                        </button>
                    </form>
                </div>

                {/* Right Column: Filters and Table */}
                <div className="xl:col-span-2 space-y-6 min-w-0">
                    {/* Filters Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/50 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            <span className="text-sm font-medium text-gray-400 shrink-0">Filters:</span>
                            {activeFiltersCount === 0 ? (
                                <span className="text-sm text-gray-500 italic shrink-0">None active</span>
                            ) : (
                                <>
                                    {fCategory !== "All" && <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium shrink-0 flex items-center gap-2">{fCategory} <button onClick={() => setFCategory("All")} className="hover:text-red-400">&times;</button></span>}
                                    {fAvailability !== "all" && <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium shrink-0 flex items-center gap-2">{fAvailability === "available" ? "In Stock" : "Out of Stock"} <button onClick={() => setFAvailability("all")} className="hover:text-red-400">&times;</button></span>}
                                    {fVeg && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Veg <button onClick={() => setFVeg(false)} className="hover:text-white">&times;</button></span>}
                                    {fSpicy && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Spicy <button onClick={() => setFSpicy(false)} className="hover:text-white">&times;</button></span>}
                                    {fPopular && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Popular <button onClick={() => setFPopular(false)} className="hover:text-white">&times;</button></span>}
                                </>
                            )}
                            {activeFiltersCount > 0 && (
                                <button onClick={resetFilters} className="text-xs text-orange-400 hover:text-orange-300 transition font-medium underline shrink-0 ml-2">
                                    Reset All
                                </button>
                            )}
                        </div>

                        <div className="shrink-0">
                            <select
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-white/30 transition text-white"
                                value={sortBy}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="sortOrder">Sort: Custom Order</option>
                                <option value="updatedAt">Sort: Recently Updated</option>
                                <option value="priceCents">Sort: Price (Low to High)</option>
                                <option value="name">Sort: Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filters Controls */}
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Search</label>
                                <input
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search by meal or ingredient..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Category</label>
                                <select
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white"
                                    value={fCategory}
                                    onChange={(e) => setFCategory(e.target.value)}
                                >
                                    <option value="All" className="bg-neutral-900">All Categories</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c} className="bg-neutral-900">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Availability</label>
                                <select
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white"
                                    value={fAvailability}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={(e) => setFAvailability(e.target.value as any)}
                                >
                                    <option value="all" className="bg-neutral-900">All Statuses</option>
                                    <option value="available" className="bg-neutral-900">In Stock</option>
                                    <option value="unavailable" className="bg-neutral-900">Out of Stock</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-[30px]">
                                <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                    <input type="checkbox" checked={fVeg} onChange={(e) => setFVeg(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Veg</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                    <input type="checkbox" checked={fSpicy} onChange={(e) => setFSpicy(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Spicy</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                    <input type="checkbox" checked={fPopular} onChange={(e) => setFPopular(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Popular</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-xl">
                        <div className="border-b border-white/10 px-6 py-4 bg-white/[0.02]">
                            <h2 className="text-lg font-medium">All Database Entries</h2>
                        </div>

                        {loading ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-4" />
                                <p className="text-gray-400 font-medium">Syncing database...</p>
                            </div>
                        ) : totals.total === 0 ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                                <p className="text-gray-400 max-w-sm">Your menu is currently empty. Use the form on the left to add your first menu item.</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                                <p className="text-gray-400 mb-6">We couldn&apos;t find any items matching your current filters.</p>
                                <button onClick={resetFilters} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition text-sm">
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 font-medium w-16">Photo</th>
                                            <th className="px-6 py-4 font-medium">Name & Desc</th>
                                            <th className="px-6 py-4 font-medium">Category</th>
                                            <th className="px-6 py-4 font-medium">Price</th>
                                            <th className="px-6 py-4 font-medium">Tags</th>
                                            <th className="px-6 py-4 font-medium text-center">Visibility</th>
                                            <th className="px-6 py-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((it) => {
                                            const isEditing = editingId === it.id;
                                            return (
                                                <tr key={it.id} className="hover:bg-white/[0.02] transition">
                                                    <td className="px-6 py-4">
                                                        {it.imageUrl ? (
                                                            <div className="relative group cursor-pointer inline-block">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={it.imageUrl} alt={it.name} className="w-12 h-12 object-cover rounded-lg bg-neutral-900 border border-white/10" />
                                                                <div className="absolute left-16 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:block w-48 h-48 bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-fade-in pointer-events-none">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                                                                <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-white mb-1">{it.name}</div>
                                                        <div className="text-xs text-gray-500 max-w-[250px] truncate whitespace-normal break-words line-clamp-2">
                                                            {it.description}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-300">
                                                        {it.category}
                                                    </td>

                                                    <td className="px-6 py-4 font-medium text-green-400">
                                                        {money(it.priceCents)}
                                                    </td>

                                                    <td className="px-6 py-4 w-40">
                                                        <div className="flex flex-wrap gap-2">
                                                            {["Veg", "Spicy", "Popular"].map((t) => {
                                                                const key =
                                                                    t === "Veg" ? "isVeg" : t === "Spicy" ? "isSpicy" : "isPopular";
                                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                const val = (it as any)[key] as boolean;

                                                                const activeColors = t === 'Veg' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                    t === 'Spicy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                        'bg-orange-500/10 text-orange-400 border-orange-500/20';

                                                                const inactiveColors = 'bg-white/5 text-gray-500 border-white/10';

                                                                return (
                                                                    <span
                                                                        key={t}
                                                                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition ${val ? activeColors : inactiveColors
                                                                            } ${!val ? 'opacity-40' : ''}`}
                                                                    >
                                                                        {t}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 w-40">
                                                        <div className="flex flex-col gap-3">
                                                            <label className="relative flex items-center cursor-pointer group">
                                                                <input type="checkbox" className="sr-only peer" checked={it.isAvailable} onChange={() => toggleAvailability(it)} />
                                                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 group-hover:bg-white/20 transition-colors"></div>
                                                                <span className="ml-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{it.isAvailable ? "Web: On" : "Web: Off"}</span>
                                                            </label>

                                                            <label className="relative flex items-center cursor-pointer group">
                                                                <input type="checkbox" className="sr-only peer" checked={it.inPos} onChange={() => togglePos(it)} />
                                                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 group-hover:bg-white/20 transition-colors"></div>
                                                                <span className="ml-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{it.isAvailable ? "POS: On" : "POS: Off"}</span>
                                                            </label>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 w-28 text-right">
                                                        <button
                                                            type="button"
                                                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg font-medium transition text-center border border-white/5 w-full"
                                                            onClick={() => beginEdit(it)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {editingId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="text-xl font-semibold">Edit Menu Item</h2>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">Name <span className="text-red-400">*</span></label>
                                    <input
                                        required
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={(editDraft.name as string) ?? ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300">Category</label>
                                    <select
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white"
                                        value={(editDraft.category as string) ?? "Starters"}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c} className="bg-neutral-900">{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300">Price ($) <span className="text-red-400">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={editDraft.priceCents ? (editDraft.priceCents / 100).toString() : ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setEditDraft((d) => ({ ...d, priceCents: Number.isFinite(val) ? Math.round(val * 100) : 0 }));
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">Image URL</label>
                                    <input
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={(editDraft.imageUrl as string) ?? ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                                    />
                                    {editDraft.imageUrl && (
                                        <div className="mt-3 flex items-center gap-3 animate-fade-in">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={editDraft.imageUrl}
                                                alt="Preview"
                                                className="h-14 w-14 rounded-lg border border-white/10 object-cover bg-black/50"
                                                onError={(e) => ((e.currentTarget.style.display = "none"))}
                                            />
                                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Preview</p>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={(editDraft.description as string) ?? ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-6 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={editDraft.isVeg ?? false} onChange={(e) => setEditDraft((d) => ({ ...d, isVeg: e.target.checked }))} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Veg</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={editDraft.isSpicy ?? false} onChange={(e) => setEditDraft((d) => ({ ...d, isSpicy: e.target.checked }))} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Spicy</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={editDraft.isPopular ?? false} onChange={(e) => setEditDraft((d) => ({ ...d, isPopular: e.target.checked }))} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Popular</span>
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="text-sm text-red-400 hover:text-red-300 transition font-medium underline"
                                    onClick={() => removeItem(editingId)}
                                >
                                    Delete Item
                                </button>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition w-full sm:w-auto"
                                    onClick={duplicateItem}
                                    disabled={isSaving}
                                >
                                    Duplicate
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold transition disabled:opacity-50 min-w-[120px] w-full sm:w-auto"
                                    onClick={() => saveEdit(editingId)}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
