"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface MenuItem {
    id: string;
    name: string;
    category: string;
    priceCents: number;
    description: string;
    isVeg: boolean;
    isNonVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
    inPos: boolean;
    sortOrder: number;
    imageUrl: string | null;
    allergens: string[];
    isStockTracked: boolean;
    stockCount: number | null;
    prepTime: string | null;
    pairedItemIds: string[];
    addons: { id: string; name: string; priceCents: number; isAvailable: boolean }[];
}

type Category = {
    id: string;
    name: string;
    sortOrder: number;
};

function money(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminMenuItemsPage() {
    const { confirm } = useConfirm();
    // form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState<string>("Starters");
    const [price, setPrice] = useState<string>("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isVeg, setIsVeg] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const [isPopular, setIsPopular] = useState(false);
    const [isNonVeg, setIsNonVeg] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [inPos, setInPos] = useState(true);
    const [allergens, setAllergens] = useState("");
    const [isStockTracked, setIsStockTracked] = useState(false);
    const [stockCount, setStockCount] = useState<string>("");
    const [prepTime, setPrepTime] = useState<string>("15-20");
    const [pairedItemIds, setPairedItemIds] = useState<string[]>([]);
    const [pairingSearch, setPairingSearch] = useState("");
    const [editPairingSearch, setEditPairingSearch] = useState("");
    const [addons, setAddons] = useState<{name: string; price: string; isAvailable: boolean}[]>([]);

    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // list state
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // category manager state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [isSavingCat, setIsSavingCat] = useState(false);

    // bulk actions state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    // filters
    const [q, setQ] = useState("");
    const [fCategory, setFCategory] = useState<string>("All");
    const [fVeg, setFVeg] = useState(false);
    const [fNonVeg, setFNonVeg] = useState(false);
    const [fSpicy, setFSpicy] = useState(false);
    const [fPopular, setFPopular] = useState(false);
    const [fAvailability, setFAvailability] = useState<"all" | "available" | "unavailable">("all");

    // editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<Record<string, any>>({});

    // sorting
    const [sortBy, setSortBy] = useState<"updatedAt" | "priceCents" | "name" | "sortOrder">("sortOrder");

    // drag to reorder
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

    async function handleDrop(targetId: string) {
        if (!draggedItemId || draggedItemId === targetId) {
            setDraggedItemId(null);
            setDragOverItemId(null);
            return;
        }

        const sourceIndex = items.findIndex((i) => i.id === draggedItemId);
        const targetIndex = items.findIndex((i) => i.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return;

        const newItems = [...items];
        const [removed] = newItems.splice(sourceIndex, 1);
        newItems.splice(targetIndex, 0, removed);

        setItems(newItems);

        const itemIds = newItems.map((i) => i.id);
        try {
            const res = await fetch("/api/admin/menu-items/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemIds }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);
            showToast("Menu order saved", "success");
        } catch {
            showToast("Failed to save reordering", "error");
            fetchItems();
        }

        setDraggedItemId(null);
        setDragOverItemId(null);
    }
    async function handleFileUpload(file: File, target: "add" | "edit") {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                if (target === "add") {
                    setImageUrl(data.url);
                } else {
                    setEditDraft((d) => ({ ...d, imageUrl: data.url }));
                }
                showToast("Image uploaded!", "success");
            } else {
                showToast(data.error || "Upload failed", "error");
            }
        } catch {
            showToast("Error uploading file", "error");
        } finally {
            setIsUploading(false);
        }
    }

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (fCategory !== "All") params.set("category", fCategory);
        if (fVeg) params.set("veg", "1");
        if (fNonVeg) params.set("nonVeg", "1");
        if (fSpicy) params.set("spicy", "1");
        if (fPopular) params.set("popular", "1");
        if (fAvailability === "available") params.set("available", "1");
        if (fAvailability === "unavailable") params.set("available", "0");
        params.set("orderBy", sortBy);

        const res = await fetch(`/api/admin/menu-items?${params.toString()}`, { cache: "no-store", headers: { 'Accept': 'application/json' } });
        try {
            const data = await res.json();
            setItems(data.items ?? []);
            setSelectedIds([]); // reset selection on new data
        } catch {
            console.error("Failed to parse JSON response. Status:", res.status);
            const text = await res.text();
            console.error("Raw Response Text:", text);
            showToast("Server returned an invalid JSON block. Check console.", "error");
        }
        setLoading(false);
    }, [q, fCategory, fVeg, fNonVeg, fSpicy, fPopular, fAvailability, sortBy]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/menu-categories");
            const data = await res.json();
            if (data.ok) setCategories(data.categories || []);
        } catch {
            console.error("Failed to fetch categories");
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            await fetchItems();
        };
        init();
    }, [fetchItems, fetchCategories]);

    useEffect(() => {
        const t = setTimeout(() => fetchItems(), 250);
        return () => clearTimeout(t);
    }, [q, fCategory, fVeg, fNonVeg, fSpicy, fPopular, fAvailability, sortBy, fetchItems]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (q) count++;
        if (fCategory !== "All") count++;
        if (fVeg) count++;
        if (fNonVeg) count++;
        if (fSpicy) count++;
        if (fPopular) count++;
        if (fAvailability !== "all") count++;
        return count;
    }, [q, fCategory, fVeg, fNonVeg, fSpicy, fPopular, fAvailability]);

    function resetFilters() {
        setQ("");
        setFCategory("All");
        setFVeg(false);
        setFNonVeg(false);
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
                isNonVeg,
                isSpicy,
                isPopular,
                isAvailable,
                inPos,
                allergens: allergens.split(",").map(a => a.trim()).filter(Boolean),
                isStockTracked,
                stockCount: stockCount ? parseInt(stockCount, 10) : null,
                prepTime,
                pairedItemIds,
                addons: addons.map(a => ({ name: a.name, price: Number(a.price), isAvailable: a.isAvailable }))
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
        setIsNonVeg(false);
        setIsSpicy(false);
        setIsPopular(false);
        setIsAvailable(true);
        setInPos(true);
        setAllergens("");
        setIsStockTracked(false);
        setStockCount("");
        setPrepTime("15-20");
        setPairedItemIds([]);
        setPairingSearch("");
        setAddons([]);

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
            isNonVeg: item.isNonVeg,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            isAvailable: item.isAvailable,
            inPos: item.inPos,
            allergens: item.allergens ? item.allergens.join(", ") : "",
            isStockTracked: item.isStockTracked || false,
            stockCount: item.stockCount,
            prepTime: item.prepTime || "15-20",
            pairedItemIds: item.pairedItemIds || [],
            addons: item.addons ? item.addons.map(a => ({ ...a, price: (a.priceCents / 100).toString() })) : []
        });
    }

    async function saveEdit(id: string) {
        const payload: Partial<MenuItem & { price: number }> = { ...editDraft };

        // convert cents -> dollars field if user changed price via input
        if (typeof payload.priceCents === "number") {
            payload.price = payload.priceCents / 100;
            delete payload.priceCents;
        }

        const allergensList = typeof payload.allergens === "string" 
            ? (payload.allergens as string).split(",").map((a: string) => a.trim()).filter(Boolean) 
            : payload.allergens;

        const res = await fetch(`/api/admin/menu-items/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, allergens: allergensList }),
        });
        const data = await res.json();
        if (!data.ok) return showToast(data.error || "Failed to update item", "error");

        showToast("Item updated successfully!", "success");
        setEditingId(null);
        setEditDraft({});
        fetchItems();
    }

    async function removeItem(id: string) {
        const perform = await confirm({ title: "Delete Menu Item", message: "This item will be permanently removed from your menu. This action cannot be reversed.", confirmLabel: "Delete", variant: "danger" });
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
                isNonVeg: editDraft.isNonVeg || false,
                isSpicy: editDraft.isSpicy || false,
                isPopular: editDraft.isPopular || false,
                isAvailable: editDraft.isAvailable ?? true,
                inPos: editDraft.inPos ?? true,
                allergens: typeof editDraft.allergens === 'string' ? editDraft.allergens.split(",").map((a: string) => a.trim()).filter(Boolean) : (editDraft.allergens || []),
                isStockTracked: editDraft.isStockTracked ?? false,
                stockCount: editDraft.stockCount ?? null,
                pairedItemIds: editDraft.pairedItemIds ?? [],
                addons: (editDraft.addons || []).map((a: any) => ({ name: a.name, price: Number(a.price), isAvailable: a.isAvailable }))
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

    async function addCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setIsSavingCat(true);
        try {
            const res = await fetch("/api/admin/menu-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCatName }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);
            setNewCatName("");
            fetchCategories();
            showToast("Category added", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to add category", "error");
        }
        setIsSavingCat(false);
    }

    async function deleteCategory(id: string, name: string) {
        const count = items.filter(i => i.category === name).length;
        if (count > 0) return showToast(`${count} items still use this category. You must reassign them first!`, "error");

        const okCat = await confirm({ title: `Delete "${name}"`, message: "This category will be permanently removed.", confirmLabel: "Delete", variant: "danger" });
        if (!okCat) return;
        setIsSavingCat(true);
        try {
            const res = await fetch(`/api/admin/menu-categories/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);
            showToast("Category deleted", "success");
            fetchCategories();
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to delete", "error");
        }
        setIsSavingCat(false);
    }

    async function handleBulkAction(action: "available" | "unavailable" | "pos_on" | "pos_off" | "delete") {
        if (selectedIds.length === 0) return;

        if (action === "delete") {
            const okBulk = await confirm({ title: `Delete ${selectedIds.length} Items`, message: `${selectedIds.length} menu items will be permanently deleted. This cannot be undone.`, confirmLabel: "Delete All", variant: "danger" });
            if (!okBulk) return;
        }

        setIsBulkLoading(true);

        try {
            const res = await fetch("/api/admin/menu-items/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, action }),
            });
            const data = await res.json();

            if (!data.ok) throw new Error(data.error);
            showToast(`Bulk action successful (${selectedIds.length} items)`, "success");
            setSelectedIds([]);
            fetchItems();
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Bulk action failed", "error");
        }

        setIsBulkLoading(false);
    }

    function toggleSelectAll() {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map((i) => i.id));
        }
    }

    function toggleSelect(id: string) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
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
                    <h1 className="text-3xl font-semibold mb-2">
                        {fPopular && !fVeg && !fNonVeg && !fSpicy && fCategory === "All" && !q 
                            ? "Signature Dishes" 
                            : "Menu Management"}
                    </h1>
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

                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Name <span className="text-red-400">*</span></label>
                                <input
                                    required
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Garlic Naan"
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">Category</label>
                                        <button type="button" onClick={() => setIsCatModalOpen(true)} className="text-xs text-orange-400 hover:text-orange-300 transition underline">Manage</button>
                                    </div>
                                    <select
                                        title="Category"
                                        aria-label="Category"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white appearance-none"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name} className="bg-neutral-900">
                                                {c.name}
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
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Image URL / Upload</label>
                                <div className="space-y-3 mt-1">
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 text-sm"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="Enter URL or upload below..."
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "add")}
                                                disabled={isUploading}
                                            />
                                            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {isUploading ? "Uploading..." : "Upload Photo"}
                                            </span>
                                        </label>
                                        {imageUrl && (
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/50 relative">
                                                <Image
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Freshly baked in our tandoor oven, brushed with garlic..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Allergens (comma separated)</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={allergens}
                                    onChange={(e) => setAllergens(e.target.value)}
                                    placeholder="e.g. Dairy, Nuts, Gluten"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Prep Time <span className="text-gray-500 text-xs font-normal">(e.g. 15-20)</span></label>
                                <input
                                    type="text"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                    value={prepTime}
                                    onChange={(e) => setPrepTime(e.target.value)}
                                    placeholder="e.g. 15-20"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 cursor-pointer mt-8 group h-10">
                                        <input type="checkbox" checked={isStockTracked} onChange={(e) => setIsStockTracked(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">Track Stock</span>
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-300">Stock Count</label>
                                    <input
                                        type="number"
                                        disabled={!isStockTracked}
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 disabled:opacity-50"
                                        value={stockCount}
                                        onChange={(e) => setStockCount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Addons & Customizations</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setAddons([...addons, { name: "", price: "", isAvailable: true }])} 
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition"
                                    >
                                        + Add
                                    </button>
                                </div>
                                {addons.length === 0 ? (
                                    <div className="text-xs text-gray-500 italic p-3 border border-white/5 rounded-xl bg-black/20 text-center">No addons configured.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {addons.map((addon, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Name (e.g. Extra Paneer)"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 transition text-sm"
                                                    value={addon.name}
                                                    onChange={(e) => {
                                                        const newAddons = [...addons];
                                                        newAddons[idx].name = e.target.value;
                                                        setAddons(newAddons);
                                                    }}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Price $"
                                                    className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 transition text-sm"
                                                    value={addon.price}
                                                    onChange={(e) => {
                                                        const newAddons = [...addons];
                                                        newAddons[idx].price = e.target.value;
                                                        setAddons(newAddons);
                                                    }}
                                                />
                                                <label className="flex items-center" title="Available">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={addon.isAvailable} 
                                                        onChange={(e) => {
                                                            const newAddons = [...addons];
                                                            newAddons[idx].isAvailable = e.target.checked;
                                                            setAddons(newAddons);
                                                        }} 
                                                        className="rounded w-4 h-4 cursor-pointer" 
                                                    />
                                                </label>
                                                <button type="button" onClick={() => setAddons(addons.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 p-1">
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <label className="text-sm font-medium text-gray-300 block mb-2">Pair it with (Upsells)</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search items to pair with..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 text-sm"
                                            value={pairingSearch}
                                            onChange={(e) => setPairingSearch(e.target.value)}
                                        />
                                        {pairingSearch && (
                                            <div className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-1">
                                                {items
                                                    .filter(it => it.name.toLowerCase().includes(pairingSearch.toLowerCase()) && !pairedItemIds.includes(it.id))
                                                    .slice(0, 10)
                                                    .map(it => (
                                                        <button
                                                            key={it.id}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg transition text-sm flex items-center justify-between group"
                                                            onClick={() => {
                                                                setPairedItemIds(prev => [...prev, it.id]);
                                                                setPairingSearch("");
                                                            }}
                                                        >
                                                            <span>{it.name} <span className="text-gray-500 text-xs ml-2">({it.category})</span></span>
                                                            <span className="text-orange-500 opacity-0 group-hover:opacity-100">+ Add</span>
                                                        </button>
                                                    ))
                                                }
                                                {items.filter(it => it.name.toLowerCase().includes(pairingSearch.toLowerCase()) && !pairedItemIds.includes(it.id)).length === 0 && (
                                                    <div className="px-3 py-2 text-gray-500 text-xs italic">No matching items</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {pairedItemIds.map(id => {
                                            const item = items.find(it => it.id === id);
                                            if (!item) return null;
                                            return (
                                                <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs">
                                                    <span>{item.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPairedItemIds(prev => prev.filter(pid => pid !== id))}
                                                        className="hover:text-white transition"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {pairedItemIds.length === 0 && !pairingSearch && (
                                            <span className="text-xs text-gray-500 italic">No pairings selected. These will appear as &quot;Pair it with&quot; in the modal.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-6 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isNonVeg} onChange={(e) => setIsNonVeg(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-gray-300 group-hover:text-white transition">Non-Veg</span>
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
                                    {fCategory !== "All" && <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium shrink-0 flex items-center gap-2">{fCategory} <button title="Remove category filter" aria-label="Remove category filter" onClick={() => setFCategory("All")} className="hover:text-red-400">&times;</button></span>}
                                    {fAvailability !== "all" && <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium shrink-0 flex items-center gap-2">{fAvailability === "available" ? "In Stock" : "Out of Stock"} <button title="Remove availability filter" aria-label="Remove availability filter" onClick={() => setFAvailability("all")} className="hover:text-red-400">&times;</button></span>}
                                    {fVeg && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Veg <button title="Remove veg filter" aria-label="Remove veg filter" onClick={() => setFVeg(false)} className="hover:text-white">&times;</button></span>}
                                    {fNonVeg && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Non-Veg <button title="Remove non-veg filter" aria-label="Remove non-veg filter" onClick={() => setFNonVeg(false)} className="hover:text-white">&times;</button></span>}
                                    {fSpicy && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Spicy <button title="Remove spicy filter" aria-label="Remove spicy filter" onClick={() => setFSpicy(false)} className="hover:text-white">&times;</button></span>}
                                    {fPopular && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium shrink-0 flex items-center gap-2">Popular <button title="Remove popular filter" aria-label="Remove popular filter" onClick={() => setFPopular(false)} className="hover:text-white">&times;</button></span>}
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
                                title="Sort order"
                                aria-label="Sort order"
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-white/30 transition text-white"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "updatedAt" | "priceCents" | "name" | "sortOrder")}
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
                                    title="Filter by category"
                                    aria-label="Filter by category"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white appearance-none"
                                    value={fCategory}
                                    onChange={(e) => setFCategory(e.target.value)}
                                >
                                    <option value="All" className="bg-neutral-900">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name} className="bg-neutral-900">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300">Availability</label>
                                <select
                                    title="Filter by availability"
                                    aria-label="Filter by availability"
                                    className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white"
                                    value={fAvailability}
                                    onChange={(e) => setFAvailability(e.target.value as "all" | "available" | "unavailable")}
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
                                    <input type="checkbox" checked={fNonVeg} onChange={(e) => setFNonVeg(e.target.checked)} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                    <span className="text-gray-300 group-hover:text-white transition">Non-Veg</span>
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
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-xl relative">
                        {/* Bulk Action Header Override */}
                        {selectedIds.length > 0 && (
                            <div className="absolute top-0 left-0 right-0 h-[61px] bg-orange-500/10 border-b border-orange-500/30 flex items-center justify-between px-6 z-10 animate-fade-in backdrop-blur-md">
                                <span className="text-orange-400 font-semibold text-sm">
                                    {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={isBulkLoading}
                                        onClick={() => handleBulkAction("available")}
                                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        Set In Stock
                                    </button>
                                    <button
                                        disabled={isBulkLoading}
                                        onClick={() => handleBulkAction("unavailable")}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        Set Out of Stock
                                    </button>
                                    <div className="w-px h-6 bg-white/10 self-center mx-1"></div>
                                    <button
                                        disabled={isBulkLoading}
                                        onClick={() => handleBulkAction("pos_on")}
                                        className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        POS On
                                    </button>
                                    <button
                                        disabled={isBulkLoading}
                                        onClick={() => handleBulkAction("pos_off")}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        POS Off
                                    </button>
                                    <div className="w-px h-6 bg-white/10 self-center mx-1"></div>
                                    <button
                                        disabled={isBulkLoading}
                                        onClick={() => handleBulkAction("delete")}
                                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                    >
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

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
                                            <th className="px-6 py-4 font-medium w-10">
                                                <input
                                                    type="checkbox"
                                                    title="Select all items"
                                                    aria-label="Select all items"
                                                    className="w-4 h-4 rounded border-white/10 bg-black/40 cursor-pointer accent-orange-500"
                                                    onChange={toggleSelectAll}
                                                    checked={items.length > 0 && selectedIds.length === items.length}
                                                />
                                            </th>
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

                                            const isDragging = draggedItemId === it.id;
                                            const isOver = dragOverItemId === it.id && !isDragging;
                                            return (
                                                <tr
                                                    key={it.id}
                                                    draggable={sortBy === "sortOrder" && !q && fCategory === "All"}
                                                    onDragStart={() => setDraggedItemId(it.id)}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setDragOverItemId(it.id);
                                                    }}
                                                    onDragLeave={() => setDragOverItemId(null)}
                                                    onDrop={() => handleDrop(it.id)}
                                                    className={`transition ${isDragging ? "opacity-30 bg-white/10" : "hover:bg-white/[0.02]"
                                                        } ${isOver ? "border-t-2 border-orange-500 bg-orange-500/10" : ""} ${selectedIds.includes(it.id) ? "bg-orange-500/[0.02]" : ""}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            title={`Select ${it.name}`}
                                                            aria-label={`Select ${it.name}`}
                                                            className="w-4 h-4 rounded border-white/10 bg-black/40 cursor-pointer accent-orange-500"
                                                            checked={selectedIds.includes(it.id)}
                                                            onChange={() => toggleSelect(it.id)}
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-black/40 flex items-center justify-center">
                                                            {it.imageUrl ? (
                                                                <div className="relative h-full w-full">
                                                                    <Image
                                                                        src={it.imageUrl}
                                                                        alt={it.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300 text-lg">🍛</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {(sortBy === "sortOrder" && !q && fCategory === "All") && (
                                                                <div className="cursor-grab text-gray-500 hover:text-white transition active:cursor-grabbing">
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-semibold text-white mb-1">{it.name}</div>
                                                                <div className="text-xs text-gray-500 max-w-[250px] truncate whitespace-normal break-words line-clamp-2">
                                                                    {it.description}
                                                                </div>
                                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                                    {it.isVeg && (
                                                                        <div title="Vegetarian" className="flex flex-col items-center justify-center border border-green-700 rounded-sm bg-white w-6 h-6 flex-shrink-0">
                                                                            <div className="w-2.5 h-2.5 bg-green-700 rounded-full mb-0.5" />
                                                                            <span className="text-[4px] font-bold text-green-700 leading-none">VEG</span>
                                                                        </div>
                                                                    )}
                                                                    {it.isNonVeg && (
                                                                        <div title="Non-Vegetarian" className="flex flex-col items-center justify-center border border-red-700 rounded-sm bg-white w-6 h-6 flex-shrink-0">
                                                                            <div className="w-2.5 h-2.5 bg-red-700 rounded-full mb-0.5" />
                                                                            <span className="text-[4px] font-bold text-red-700 leading-none tracking-tighter">NON-VEG</span>
                                                                        </div>
                                                                    )}
                                                                    {it.isSpicy && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Spicy</span>}
                                                                    {it.isPopular && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Popular</span>}
                                                                </div>
                                                            </div>
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
                                                                const key = t === "Veg" ? "isVeg" : t === "Spicy" ? "isSpicy" : "isPopular";
                                                                const val = it[key as keyof MenuItem] as boolean;

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
                                                        <button
                                                            type="button"
                                                            className="mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 px-4 py-1.5 rounded-lg font-medium transition text-center border border-red-500/10 w-full"
                                                            onClick={() => removeItem(it.id)}
                                                        >
                                                            Delete
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
                            <button title="Close edit modal" aria-label="Close edit modal" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white transition">
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
                                        placeholder="Item name"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={(editDraft.name as string) ?? ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">Category</label>
                                        <button type="button" onClick={() => setIsCatModalOpen(true)} className="text-xs text-orange-400 hover:text-orange-300 transition underline">Manage</button>
                                    </div>
                                    <select
                                        title="Edit category"
                                        aria-label="Edit category"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition text-white appearance-none"
                                        value={(editDraft.category as string) ?? "Starters"}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>
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
                                        placeholder="e.g. 5.99"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={editDraft.priceCents ? (editDraft.priceCents / 100).toString() : ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setEditDraft((d) => ({ ...d, priceCents: Number.isFinite(val) ? Math.round(val * 100) : 0 }));
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-300">Image URL / Upload</label>
                                    <div className="space-y-3">
                                        <input
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 text-sm"
                                            value={(editDraft.imageUrl as string) ?? ""}
                                            onChange={(e) => setEditDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                                            placeholder="Enter URL or upload below..."
                                        />
                                        <div className="flex items-center gap-3">
                                            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "edit")}
                                                    disabled={isUploading}
                                                />
                                                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {isUploading ? "Uploading..." : "Upload Photo"}
                                                </span>
                                            </label>
                                            {editDraft.imageUrl && (
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/50 relative">
                                                    <Image
                                                        src={editDraft.imageUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        placeholder="Item description..."
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={(editDraft.description as string) ?? ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                                        rows={2}
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-sm font-medium text-gray-300">Allergens (comma separated)</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={editDraft.allergens || ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, allergens: e.target.value }))}
                                        placeholder="e.g. Dairy, Nuts, Gluten"
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-sm font-medium text-gray-300">Prep Time <span className="text-gray-500 text-xs font-normal">(e.g. 15-20)</span></label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                                        value={editDraft.prepTime || ""}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, prepTime: e.target.value }))}
                                        placeholder="e.g. 15-20"
                                    />
                                </div>

                                <div className="md:col-span-4 flex gap-4">
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 cursor-pointer mt-8 group h-10">
                                            <input type="checkbox" checked={!!editDraft.isStockTracked} onChange={(e) => setEditDraft((d) => ({ ...d, isStockTracked: e.target.checked }))} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">Track Stock</span>
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-300">Stock Count</label>
                                        <input
                                            type="number"
                                            disabled={!editDraft.isStockTracked}
                                            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 disabled:opacity-50"
                                            value={editDraft.stockCount ?? ""}
                                            onChange={(e) => setEditDraft((d) => ({ ...d, stockCount: e.target.value }))}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-300">Addons & Customizations</label>
                                        <button 
                                            type="button" 
                                            onClick={() => setEditDraft((d) => ({ ...d, addons: [...(d.addons || []), { name: "", price: "", isAvailable: true }] }))} 
                                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    {(!editDraft.addons || editDraft.addons.length === 0) ? (
                                        <div className="text-xs text-gray-500 italic p-3 border border-white/5 rounded-xl bg-black/20 text-center">No addons configured.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {editDraft.addons.map((addon: any, idx: number) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Name (e.g. Extra Paneer)"
                                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 transition text-sm"
                                                        value={addon.name}
                                                        onChange={(e) => {
                                                            const newAddons = [...editDraft.addons];
                                                            newAddons[idx].name = e.target.value;
                                                            setEditDraft((d) => ({ ...d, addons: newAddons }));
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Price $"
                                                        className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 transition text-sm"
                                                        value={addon.price}
                                                        onChange={(e) => {
                                                            const newAddons = [...editDraft.addons];
                                                            newAddons[idx].price = e.target.value;
                                                            setEditDraft((d) => ({ ...d, addons: newAddons }));
                                                        }}
                                                    />
                                                    <label className="flex items-center" title="Available">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={addon.isAvailable} 
                                                            onChange={(e) => {
                                                                const newAddons = [...editDraft.addons];
                                                                newAddons[idx].isAvailable = e.target.checked;
                                                                setEditDraft((d) => ({ ...d, addons: newAddons }));
                                                            }} 
                                                            className="rounded w-4 h-4 cursor-pointer" 
                                                        />
                                                    </label>
                                                    <button type="button" onClick={() => setEditDraft((d) => ({ ...d, addons: d.addons.filter((_: any, i: number) => i !== idx) }))} className="text-red-400 hover:text-red-300 p-1">
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-4 mt-2">
                                    <label className="text-sm font-medium text-gray-300 block mb-2">Pair it with (Upsells)</label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search items to pair with..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600 text-sm"
                                                value={editPairingSearch}
                                                onChange={(e) => setEditPairingSearch(e.target.value)}
                                            />
                                            {editPairingSearch && (
                                                <div className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-1">
                                                    {items
                                                        .filter(it => it.name.toLowerCase().includes(editPairingSearch.toLowerCase()) && !(editDraft.pairedItemIds || []).includes(it.id) && it.id !== editingId)
                                                        .slice(0, 10)
                                                        .map(it => (
                                                            <button
                                                                key={it.id}
                                                                type="button"
                                                                className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg transition text-sm flex items-center justify-between group"
                                                                onClick={() => {
                                                                    setEditDraft(d => ({ ...d, pairedItemIds: [...(d.pairedItemIds || []), it.id] }));
                                                                    setEditPairingSearch("");
                                                                }}
                                                            >
                                                                <span>{it.name} <span className="text-gray-500 text-xs ml-2">({it.category})</span></span>
                                                                <span className="text-orange-500 opacity-0 group-hover:opacity-100">+ Add</span>
                                                            </button>
                                                        ))
                                                    }
                                                    {items.filter(it => it.name.toLowerCase().includes(editPairingSearch.toLowerCase()) && !(editDraft.pairedItemIds || []).includes(it.id) && it.id !== editingId).length === 0 && (
                                                        <div className="px-3 py-2 text-gray-500 text-xs italic">No matching items</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {(editDraft.pairedItemIds || []).map((id: string) => {
                                                const item = items.find(it => it.id === id);
                                                if (!item) return null;
                                                return (
                                                    <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs">
                                                        <span>{item.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditDraft(d => ({ ...d, pairedItemIds: d.pairedItemIds.filter((pid: string) => pid !== id) }))}
                                                            className="hover:text-white transition"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {(editDraft.pairedItemIds || []).length === 0 && !editPairingSearch && (
                                                <span className="text-xs text-gray-500 italic">No pairings selected.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-sm font-medium text-gray-300 block mb-4">Dietary & Status</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={!!editDraft.isVeg}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, isVeg: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">Vegetarian</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={!!editDraft.isNonVeg}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, isNonVeg: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">Non-Vegetarian</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={!!editDraft.isSpicy}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, isSpicy: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">Spicy</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={!!editDraft.isPopular}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, isPopular: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">Popular</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={editDraft.isAvailable !== false}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, isAvailable: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">Website Availability</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/20 bg-transparent text-orange-500 focus:ring-orange-500/50"
                                                checked={editDraft.inPos !== false}
                                                onChange={(e) => setEditDraft((d) => ({ ...d, inPos: e.target.checked }))}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition">In POS</span>
                                        </label>
                                    </div>
                                </div>
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

            {/* Category Manager Modal Overlay */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="text-xl font-semibold">Manage Categories</h2>
                            <button title="Close categories modal" aria-label="Close categories modal" onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={addCategory} className="flex gap-3 mb-6">
                                <input
                                    type="text"
                                    required
                                    placeholder="New category name..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-white/30 transition placeholder-gray-600 text-sm"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                />
                                <button
                                    disabled={isSavingCat || !newCatName.trim()}
                                    className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-sm font-semibold transition"
                                >
                                    Add
                                </button>
                            </form>

                            <div className="space-y-2 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                                {categories.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] border-b border-white/5 last:border-0 transition text-sm group">
                                        <div className="font-medium">{c.name}</div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs text-gray-500">
                                                {items.filter(i => i.category === c.name).length} items
                                            </div>
                                            <button
                                                onClick={() => deleteCategory(c.id, c.name)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition px-2 py-0.5"
                                                title="Delete category"
                                                disabled={isSavingCat}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                                        No categories found. Add one above.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
