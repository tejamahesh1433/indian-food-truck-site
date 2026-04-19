"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface SavedLocationsSectionProps {
    locations: any[];
}

export default function SavedLocationsSection({
    locations,
}: SavedLocationsSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, address }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Location added successfully!");
                setName("");
                setAddress("");
                setShowForm(false);
                router.refresh(); // Refresh page data
            } else {
                toast.error(data.error || "Failed to add location");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black italic tracking-tighter uppercase text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📍</span>
                Saved Locations
            </h3>

            {showForm ? (
                <form onSubmit={handleAddLocation} className="mb-4 space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Name (e.g. Home)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                            placeholder="Home, Office, Girlfriend's Place..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Street Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                            placeholder="123 Samosa Lane, Hartford, CT"
                            required
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Save Location"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white text-xs font-bold rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : null}

            {!showForm && locations.length === 0 ? (
                <div className="py-8 text-center rounded-xl border border-dashed border-white/10 bg-white/5">
                    <p className="text-sm text-gray-500 mb-4">No saved locations</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                    >
                        + Add location
                    </button>
                </div>
            ) : !showForm ? (
                <div className="space-y-3">
                    {locations.map((loc) => (
                        <div
                            key={loc.id}
                            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-orange-500/30 transition flex justify-between items-center group"
                        >
                            <div>
                                <p className="font-bold text-white text-sm group-hover:text-orange-400 transition">{loc.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{loc.address}</p>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full mt-3 py-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition border border-dashed border-orange-500/30 rounded-lg"
                    >
                        + Add location
                    </button>
                </div>
            ) : null}
        </section>
    );
}
