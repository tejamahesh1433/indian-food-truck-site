"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TimePicker from "@/components/TimePicker";

type StopForm = {
    todayLocation: string;
    todayStart: string;
    todayEnd: string;
    todayStatus: string;
    todayNotes: string;
    nextLocation: string;
    nextDate: string;
    nextStart: string;
    nextEnd: string;
    nextNotes: string;
};

type SavedLoc = {
    id: string;
    name: string;
    address?: string;
};

export default function AdminLocationsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
    const [savedLocs, setSavedLocs] = useState<SavedLoc[]>([]);
    const [lastPublished, setLastPublished] = useState<Date | null>(null);

    const [form, setForm] = useState<StopForm>({
        todayLocation: "",
        todayStart: "",
        todayEnd: "",
        todayStatus: "CLOSED",
        todayNotes: "",
        nextLocation: "",
        nextDate: "",
        nextStart: "",
        nextEnd: "",
        nextNotes: "",
    });

    const [initialForm, setInitialForm] = useState<StopForm | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [settingsRes, locsRes] = await Promise.all([
                    fetch("/api/admin/settings").catch(() => null),
                    fetch("/api/admin/saved-locations").catch(() => null)
                ]);

                if (settingsRes?.ok) {
                    const data = await settingsRes.json();
                    const f: StopForm = {
                        todayLocation: data.todayLocation || "",
                        todayStart: data.todayStart || "",
                        todayEnd: data.todayEnd || "",
                        todayStatus: data.todayStatus || "CLOSED",
                        todayNotes: data.todayNotes || "",
                        nextLocation: data.nextLocation || "",
                        nextDate: data.nextDate || "",
                        nextStart: data.nextStart || "",
                        nextEnd: data.nextEnd || "",
                        nextNotes: data.nextNotes || "",
                    };
                    setForm(f);
                    setInitialForm(f);
                    if (data.updatedAt) setLastPublished(new Date(data.updatedAt));
                }

                if (locsRes?.ok) {
                    setSavedLocs(await locsRes.json());
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const hasChanges = initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

    async function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault();

        // Advanced Validation
        if (form.todayLocation) {
            if (!form.todayStart || !form.todayEnd) {
                alert("Please set both Start and End times for Today's stop.");
                return;
            }
            if (form.todayEnd <= form.todayStart) {
                alert("Today's End time must be after Start time.");
                return;
            }
        }

        if (form.nextLocation) {
            if (!form.nextDate) {
                alert("Please set a Date for the Next stop.");
                return;
            }
            const todayStr = new Date().toISOString().split('T')[0];
            if (form.nextDate < todayStr) {
                alert("Next stop date cannot be in the past.");
                return;
            }
            if (form.nextStart && form.nextEnd && form.nextEnd <= form.nextStart) {
                alert("Next stop End time must be after Start time.");
                return;
            }
        }

        setSaving(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const data = await res.json();
                setStatus("saved");
                setInitialForm(form);
                setLastPublished(new Date());
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
        setSaving(false);
        setTimeout(() => setStatus("idle"), 3000);
    }

    async function addSavedLocation(name: string) {
        if (!name) return;
        const res = await fetch("/api/admin/saved-locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            const loc = await res.json();
            setSavedLocs([...savedLocs, loc]);
        }
    }

    async function deleteSavedLocation(id: string) {
        if (!confirm("Delete this location from history?")) return;
        const res = await fetch(`/api/admin/saved-locations/${id}`, { method: "DELETE" });
        if (res.ok) {
            setSavedLocs(savedLocs.filter(l => l.id !== id));
        }
    }

    const setNextToToday = () => {
        setForm({
            ...form,
            todayLocation: form.nextLocation,
            todayStart: form.nextStart,
            todayEnd: form.nextEnd,
            todayStatus: "SERVING",
            todayNotes: form.nextNotes,
            nextLocation: "",
            nextDate: "",
            nextStart: "",
            nextEnd: "",
            nextNotes: "",
        });
    };

    const swapTodayNext = () => {
        setForm({
            ...form,
            todayLocation: form.nextLocation,
            todayStart: form.nextStart,
            todayEnd: form.nextEnd,
            todayNotes: form.nextNotes,
            nextLocation: form.todayLocation,
            nextStart: form.todayStart,
            nextEnd: form.todayEnd,
            nextNotes: form.todayNotes,
        });
    };

    const clearToday = () => {
        setForm({ ...form, todayLocation: "", todayStart: "", todayEnd: "", todayStatus: "CLOSED", todayNotes: "" });
    }

    const clearNext = () => {
        setForm({ ...form, nextLocation: "", nextDate: "", nextStart: "", nextEnd: "", nextNotes: "" });
    }

    const applyPreset = (type: 'today' | 'next', preset: 'lunch' | 'dinner' | 'allday') => {
        const times = {
            lunch: { start: '12:00', end: '15:00' },
            dinner: { start: '17:00', end: '21:00' },
            allday: { start: '12:00', end: '18:00' },
        }[preset];

        if (type === 'today') setForm({ ...form, todayStart: times.start, todayEnd: times.end });
        else setForm({ ...form, nextStart: times.start, nextEnd: times.end });
    };

    if (loading) return <div className="p-10 text-white text-center">Loading Schedule...</div>;

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Side: Form */}
                <div className="flex-1 space-y-8">
                    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold">Schedule Manager</h1>
                            <p className="text-gray-400 text-sm">Update your truck's live status and upcoming stops.</p>
                        </div>
                        {lastPublished && (
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                Last published: {lastPublished.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </header>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Section: Today */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-3xl" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    Active: Today's Stop
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex gap-2">
                                        <button type="button" onClick={() => applyPreset('today', 'lunch')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 transition border border-white/5">Lunch</button>
                                        <button type="button" onClick={() => applyPreset('today', 'dinner')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 transition border border-white/5">Dinner</button>
                                        <button type="button" onClick={() => applyPreset('today', 'allday')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 transition border border-white/5">All Day</button>
                                    </div>
                                    <button type="button" onClick={clearToday} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-400 transition">Clear</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Location Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={form.todayLocation}
                                            onChange={e => setForm({ ...form, todayLocation: e.target.value })}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                            placeholder="e.g. Downtown Square"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addSavedLocation(form.todayLocation)}
                                            className="px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
                                            title="Save to History"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <TimePicker
                                        label="Start Time"
                                        value={form.todayStart}
                                        onChange={val => setForm({ ...form, todayStart: val })}
                                        showNow
                                    />
                                </div>
                                <div>
                                    <TimePicker
                                        label="End Time"
                                        value={form.todayEnd}
                                        onChange={val => setForm({ ...form, todayEnd: val })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Status</label>
                                    <select
                                        value={form.todayStatus}
                                        onChange={e => {
                                            const s = e.target.value;
                                            if (s === 'CLOSED') {
                                                setForm({ ...form, todayStatus: s, todayStart: '', todayEnd: '' });
                                            } else {
                                                setForm({ ...form, todayStatus: s });
                                            }
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-white"
                                    >
                                        <option value="SERVING" className="bg-neutral-900">Serving Now</option>
                                        <option value="ON_THE_WAY" className="bg-neutral-900">On the Way</option>
                                        <option value="SOLD_OUT" className="bg-neutral-900">Sold Out</option>
                                        <option value="WEATHER_DELAY" className="bg-neutral-900">Weather Delay</option>
                                        <option value="CLOSED" className="bg-neutral-900">Closed for the day</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px} font-bold uppercase tracking-widest text-gray-500 mb-2">Short Note (Optional)</label>
                                    <input
                                        value={form.todayNotes}
                                        onChange={e => setForm({ ...form, todayNotes: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                        placeholder="e.g. Parked near fountain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={setNextToToday}
                                className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                Move Next to Today
                            </button>
                            <button
                                type="button"
                                onClick={swapTodayNext}
                                className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                Swap Today / Next
                            </button>
                        </div>

                        {/* Section: Next */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative opacity-80 hover:opacity-100 transition">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    Upcoming: Next Stop
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex gap-2">
                                        <button type="button" onClick={() => applyPreset('next', 'lunch')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition border border-white/5">Lunch</button>
                                        <button type="button" onClick={() => applyPreset('next', 'dinner')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition border border-white/5">Dinner</button>
                                        <button type="button" onClick={() => applyPreset('next', 'allday')} className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition border border-white/5">All Day</button>
                                    </div>
                                    <button type="button" onClick={clearNext} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-400 transition">Clear</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Location Name</label>
                                    <input
                                        value={form.nextLocation}
                                        onChange={e => setForm({ ...form, nextLocation: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                        placeholder="e.g. Marina District"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={form.nextDate}
                                        onChange={e => setForm({ ...form, nextDate: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <TimePicker
                                            label="From"
                                            value={form.nextStart}
                                            onChange={val => setForm({ ...form, nextStart: val })}
                                        />
                                    </div>
                                    <div>
                                        <TimePicker
                                            label="To"
                                            value={form.nextEnd}
                                            onChange={val => setForm({ ...form, nextEnd: val })}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Short Note (Optional)</label>
                                    <input
                                        value={form.nextNotes}
                                        onChange={e => setForm({ ...form, nextNotes: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                        placeholder="e.g. Near the main entrance"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                disabled={saving || !hasChanges}
                                className="bg-orange-500 text-black px-10 py-4 rounded-2xl font-bold hover:bg-orange-400 transition disabled:opacity-30 shadow-xl shadow-orange-500/20 flex items-center gap-3"
                            >
                                {saving ? "Saving Changes..." : "Publish Schedule"}
                                {!saving && hasChanges && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                            </button>
                            {hasChanges && <span className="text-orange-400 text-xs font-bold uppercase tracking-widest animate-pulse">Unsaved Edits</span>}
                            {status === "saved" && <span className="text-green-400 text-sm font-medium animate-bounce">Saved & Published!</span>}
                            {status === "error" && <span className="text-red-400 text-sm font-medium">Failed to save.</span>}
                        </div>
                    </form>
                </div>

                {/* Right Side: Sidebar */}
                <div className="w-full lg:w-80 space-y-8">
                    {/* Public Preview */}
                    <div className="bg-black border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <svg className="w-20 h-20 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Website Preview</h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 flex items-center justify-between">
                                    Today
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-300">{form.todayStatus.replace(/_/g, " ")}</span>
                                </div>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(form.todayLocation || "Hartford, CT")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 text-sm font-bold block hover:text-orange-400 transition flex items-center gap-1.5"
                                >
                                    {form.todayLocation || "Unscheduled"}
                                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                                <div className="text-xs text-gray-400">{form.todayStart} - {form.todayEnd}</div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Next Stop</div>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(form.nextLocation || "Hartford, CT")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 text-sm font-bold block hover:text-blue-400 transition flex items-center gap-1.5"
                                >
                                    {form.nextLocation || "TBD"}
                                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                                <div className="text-xs text-gray-400">{form.nextDate} · {form.nextStart}</div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Locations / History */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Location History</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {savedLocs.length === 0 ? (
                                <p className="text-xs text-gray-600 italic">No saved locations yet.</p>
                            ) : (
                                savedLocs.map(loc => (
                                    <div key={loc.id} className="group relative">
                                        <div className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition">
                                            <div className="text-xs font-bold text-gray-200">{loc.name}</div>
                                            {loc.address && <div className="text-[10px] text-gray-500 truncate">{loc.address}</div>}

                                            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={() => setForm({ ...form, todayLocation: loc.name })}
                                                    className="text-[9px] font-bold uppercase px-2 py-1 bg-white/10 rounded hover:bg-orange-500 hover:text-black transition"
                                                >
                                                    Today
                                                </button>
                                                <button
                                                    onClick={() => setForm({ ...form, nextLocation: loc.name })}
                                                    className="text-[9px] font-bold uppercase px-2 py-1 bg-white/10 rounded hover:bg-blue-500 hover:text-black transition"
                                                >
                                                    Next
                                                </button>
                                                <button
                                                    onClick={() => deleteSavedLocation(loc.id)}
                                                    className="ml-auto p-1.5 text-gray-500 hover:text-red-400 transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
