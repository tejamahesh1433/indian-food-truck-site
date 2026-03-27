"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CateringAvailabilityToggle from "../ui/CateringAvailabilityToggle";
import { useConfirm } from "@/components/ui/ConfirmDialog";

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
    // form state
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
    const [isAvailable] = useState(true);

    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cateringEnabled, setCateringEnabled] = useState(true);

    // list state
    const [items, setItems] = useState<CateringItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // category manager state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatSubtitle, setNewCatSubtitle] = useState("");
    const [isSavingCat, setIsSavingCat] = useState(false);

    // filters
    const [q, setQ] = useState("");
    const [fCategory, setFCategory] = useState<string>("All");


    // drag to reorder
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

    async function fetchItems() {
        setLoading(true);
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (fCategory !== "All") params.set("category", fCategory);

        const res = await fetch(`/api/admin/catering-items?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.ok) setItems(data.items || []);
        setLoading(false);
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

            // Also fetch site settings for catering toggle
            const sRes = await fetch("/api/admin/settings");
            const sData = await sRes.json();
            if (sData.ok || sData.cateringEnabled !== undefined) {
                // The API might return the settings object or the fields directly depending on implementation
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchItems(), 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, fCategory]);

    async function addItem(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return showToast("Name is required", "error");
        if (!category) return showToast("Category is required", "error");

        setIsSaving(true);
        const res = await fetch("/api/admin/catering-items", {
            method: "POST",
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
        if (!data.ok) return showToast(data.error || "Failed to add item", "error");

        showToast("Item added successfully!", "success");
        setName("");
        setDescription("");
        setAmount("");
        setMinPeople("");
        setUnit("");
        setHalfPrice("");
        setFullPrice("");
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
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-semibold transition ${toast.type === "error" ? "bg-red-500" : "bg-green-500 text-black"}`}>
                    {toast.msg}
                </div>
            )}

            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block">
                ← Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2">Catering Menu Management</h1>
                <p className="text-gray-400 text-sm">Manage categories and items for the professional catering menu.</p>
                <div className="max-w-md mt-6">
                    <CateringAvailabilityToggle initialEnabled={cateringEnabled} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form */}
                <div className="xl:col-span-1">
                    <form onSubmit={addItem} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                        <h2 className="text-lg font-medium">Add New Catering Item</h2>

                        <div>
                            <label htmlFor="item-name" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</label>
                            <input id="item-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                        </div>

                        <div>
                            <label htmlFor="item-category" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
                            <div className="flex gap-2 items-center">
                                <select id="item-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition appearance-none">
                                    {categories.map((c) => (<option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>))}
                                </select>
                                <button type="button" onClick={() => setIsCatModalOpen(true)} className="mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-xs">Manage</button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="price-kind" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price Kind</label>
                            <select id="price-kind" value={priceKind} onChange={(e) => setPriceKind(e.target.value as PriceKind)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition appearance-none">
                                <option value="PER_PERSON" className="bg-neutral-900">Per Person</option>
                                <option value="TRAY" className="bg-neutral-900">Tray (Half/Full)</option>
                                <option value="FIXED" className="bg-neutral-900">Fixed Price</option>
                            </select>
                        </div>

                        {priceKind === "PER_PERSON" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount-pp" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Amount ($)</label>
                                    <input id="amount-pp" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                                <div>
                                    <label htmlFor="min-people" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Min People</label>
                                    <input id="min-people" type="number" value={minPeople} onChange={(e) => setMinPeople(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                            </div>
                        )}

                        {priceKind === "TRAY" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="half-tray" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Half Tray ($)</label>
                                    <input id="half-tray" type="number" value={halfPrice} onChange={(e) => setHalfPrice(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                                <div>
                                    <label htmlFor="full-tray" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Tray ($)</label>
                                    <input id="full-tray" type="number" value={fullPrice} onChange={(e) => setFullPrice(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                            </div>
                        )}

                        {priceKind === "FIXED" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount-fixed" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Amount ($)</label>
                                    <input id="amount-fixed" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                                <div>
                                    <label htmlFor="unit" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Unit (e.g. dozen)</label>
                                    <input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="description" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-medium">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} className="rounded bg-black/40 border-white/10" />
                                <span className="text-gray-400 group-hover:text-white transition">Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isSpicy} onChange={(e) => setIsSpicy(e.target.checked)} className="rounded bg-black/40 border-white/10" />
                                <span className="text-gray-400 group-hover:text-white transition">Spicy</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded bg-black/40 border-white/10" />
                                <span className="text-gray-400 group-hover:text-white transition">Popular</span>
                            </label>
                        </div>

                        <button disabled={isSaving} className="w-full bg-orange-500 hover:bg-orange-400 transition text-black font-bold py-3 rounded-xl disabled:opacity-50">
                            {isSaving ? "Saving..." : "Add Item"}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex gap-4 items-center bg-black/50 border border-white/10 rounded-2xl p-4">
                        <div className="flex-1">
                            <input placeholder="Search items..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                        </div>
                        <select title="Filter by Category" value={fCategory} onChange={(e) => setFCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none">
                            <option value="All" className="bg-neutral-900">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>)}
                        </select>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Pricing</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-gray-500">Loading items...</td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-gray-500">No items found</td></tr>
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
                                                className={`transition ${isDragging ? "opacity-30 bg-white/10" : "hover:bg-white/[0.02]"} ${isOver ? "border-t-2 border-orange-500" : ""}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{it.name}</div>
                                                    <div className="text-xs text-gray-500 max-w-[200px] truncate">{it.description}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{it.category}</td>
                                                <td className="px-6 py-4">
                                                    {it.priceKind === "PER_PERSON" ? `${money(it.amount)}/p (min ${it.minPeople})` :
                                                        it.priceKind === "TRAY" ? `H:${money(it.halfPrice)} F:${money(it.fullPrice)}` :
                                                            `${money(it.amount)}/${it.unit || "unit"}`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => toggleAvailable(it)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${it.isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-500"}`}>
                                                        {it.isAvailable ? "Available" : "Hidden"}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => removeItem(it.id)} className="text-gray-500 hover:text-red-400 transition">Delete</button>
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

            {/* Category Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Manage Categories</h2>
                            <button onClick={() => setIsCatModalOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>

                        <form onSubmit={addCategory} className="mb-8 space-y-4">
                            <div>
                                <label htmlFor="new-cat-name" className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category Name</label>
                                <input id="new-cat-name" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" />
                            </div>
                            <div>
                                <label htmlFor="new-cat-subtitle" className="text-xs text-gray-400 font-medium uppercase tracking-wider">Subtitle (Optional)</label>
                                <input id="new-cat-subtitle" value={newCatSubtitle} onChange={(e) => setNewCatSubtitle(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition" placeholder="e.g. Spice level available..." />
                            </div>
                            <button disabled={isSavingCat} className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition">Add Category</button>
                        </form>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {categories.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 group">
                                    <div>
                                        <div className="font-medium text-sm">{c.name}</div>
                                        <div className="text-[10px] text-gray-500">{c.subtitle}</div>
                                    </div>
                                    <button onClick={() => deleteCategory(c.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
