"use client";

import { useEffect, useMemo, useState } from "react";

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    category: string;
    isVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
    imageUrl: string | null;
};

const CATEGORIES = ["Starters", "Mains", "Wraps", "Drinks", "Dessert"];

export default function AdminMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        priceCents: 0,
        category: "Starters",
        isVeg: false,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        imageUrl: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/admin/menu-items", { cache: "no-store" });
        const data = await res.json();
        setItems(data.items || []);
        setLoading(false);
    }

    useEffect(() => {
        (async () => {
            await load();
        })();
    }, []);

    const totalCount = useMemo(() => items.length, [items]);
    const availableCount = useMemo(() => items.filter((i) => i.isAvailable).length, [items]);

    async function createOrUpdate() {
        setSaving(true);

        const payload = {
            ...form,
            description: form.description?.trim() ? form.description : null,
            imageUrl: form.imageUrl?.trim() ? form.imageUrl : null,
            priceCents: Number(form.priceCents),
        };

        const res = await fetch(editingId ? `/api/admin/menu-items/${editingId}` : "/api/admin/menu-items", {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            alert("Save failed. Check fields and try again.");
            return;
        }

        setEditingId(null);
        setForm({
            name: "",
            description: "",
            priceCents: 0,
            category: "Starters",
            isVeg: false,
            isSpicy: false,
            isPopular: false,
            isAvailable: true,
            imageUrl: "",
        });
        await load();
    }

    function startEdit(item: MenuItem) {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description ?? "",
            priceCents: item.priceCents,
            category: item.category,
            isVeg: item.isVeg,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl ?? "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function remove(id: string) {
        if (!confirm("Delete this item?")) return;
        const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
        if (!res.ok) {
            alert("Delete failed");
            return;
        }
        await load();
    }

    async function toggleAvailable(item: MenuItem) {
        const res = await fetch(`/api/admin/menu-items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
        });
        if (!res.ok) {
            alert("Update failed");
            return;
        }
        await load();
    }

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Menu Admin</h1>
                    <p className="mt-1 text-sm opacity-80">
                        Total: {totalCount} • Available: {availableCount}
                    </p>
                </div>
            </div>

            {/* Editor */}
            <div className="mt-6 rounded-2xl border border-white/10 p-5 bg-white/5">
                <h2 className="text-lg font-semibold">{editingId ? "Edit Item" : "Add New Item"}</h2>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                        className="rounded-xl border border-white/10 px-4 py-3 bg-black text-white"
                        placeholder="Name (e.g., Samosa)"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />

                    <select
                        className="rounded-xl border border-white/10 px-4 py-3 bg-black text-white"
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <input
                        className="rounded-xl border border-white/10 px-4 py-3 bg-black text-white"
                        type="number"
                        placeholder="Price in cents (e.g., 800)"
                        value={form.priceCents}
                        onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
                    />

                    <input
                        className="rounded-xl border border-white/10 px-4 py-3 bg-black text-white"
                        placeholder="Image URL (optional)"
                        value={form.imageUrl}
                        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    />

                    <textarea
                        className="md:col-span-2 rounded-xl border border-white/10 px-4 py-3 bg-black text-white"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {[
                        ["Veg", "isVeg"],
                        ["Spicy", "isSpicy"],
                        ["Popular", "isPopular"],
                        ["Available", "isAvailable"],
                    ].map(([label, key]) => (
                        <label key={key} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form[key as keyof typeof form] as boolean}
                                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                            />
                            {label}
                        </label>
                    ))}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        className="rounded-xl bg-orange-500 font-bold px-4 py-3 text-black disabled:opacity-60 transition hover:bg-orange-600"
                        disabled={saving || !form.name || !form.category}
                        onClick={createOrUpdate}
                    >
                        {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
                    </button>

                    {editingId && (
                        <button
                            className="rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5 transition"
                            onClick={() => {
                                setEditingId(null);
                                setForm({
                                    name: "",
                                    description: "",
                                    priceCents: 0,
                                    category: "Starters",
                                    isVeg: false,
                                    isSpicy: false,
                                    isPopular: false,
                                    isAvailable: true,
                                    imageUrl: "",
                                });
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold">All Items</h2>

                {loading ? (
                    <div className="mt-3 opacity-70">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="mt-3 opacity-70">No items yet. Add your first menu item above.</div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                        {items.map((i) => (
                            <div key={i.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-lg">
                                            {i.name}{" "}
                                            <span className="text-sm opacity-70 font-normal">
                                                • ${(i.priceCents / 100).toFixed(2)} • {i.category}
                                            </span>
                                        </div>
                                        {i.description && <div className="mt-1 text-sm opacity-80">{i.description}</div>}

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            {i.isVeg && <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">Veg</span>}
                                            {i.isSpicy && <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">Spicy</span>}
                                            {i.isPopular && <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">Popular</span>}
                                            <span className={`rounded-full border border-white/20 px-3 py-1 ${i.isAvailable ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {i.isAvailable ? "Available" : "Hidden"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition" onClick={() => toggleAvailable(i)}>
                                            {i.isAvailable ? "Hide" : "Show"}
                                        </button>
                                        <button className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition" onClick={() => startEdit(i)}>
                                            Edit
                                        </button>
                                        <button className="rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm transition" onClick={() => remove(i.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
