"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CateringAvailabilityToggle from "../ui/CateringAvailabilityToggle";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import LottieDeleteButton from "@/components/ui/LottieDeleteButton";

type PriceKind = "PER_PERSON" | "TRAY" | "FIXED";

type CateringItem = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    priceKind: PriceKind;
    amount: number | null;
    minPeople: number | null;
    unit: string | null;
    halfPrice: number | null;
    fullPrice: number | null;
    isVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
    sortOrder: number;
    updatedAt: string;
};

type Category = {
    id: string;
    name: string;
    subtitle: string | null;
    sortOrder: number;
};

function money(n: number | null) {
    if (n === null) return "-";
    return `$${n.toFixed(0)}`;
}

export default function AdminCateringMenuPage() {
    const { confirm } = useConfirm();
    
    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [priceKind, setPriceKind] = useState<PriceKind>("PER_PERSON");
    const [amount, setAmount] = useState<string>("");
    const [minPeople, setMinPeople] = useState<string>("");
    const [unit, setUnit] = useState<string>("");
    const [halfPrice, setHalfPrice] = useState<string>("");
    const [fullPrice, setFullPrice] = useState<string>("");

    const [isVeg, setIsVeg] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const [isPopular, setIsPopular] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);

    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cateringEnabled, setCateringEnabled] = useState(true);

    // List state
    const [items, setItems] = useState<CateringItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Category manager state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatSubtitle, setNewCatSubtitle] = useState("");
    const [isSavingCat, setIsSavingCat] = useState(false);

    // Filters
    const [q, setQ] = useState("");
    const [fCategory, setFCategory] = useState<string>("All");

    // Drag to reorder
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

    async function fetchItems() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (q.trim()) params.set("q", q.trim());
            if (fCategory !== "All") params.set("category", fCategory);

            const res = await fetch(`/api/admin/catering-items?${params.toString()}`, { cache: "no-store" });
            const data = await res.json();
            if (data.ok) setItems(data.items || []);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        try {
            const res = await fetch("/api/admin/catering-categories");
            const data = await res.json();
            if (data.ok) {
                setCategories(data.categories || []);
                if (data.categories.length > 0 && !category) {
                    setCategory(data.categories[0].name);
                }
            }

            const sRes = await fetch("/api/admin/settings");
            const sData = await sRes.json();
            if (sData.ok || sData.cateringEnabled !== undefined) {
                const status = sData.settings?.cateringEnabled ?? sData.cateringEnabled ?? true;
                setCateringEnabled(status);
            }
        } catch {
            console.error("Failed to fetch categories");
        }
    }

    useEffect(() => {
        const fetchAll = async () => {
            await fetchCategories();
            await fetchItems();
        };
        fetchAll();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchItems(), 250);
        return () => clearTimeout(t);
    }, [q, fCategory]);

    function resetForm() {
        setEditingId(null);
        setName("");
        setDescription("");
        setAmount("");
        setMinPeople("");
        setUnit("");
        setHalfPrice("");
        setFullPrice("");
        setIsVeg(false);
        setIsSpicy(false);
        setIsPopular(false);
        setIsAvailable(true);
    }

    function startEdit(item: CateringItem) {
        setEditingId(item.id);
        setName(item.name);
        setCategory(item.category);
        setDescription(item.description || "");
        setPriceKind(item.priceKind);
        setAmount(item.amount?.toString() || "");
        setMinPeople(item.minPeople?.toString() || "");
        setUnit(item.unit || "");
        setHalfPrice(item.halfPrice?.toString() || "");
        setFullPrice(item.fullPrice?.toString() || "");
        setIsVeg(item.isVeg);
        setIsSpicy(item.isSpicy);
        setIsPopular(item.isPopular);
        setIsAvailable(item.isAvailable);
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function saveItem(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return showToast("Name is required", "error");
        if (!category) return showToast("Category is required", "error");

        setIsSaving(true);
        const url = editingId ? `/api/admin/catering-items/${editingId}` : "/api/admin/catering-items";
        const method = editingId ? "PATCH" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                category,
                description,
                priceKind,
                amount: amount ? Number(amount) : null,
                minPeople: minPeople ? Number(minPeople) : null,
                unit: unit.trim() || null,
                halfPrice: halfPrice ? Number(halfPrice) : null,
                fullPrice: fullPrice ? Number(fullPrice) : null,
                isVeg,
                isSpicy,
                isPopular,
                isAvailable,
            }),
        });

        const data = await res.json();
        setIsSaving(false);
        if (!data.ok) return showToast(data.error || "Failed to save item", "error");

        showToast(editingId ? "Item updated!" : "Item added!", "success");
        resetForm();
        fetchItems();
    }

    function showToast(msg: string, type: "success" | "error" = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

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

        try {
            await fetch("/api/admin/catering-items/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemIds: newItems.map((i) => i.id) }),
            });
            showToast("Order saved", "success");
        } catch {
            showToast("Failed to reorder", "error");
            fetchItems();
        }
        setDraggedItemId(null);
        setDragOverItemId(null);
    }

    async function removeItem(id: string) {
        const ok = await confirm({ title: "Delete Item", message: "This catering item will be permanently removed.", confirmLabel: "Delete", variant: "danger" });
        if (!ok) return;
        const res = await fetch(`/api/admin/catering-items/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Item deleted", "success");
            fetchItems();
        }
    }

    async function toggleAvailable(item: CateringItem) {
        await fetch(`/api/admin/catering-items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
        fetchItems();
    }

    async function addCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setIsSavingCat(true);
        const res = await fetch("/api/admin/catering-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCatName, subtitle: newCatSubtitle }),
        });
        if (res.ok) {
            setNewCatName("");
            setNewCatSubtitle("");
            fetchCategories();
            showToast("Category added", "success");
        }
        setIsSavingCat(false);
    }

    async function deleteCategory(id: string) {
        const ok = await confirm({ title: "Delete Category", message: "This category will be permanently removed.", confirmLabel: "Delete", variant: "danger" });
        if (!ok) return;
        const res = await fetch(`/api/admin/catering-categories/${id}`, { method: "DELETE" });
        if (res.ok) {
            fetchCategories();
            showToast("Category deleted", "success");
        }
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-12 text-white">
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg text-sm font-semibold transition-all ${toast.type === "error" ? "bg-red-500" : "bg-orange-500 text-black"}`}>
                    {toast.msg}
                </div>
            )}

            <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Catering Menu Management</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage categories and items for your catering services</p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 p-4 rounded-3xl backdrop-blur-md">
                    <CateringAvailabilityToggle initialEnabled={cateringEnabled} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form */}
                <div className="xl:col-span-1">
                    <form onSubmit={saveItem} className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 space-y-6 backdrop-blur-xl">
                        <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 border-b border-white/5 pb-4">
                            {editingId ? "Edit Catering Item" : "Add New Item"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="item-name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Item Name</label>
                                <input id="item-name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition placeholder:text-gray-700" placeholder="e.g. Samosa Platter" />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="item-category" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Category</label>
                                    <div className="flex gap-2">
                                        <select id="item-category" value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition appearance-none">
                                            {categories.map((c) => (<option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>))}
                                        </select>
                                        <button type="button" onClick={() => setIsCatModalOpen(true)} className="px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-[10px] font-black uppercase tracking-widest text-gray-400">Manage</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500/60 mb-4 block italic">Pricing Structure</label>
                                
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { id: "PER_PERSON", label: "Per Person", icon: "👤" },
                                        { id: "TRAY", label: "Half/Full Tray", icon: "🍱" },
                                        { id: "FIXED", label: "Fixed Price", icon: "💰" }
                                    ].map(kind => (
                                        <button
                                            key={kind.id}
                                            type="button"
                                            onClick={() => setPriceKind(kind.id as PriceKind)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${priceKind === kind.id ? "bg-orange-500/10 border-orange-500 text-white" : "bg-black/20 border-white/5 text-gray-500 hover:border-white/20"}`}
                                        >
                                            <span className="text-lg">{kind.icon}</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{kind.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {priceKind === "PER_PERSON" && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label htmlFor="amount-pp" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Price ($)</label>
                                            <input id="amount-pp" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" />
                                        </div>
                                        <div>
                                            <label htmlFor="min-people" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Min People</label>
                                            <input id="min-people" type="number" value={minPeople} onChange={(e) => setMinPeople(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" />
                                        </div>
                                    </div>
                                )}

                                {priceKind === "TRAY" && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label htmlFor="half-tray" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Half Tray ($)</label>
                                            <input id="half-tray" type="number" step="0.01" value={halfPrice} onChange={(e) => setHalfPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition border-orange-500/20" placeholder="e.g. 45" />
                                        </div>
                                        <div>
                                            <label htmlFor="full-tray" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Full Tray ($)</label>
                                            <input id="full-tray" type="number" step="0.01" value={fullPrice} onChange={(e) => setFullPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition border-orange-500/20" placeholder="e.g. 80" />
                                        </div>
                                    </div>
                                )}

                                {priceKind === "FIXED" && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label htmlFor="amount-fixed" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Amount ($)</label>
                                            <input id="amount-fixed" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" />
                                        </div>
                                        <div>
                                            <label htmlFor="unit" className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 block">Unit</label>
                                            <input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" placeholder="e.g. dozen" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition resize-none" placeholder="Special notes or what's included..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-2">
                                <CustomCheckbox 
                                    label="Veg" 
                                    checked={isVeg} 
                                    onChange={setIsVeg} 
                                />
                                <CustomCheckbox 
                                    label="Spicy" 
                                    checked={isSpicy} 
                                    onChange={setIsSpicy} 
                                />
                                <CustomCheckbox 
                                    label="Popular" 
                                    checked={isPopular} 
                                    onChange={setIsPopular} 
                                />
                                <CustomCheckbox 
                                    label="Available" 
                                    checked={isAvailable} 
                                    onChange={setIsAvailable} 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {editingId && (
                                <button type="button" onClick={resetForm} className="flex-1 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 transition">
                                    Cancel
                                </button>
                            )}
                            <button disabled={isSaving} className="flex-[2] bg-orange-500 hover:bg-orange-400 transition text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50">
                                {isSaving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl">
                        <div className="flex-1 relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input placeholder="Search catering menu..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-white/20 transition" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filter:</span>
                            <select title="Filter by Category" value={fCategory} onChange={(e) => setFCategory(e.target.value)} className="bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold outline-none appearance-none cursor-pointer">
                                <option value="All" className="bg-neutral-900">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-white/10 bg-black/20 overflow-hidden backdrop-blur-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <tr>
                                        <th className="px-8 py-6">Item</th>
                                        <th className="px-6 py-6">Category</th>
                                        <th className="px-6 py-6">Pricing</th>
                                        <th className="px-6 py-6 text-center">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">Loading items...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={5} className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">No items found</td></tr>
                                    ) : (
                                        items.map(it => {
                                            const isDragging = draggedItemId === it.id;
                                            const isOver = dragOverItemId === it.id && !isDragging;
                                            return (
                                                <tr key={it.id}
                                                    draggable={fCategory !== "All"}
                                                    onDragStart={() => setDraggedItemId(it.id)}
                                                    onDragOver={e => { e.preventDefault(); setDragOverItemId(it.id); }}
                                                    onDrop={() => handleDrop(it.id)}
                                                    className={`transition-all duration-200 ${isDragging ? "opacity-30 bg-white/10" : "hover:bg-white/[0.02]"} ${isOver ? "border-t-2 border-orange-500" : ""} ${editingId === it.id ? "bg-orange-500/5 border-l-4 border-orange-500" : ""}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold text-white tracking-tight">{it.name}</div>
                                                        <div className="text-[10px] text-gray-500 max-w-[240px] truncate uppercase font-medium mt-1">{it.description || "No description"}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400">
                                                            {it.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold">
                                                        {it.priceKind === "PER_PERSON" ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-orange-500">{money(it.amount)}/pp</span>
                                                                <span className="text-[9px] text-gray-600 font-black uppercase">Min {it.minPeople}</span>
                                                            </div>
                                                        ) : it.priceKind === "TRAY" ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-gray-600 font-black uppercase">Half</span>
                                                                    <span className="text-orange-500">{money(it.halfPrice)}</span>
                                                                </div>
                                                                <div className="w-px h-6 bg-white/10" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-gray-600 font-black uppercase">Full</span>
                                                                    <span className="text-orange-500">{money(it.fullPrice)}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="text-orange-500">{money(it.amount)}</span>
                                                                <span className="text-[9px] text-gray-600 font-black uppercase">Per {it.unit || "unit"}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <button 
                                                            onClick={() => toggleAvailable(it)} 
                                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${it.isAvailable ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
                                                        >
                                                            {it.isAvailable ? "Live" : "Hidden"}
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => startEdit(it)} 
                                                                className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition group"
                                                                title="Edit Item"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <LottieDeleteButton 
                                                                onClick={() => removeItem(it.id)}
                                                                className="hover:!bg-red-500/10"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Manage Categories</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-500 hover:text-white transition-colors">&times;</button>
                        </div>

                        <form onSubmit={addCategory} className="mb-10 space-y-5">
                            <div>
                                <label htmlFor="new-cat-name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Category Name</label>
                                <input id="new-cat-name" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" placeholder="e.g. Appetizers" />
                            </div>
                            <div>
                                <label htmlFor="new-cat-subtitle" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Subtitle (Optional)</label>
                                <input id="new-cat-subtitle" value={newCatSubtitle} onChange={(e) => setNewCatSubtitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition" placeholder="e.g. Great for large groups" />
                            </div>
                            <button disabled={isSavingCat} className="w-full bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-orange-400 transition shadow-xl shadow-orange-500/20">
                                {isSavingCat ? "Saving..." : "Add Category"}
                            </button>
                        </form>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/20 transition-all">
                                    <div>
                                        <div className="font-bold text-sm text-white">{c.name}</div>
                                        {c.subtitle && <div className="text-[9px] text-gray-600 font-black uppercase mt-0.5">{c.subtitle}</div>}
                                    </div>
                                    <button onClick={() => deleteCategory(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

