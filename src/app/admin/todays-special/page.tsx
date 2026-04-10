"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface SpecialDish {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    isActive: boolean;
    isVeg: boolean;
    isNonVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    sortOrder: number;
}

export default function TodaysSpecialAdminPage() {
    const { confirm } = useConfirm();
    const [specials, setSpecials] = useState<SpecialDish[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [editingItem, setEditingItem] = useState<Partial<SpecialDish> | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchSpecials = async () => {
        try {
            const res = await fetch("/api/admin/todays-special");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSpecials(data);
            } else if (data.error) {
                setMessage("API Error: " + data.error);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setMessage("Connection Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecials();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingItem) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setEditingItem({ ...editingItem, imageUrl: data.url });
            } else {
                setMessage("Upload failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Upload Error:", error);
            setMessage("Error uploading file.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setSaving(true);
        setMessage("");

        try {
            const isNew = !editingItem.id;
            const res = await fetch("/api/admin/todays-special", {
                method: isNew ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingItem)
            });

            if (res.ok) {
                setMessage(isNew ? "Successfully added!" : "Successfully updated!");
                setEditingItem(null);
                fetchSpecials();
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("Failed to save.");
            }
        } catch (error) {
            console.error("Save Error:", error);
            setMessage("Error saving changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({ title: "Delete Special", message: "This dish will be removed from Today's Special.", confirmLabel: "Delete", variant: "danger" });
        if (!ok) return;
        try {
            const res = await fetch(`/api/admin/todays-special?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchSpecials();
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 font-medium lowercase tracking-widest">Loading specials...</div>;

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <div className="mb-10 flex items-end justify-between">
                <div>
                    <Link href="/admin" className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-orange-400 transition mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Today&apos;s Specials</h1>
                    <p className="mt-2 text-gray-500 uppercase text-[10px] font-black tracking-[0.2em]">Manage your featured daily dishes</p>
                </div>
                <button
                    onClick={() => setEditingItem({ name: "", description: "", priceCents: 0, imageUrl: "", isActive: true, isVeg: false, isNonVeg: false, isSpicy: false, isPopular: false })}
                    className="bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-full hover:bg-orange-400 transition transform active:scale-95"
                >
                    Add New Special
                </button>
            </div>

            {message && (
                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center">
                    <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">{message}</span>
                </div>
            )}

            {editingItem && (
                <div className="mb-12 bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <h2 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-4 uppercase tracking-widest text-[12px]">
                        {editingItem.id ? "Edit Special" : "New Special"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    value={editingItem.name || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition"
                                    placeholder="e.g. Special Lamb Curry"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Price (Cents)</label>
                                <input
                                    type="number"
                                    value={editingItem.priceCents || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, priceCents: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition"
                                    placeholder="1500 for $15.00"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                            <textarea
                                value={editingItem.description || ""}
                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition h-24"
                                placeholder="Briefly describe the special..."
                            />
                        </div>

                        <div className="flex flex-wrap gap-6 border-y border-white/5 py-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={editingItem.isVeg || false} onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition">Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={editingItem.isNonVeg || false} onChange={(e) => setEditingItem({ ...editingItem, isNonVeg: e.target.checked })} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition">Non-Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={editingItem.isSpicy || false} onChange={(e) => setEditingItem({ ...editingItem, isSpicy: e.target.checked })} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition">Spicy</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={editingItem.isPopular || false} onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })} className="rounded border-white/10 bg-black/40 w-4 h-4 cursor-pointer" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition">Popular</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Image URL / Upload</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editingItem.imageUrl || ""}
                                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition text-sm"
                                        placeholder="Enter URL or upload below..."
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {uploading ? "Uploading..." : "Upload Photo"}
                                            </span>
                                        </label>
                                        {editingItem.imageUrl && (
                                            <div className="h-11 w-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                                                <Image src={editingItem.imageUrl} alt="Preview" fill unoptimized className="object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                                <select
                                    title="Today's Special Status"
                                    value={editingItem.isActive ? "true" : "false"}
                                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.value === "true" })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition"
                                >
                                    <option value="true">Active (Visible)</option>
                                    <option value="false">Inactive (Hidden)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] px-10 py-5 rounded-full hover:bg-orange-400 transition"
                            >
                                {saving ? "Saving..." : "Save Special"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="text-gray-400 font-black uppercase tracking-widest text-[10px] px-10 py-5 rounded-full hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {specials.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                        <p className="text-gray-500 font-medium lowercase tracking-widest">No specials found. Add your first one!</p>
                    </div>
                ) : (
                    specials.map((s) => (
                        <div key={s.id} className="group bg-white/[0.02] border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:bg-white/[0.04] transition">
                            <div className="flex items-center gap-6">
                                {s.imageUrl ? (
                                    <div className="h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                        <Image src={s.imageUrl} alt={s.name} fill unoptimized className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-600">No Image</div>
                                )}
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-white">{s.name}</h3>
                                        <div className="flex gap-1.5">
                                            {s.isVeg && <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Vegetarian" />}
                                            {s.isNonVeg && <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Non-Vegetarian" />}
                                            {s.isSpicy && <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" title="Spicy" />}
                                        </div>
                                        {!s.isActive && (
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">{s.description || "No description"}</p>
                                    <p className="text-sm font-black text-orange-500 mt-1">${(s.priceCents / 100).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingItem(s)}
                                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
