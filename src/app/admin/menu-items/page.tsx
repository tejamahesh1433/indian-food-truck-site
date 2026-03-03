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
    }, [q, fCategory, fVeg, fSpicy, fPopular, fAvailability]);

    const totals = useMemo(() => {
        const total = items.length;
        const available = items.filter((i) => i.isAvailable).length;
        return { total, available };
    }, [items]);

    async function addItem(e: React.FormEvent) {
        e.preventDefault();

        const p = Number(price);
        if (!name.trim()) return alert("Name is required");
        if (!Number.isFinite(p) || p < 0) return alert("Price must be a number >= 0");

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
            }),
        });

        const data = await res.json();
        if (!data.ok) return alert(data.error || "Failed to add item");

        // reset
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setIsVeg(false);
        setIsSpicy(false);
        setIsPopular(false);
        setIsAvailable(true);

        fetchItems();
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
        if (!data.ok) return alert(data.error || "Failed to update item");

        setEditingId(null);
        setEditDraft({});
        fetchItems();
    }

    async function removeItem(id: string) {
        const perform = window.confirm("Delete this menu item entirely? This action cannot be reversed.");
        if (!perform) return;
        const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.ok) return alert(data.error || "Failed to delete item");
        fetchItems();
    }

    async function toggleAvailability(item: MenuItem) {
        await fetch(`/api/admin/menu-items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
        });
        fetchItems();
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Menu Management</h1>
                    <p className="text-sm text-gray-400">
                        Total items: {totals.total} • Available: {totals.available}
                    </p>
                </div>
            </div>

            {/* Add form */}
            <form onSubmit={addItem} className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 text-sm shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-medium">Add New Menu Item</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">Name</label>
                        <input
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
                        <label className="text-sm font-medium text-gray-300">Price ($)</label>
                        <input
                            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition placeholder-gray-600"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            inputMode="decimal"
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
                        <span className="text-gray-300 group-hover:text-white transition">Available in POS</span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <button className="rounded-xl bg-orange-500 hover:bg-orange-400 transition text-black font-semibold px-6 py-2.5">Add to Menu</button>
                </div>
            </form>

            {/* Filters */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-6 mb-6">
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
                    <div className="p-10 text-center text-sm text-gray-500">Syncing with POS...</div>
                ) : items.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No menu items matched your query.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name & Desc</th>
                                    <th className="px-6 py-4 font-medium">Image URL</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Price</th>
                                    <th className="px-6 py-4 font-medium">Tags</th>
                                    <th className="px-6 py-4 font-medium">POS Sync</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((it) => {
                                    const isEditing = editingId === it.id;
                                    return (
                                        <tr key={it.id} className="hover:bg-white/[0.02] transition">
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <input
                                                        className="w-full min-w-[200px] bg-black/40 border border-orange-500/50 rounded-lg px-3 py-1.5 outline-none mb-2"
                                                        value={(editDraft.name as string) ?? ""}
                                                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                                                    />
                                                ) : (
                                                    <div className="font-semibold text-white mb-1">{it.name}</div>
                                                )}
                                                <div className="text-xs text-gray-500 max-w-[250px] truncate whitespace-normal break-words line-clamp-2">
                                                    {isEditing ? (
                                                        <textarea
                                                            className="w-full min-w-[200px] bg-black/40 border border-orange-500/50 rounded-lg px-3 py-1.5 outline-none"
                                                            value={(editDraft.description as string) ?? ""}
                                                            onChange={(e) =>
                                                                setEditDraft((d) => ({ ...d, description: e.target.value }))
                                                            }
                                                            rows={2}
                                                        />
                                                    ) : (
                                                        it.description
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <input
                                                        className="w-32 bg-black/40 border border-orange-500/50 rounded-lg px-3 py-1.5 outline-none"
                                                        value={(editDraft.imageUrl as string) ?? ""}
                                                        onChange={(e) =>
                                                            setEditDraft((d) => ({ ...d, imageUrl: e.target.value }))
                                                        }
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs truncate max-w-[120px] inline-block" title={it.imageUrl || "None"}>
                                                        {it.imageUrl || "-"}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-300">
                                                {isEditing ? (
                                                    <select
                                                        className="w-32 bg-black/40 border border-orange-500/50 rounded-lg px-3 py-1.5 outline-none"
                                                        value={(editDraft.category as string) ?? ""}
                                                        onChange={(e) =>
                                                            setEditDraft((d) => ({ ...d, category: e.target.value }))
                                                        }
                                                    >
                                                        {CATEGORIES.map((c) => (
                                                            <option key={c} value={c} className="bg-neutral-900">{c}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    it.category
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-green-400">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-400">$</span>
                                                        <input
                                                            className="w-20 bg-black/40 border border-orange-500/50 rounded-lg px-3 py-1.5 outline-none text-white"
                                                            value={String(((editDraft.priceCents as number) ?? it.priceCents) / 100)}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setEditDraft((d) => ({
                                                                    ...d,
                                                                    priceCents: Number.isFinite(val) ? Math.round(val * 100) : it.priceCents,
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    money(it.priceCents)
                                                )}
                                            </td>

                                            <td className="px-6 py-4 w-40">
                                                <div className="flex flex-wrap gap-2">
                                                    {["Veg", "Spicy", "Popular"].map((t) => {
                                                        const key =
                                                            t === "Veg" ? "isVeg" : t === "Spicy" ? "isSpicy" : "isPopular";
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const val = (isEditing ? (editDraft as any)[key] : (it as any)[key]) as boolean;

                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const toggle = () => setEditDraft((d) => ({ ...d, [key]: !val })) as any;

                                                        const activeColors = t === 'Veg' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            t === 'Spicy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-orange-500/10 text-orange-400 border-orange-500/20';

                                                        const inactiveColors = 'bg-white/5 text-gray-500 border-white/10';

                                                        return (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition ${val ? activeColors : inactiveColors
                                                                    } ${!isEditing && !val ? 'opacity-40' : ''}`}
                                                                onClick={isEditing ? toggle : undefined}
                                                                disabled={!isEditing}
                                                                title={isEditing ? "Click to toggle" : ""}
                                                            >
                                                                {t}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${it.isAvailable ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                                        }`}
                                                    onClick={() => toggleAvailability(it)}
                                                >
                                                    {it.isAvailable ? "In Stock" : "Hidden"}
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="text-gray-400 hover:text-white transition font-medium"
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditDraft({});
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="bg-orange-500 hover:bg-orange-400 text-black px-4 py-1.5 rounded-lg font-semibold transition"
                                                                onClick={() => saveEdit(it.id)}
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="text-gray-400 hover:text-white transition font-medium"
                                                                onClick={() => beginEdit(it)}
                                                            >
                                                                Edit Item
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-red-400/70 hover:text-red-300 transition font-medium"
                                                                onClick={() => removeItem(it.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
