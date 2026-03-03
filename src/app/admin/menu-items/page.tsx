"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    category: string;
    isVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
};

const CATEGORIES = ["Starters", "Mains", "Wraps", "Drinks", "Dessert"];
const TAG_OPTIONS = ["Veg", "Spicy", "Popular", "Drink"];

export default function AdminMenuItemsPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("499");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [isVeg, setIsVeg] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const [isPopular, setIsPopular] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);

    const router = useRouter();

    async function load() {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/menu-items");
        if (res.status === 401) {
            router.push("/admin/login");
            return;
        }
        const data = await res.json();
        setItems(data.items || []);
        setLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const priceCents = useMemo(() => {
        const n = Number(price);
        return Number.isFinite(n) ? n : 0;
    }, [price]);

    async function createItem() {
        setError(null);
        const res = await fetch("/api/admin/menu-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                priceCents,
                imageUrl,
                category,
                isVeg,
                isSpicy,
                isPopular,
                isAvailable,
            }),
        });

        if (res.status === 401) return router.push("/admin/login");
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to create");
            return;
        }

        setName("");
        setDescription("");
        setPrice("499");
        setImageUrl("");
        setCategory(CATEGORIES[0]);
        setIsVeg(false);
        setIsSpicy(false);
        setIsPopular(false);
        setIsAvailable(true);

        await load();
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this item?")) return;
        const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
        if (res.status === 401) return router.push("/admin/login");
        await load();
    }

    async function logout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    }

    const inputStyle = { width: "100%", padding: 10, color: "black", borderRadius: 6 };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
            {/* Side menu */}
            <aside style={{ borderRight: "1px solid #222", padding: 16 }}>
                <h2 style={{ marginTop: 0 }}>Admin</h2>
                <nav style={{ display: "grid", gap: 12, marginTop: 24 }}>
                    <a href="/admin/menu-items" style={{ color: "orange" }}>Menu Items</a>
                    <a href="/admin/orders" style={{ opacity: 0.5, pointerEvents: "none" }}>
                        Orders (next)
                    </a>
                    <a href="/admin/drivers" style={{ opacity: 0.5, pointerEvents: "none" }}>
                        Drivers (next)
                    </a>
                </nav>

                <button onClick={logout} style={{ marginTop: 32, padding: 10, width: "100%", background: "#333" }}>
                    Logout
                </button>
            </aside>

            {/* Main */}
            <main style={{ padding: "18px 32px" }}>
                <h1 style={{ marginTop: 0 }}>Menu Items</h1>

                {/* Create form */}
                <div style={{ border: "1px solid #333", padding: 24, borderRadius: 10, maxWidth: 820, background: "#111" }}>
                    <h3 style={{ marginTop: 0 }}>Add New Item</h3>

                    <div style={{ display: "grid", gap: 14 }}>
                        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                        <textarea
                            style={inputStyle}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (Optional)"
                            rows={3}
                        />
                        <input
                            style={inputStyle}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price in cents (e.g., 799)"
                        />
                        <input
                            style={inputStyle}
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Image URL (optional)"
                        />

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                            <label>Category:</label>
                            <select style={{ padding: "6px 12px", color: "black" }} value={category} onChange={(e) => setCategory(e.target.value)}>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            <label style={{ marginLeft: 20 }}>
                                <input
                                    type="checkbox"
                                    checked={isAvailable}
                                    onChange={(e) => setIsAvailable(e.target.checked)}
                                />{" "}
                                Available
                            </label>
                        </div>

                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} />
                                Veg
                            </label>
                            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input type="checkbox" checked={isSpicy} onChange={(e) => setIsSpicy(e.target.checked)} />
                                Spicy
                            </label>
                            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} />
                                Popular
                            </label>
                        </div>

                        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                        <button onClick={createItem} style={{ padding: 12, marginTop: 16, background: "orange", color: "black", fontWeight: "bold", borderRadius: 8 }}>
                            Add Item
                        </button>
                    </div>
                </div>

                {/* List */}
                <div style={{ marginTop: 32 }}>
                    <h3>All Items</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : items.length === 0 ? (
                        <p>No items yet.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {items.map((i) => (
                                <div
                                    key={i.id}
                                    style={{
                                        border: "1px solid #333",
                                        background: "#111",
                                        borderRadius: 10,
                                        padding: 16,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                                        {i.imageUrl && (
                                            <div style={{ width: 80, height: 80, position: "relative" }}>
                                                <Image
                                                    src={i.imageUrl}
                                                    alt={i.name}
                                                    fill
                                                    style={{ objectFit: "cover", borderRadius: 8 }}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <b style={{ fontSize: "1.2rem" }}>{i.name}</b>{" "}
                                            {!i.isAvailable && <span style={{ color: "red", fontSize: "0.8rem", marginLeft: 8 }}>(UNAVAILABLE)</span>}
                                            <div style={{ opacity: 0.6, fontSize: "0.9rem", marginTop: 4 }}>{i.description || "No description"}</div>
                                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                                <span style={{ fontSize: "0.8rem", background: "#333", padding: "2px 8px", borderRadius: 4 }}>{i.category}</span>
                                                <span style={{ fontSize: "0.8rem", background: "orange", color: "black", padding: "2px 8px", borderRadius: 4 }}>
                                                    ${(i.priceCents / 100).toFixed(2)}
                                                </span>
                                            </div>
                                            <div style={{ opacity: 0.6, fontSize: "0.8rem", marginTop: 8 }}>
                                                Tags: {[i.isVeg && "Veg", i.isSpicy && "Spicy", i.isPopular && "Popular"].filter(Boolean).join(", ") || "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteItem(i.id)} style={{ padding: "8px 16px", background: "#ff4444", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
