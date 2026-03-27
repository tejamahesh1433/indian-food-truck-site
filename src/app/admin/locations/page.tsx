"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type DaySchedule = {
    start: string;
    end: string;
    status: string;
    notes: string;
};

type StopForm = {
    truckToday: string;
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
    weeklySchedule: Record<string, DaySchedule>;
};

export default function AdminLocationsPage() {
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
    const [lastPublished, setLastPublished] = useState<Date | null>(null);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [selectedDay, setSelectedDay] = useState<string>(dayNames[new Date().getDay()]);

    const [form, setForm] = useState<StopForm>({
        truckToday: "",
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
        weeklySchedule: {},
    });

    const [initialForm, setInitialForm] = useState<StopForm | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const settingsRes = await fetch("/api/admin/settings").catch(() => null);

                if (settingsRes?.ok) {
                    const data = await settingsRes.json();
                    const f: StopForm = {
                        truckToday: data.truckToday || "",
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
                        weeklySchedule: data.weeklySchedule || {},
                    };
                    setForm(f);
                    setInitialForm(f);
                    if (data.updatedAt) setLastPublished(new Date(data.updatedAt));
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



        if (form.nextLocation) {
            if (!form.nextDate || !form.nextStart || !form.nextEnd) {
                toast.error("Please set Date, Start, and End times for the Next stop.");
                return;
            }
            if (form.nextEnd <= form.nextStart) {
                toast.error("Next stop End time must be after Start time.");
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

    const currentDay = form.weeklySchedule[selectedDay] || { start: '', end: '', status: 'CLOSED', notes: '' };

    const updateCurrentDay = (updates: Partial<typeof currentDay>) => {
        const current = form.weeklySchedule[selectedDay] || { start: '', end: '', status: 'CLOSED', notes: '' };
        setForm({
            ...form,
            weeklySchedule: {
                ...form.weeklySchedule,
                [selectedDay]: { ...current, ...updates },
            }
        });
    };

    const applyPreset = (type: 'today' | 'next', preset: 'lunch' | 'dinner' | 'allday') => {
        const times = {
            lunch: { start: '12:00', end: '15:00' },
            dinner: { start: '17:00', end: '21:00' },
            allday: { start: '12:00', end: '18:00' },
        }[preset];

        if (type === 'today') updateCurrentDay({ start: times.start, end: times.end });
        else setForm({ ...form, nextStart: times.start, nextEnd: times.end });
    };

    const handleDiscard = async () => {
        if (!initialForm) return;
        const ok = await confirm({ title: "Discard Changes", message: "All unsaved changes will be lost.", confirmLabel: "Discard", variant: "warning" });
        if (ok) setForm(initialForm);
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        try {
            return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch {
            return timeStr;
        }
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
                            <h1 className="text-3xl font-semibold">Truck Status</h1>
                            <p className="text-gray-400 text-sm">Manage your fixed location and daily status.</p>
                        </div>
                    </header>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* BUSINESS INFO / FIXED LOCATION */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl" />
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Fixed Location
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Location Name</label>
                                    <input
                                        value={form.todayLocation}
                                        onChange={e => setForm({ ...form, todayLocation: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                        placeholder="e.g. Downtown Hall"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Maps Address</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={form.truckToday}
                                            onChange={e => setForm({ ...form, truckToday: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                            placeholder="e.g. 100 Main St, Hartford, CT"
                                        />
                                        {(form.truckToday || form.todayLocation) && (
                                            <a 
                                                href={`https://maps.google.com/?q=${encodeURIComponent(form.truckToday || form.todayLocation || '')}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition flex items-center justify-center text-sm font-medium text-gray-300 whitespace-nowrap"
                                            >
                                                Preview Map
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LIVE STATUS */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-3xl" />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    Daily Schedule
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Edit Schedule For</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <select 
                                            value={selectedDay}
                                            onChange={e => setSelectedDay(e.target.value)}
                                            aria-label="Select day of the week to edit"
                                            title="Select day of the week to edit"
                                            className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-white"
                                        >
                                            <option value="Monday" className="bg-neutral-900">Monday</option>
                                            <option value="Tuesday" className="bg-neutral-900">Tuesday</option>
                                            <option value="Wednesday" className="bg-neutral-900">Wednesday</option>
                                            <option value="Thursday" className="bg-neutral-900">Thursday</option>
                                            <option value="Friday" className="bg-neutral-900">Friday</option>
                                            <option value="Saturday" className="bg-neutral-900">Saturday</option>
                                            <option value="Sunday" className="bg-neutral-900">Sunday</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Status</label>
                                    <select
                                        value={currentDay.status}
                                        onChange={e => {
                                            const s = e.target.value;
                                            if (s === 'CLOSED') {
                                                updateCurrentDay({ status: s, start: '', end: '' });
                                            } else {
                                                updateCurrentDay({ status: s });
                                            }
                                        }}
                                        aria-label="Select operation status for the day"
                                        title="Select operation status for the day"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-white"
                                    >
                                        <option value="SERVING" className="bg-neutral-900">Open Now</option>
                                        <option value="OPENING_SOON" className="bg-neutral-900">Opening Soon</option>
                                        <option value="SOLD_OUT" className="bg-neutral-900">Sold Out</option>
                                        <option value="CLOSED" className="bg-neutral-900">Closed Today</option>
                                    </select>
                                </div>

                                <div className="md:col-span-1 flex items-end">
                                    <button 
                                        type="button" 
                                        onClick={() => updateCurrentDay({ status: 'SOLD_OUT' })} 
                                        className="w-full px-4 py-3 bg-red-500/10 text-red-500 text-sm font-bold tracking-wider rounded-xl border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                                    >
                                        <span className="text-lg leading-none">❌</span>
                                        Mark Sold Out
                                    </button>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Hours</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => applyPreset('today', 'lunch')} 
                                                className={`text-[9px] font-bold uppercase px-2.5 py-1.5 rounded transition border ${currentDay.start === '12:00' && currentDay.end === '15:00' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
                                            >
                                                Lunch 12–3
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => applyPreset('today', 'dinner')} 
                                                className={`text-[9px] font-bold uppercase px-2.5 py-1.5 rounded transition border ${currentDay.start === '17:00' && currentDay.end === '21:00' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
                                            >
                                                Dinner 5–9
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => applyPreset('today', 'allday')} 
                                                className={`text-[9px] font-bold uppercase px-2.5 py-1.5 rounded transition border ${currentDay.start === '12:00' && currentDay.end === '18:00' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
                                            >
                                                All Day 12–6
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Start</span>
                                            <input
                                                type="time"
                                                value={currentDay.start}
                                                onChange={e => updateCurrentDay({ start: e.target.value })}
                                                aria-label="Start time"
                                                title="Start time"
                                                placeholder="HH:MM"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-16 pr-4 py-3 outline-none focus:border-white/30 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                                required={!!form.todayLocation && currentDay.status !== "CLOSED"}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">End</span>
                                            <input
                                                type="time"
                                                value={currentDay.end}
                                                onChange={e => updateCurrentDay({ end: e.target.value })}
                                                aria-label="End time"
                                                title="End time"
                                                placeholder="HH:MM"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-white/30 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                                required={!!form.todayLocation && currentDay.status !== "CLOSED"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Short Note (Optional)</label>
                                    <input
                                        value={currentDay.notes}
                                        onChange={e => updateCurrentDay({ notes: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                                        placeholder="e.g. Parked near Hartford University"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex flex-col gap-2">
                                <button
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-orange-500 text-black px-12 py-4 rounded-2xl text-lg font-bold hover:bg-orange-400 transition disabled:opacity-30 shadow-xl shadow-orange-500/20 flex justify-center items-center gap-3"
                                >
                                    {saving ? "Saving Updates..." : "Save Updates"}
                                    {!saving && hasChanges && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                                </button>
                                {lastPublished && (
                                    <div className="text-[10px] text-gray-500 px-2">
                                        Last published: {lastPublished.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                )}
                            </div>
                            
                            {hasChanges && (
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-bold text-gray-400"
                                >
                                    Discard Changes
                                </button>
                            )}
                            <div className="flex-1 flex justify-end">
                                {status === "saved" && <span className="text-green-400 text-sm font-medium animate-bounce border border-green-500/20 bg-green-500/10 px-4 py-2 rounded-lg">Published to Website!</span>}
                                {status === "error" && <span className="text-red-400 text-sm font-medium border border-red-500/20 bg-red-500/10 px-4 py-2 rounded-lg">Failed to save.</span>}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Side: Sidebar - WEBSITE PREVIEW */}
                <div className="w-full lg:w-80 space-y-8">
                    <div className="bg-black border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <svg className="w-20 h-20 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-white/10 pb-4">Website Preview</h3>

                        <div className="space-y-6">
                            {(() => {
                                const todayPreview = form.weeklySchedule[dayNames[new Date().getDay()]] || { start: '', end: '', status: 'CLOSED', notes: '' };
                                return (
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3 block">Today</div>
                                        
                                        {todayPreview.status === 'CLOSED' ? (
                                            <div className="space-y-4">
                                                <div className="text-xl font-bold text-gray-400">Closed Today</div>
                                                <div className="text-base font-bold flex items-center gap-2 text-gray-500">
                                                    📍 {form.todayLocation || "Location Not Set"}
                                                </div>
                                                <div className="text-sm font-medium text-gray-500 italic">See you tomorrow</div>
                                            </div>
                                        ) : todayPreview.status === 'SOLD_OUT' ? (
                                            <div className="space-y-4">
                                                <div className="text-xl font-bold text-red-500 flex items-center gap-2">
                                                    ❌ SOLD OUT TODAY
                                                </div>
                                                <div className="text-base font-bold flex items-center gap-2 text-gray-500">
                                                    📍 {form.todayLocation}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className={`text-xl font-bold ${todayPreview.status === 'OPENING_SOON' ? 'text-blue-400' : 'text-green-400'}`}>
                                                    {todayPreview.status === 'OPENING_SOON' ? 'Opening Soon' : 'Open Now'}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-base font-bold flex items-center gap-2 text-white">
                                                            <span>📍</span>
                                                            <span>{form.todayLocation || "Location Not Set"}</span>
                                                        </div>
                                                        <a
                                                            href={`https://maps.google.com/?q=${encodeURIComponent(form.truckToday || form.todayLocation || '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm font-medium text-orange-400 hover:text-orange-300 transition flex items-center gap-2 pl-7"
                                                        >
                                                            <span>🧭</span>
                                                            <span>Open in Maps</span>
                                                        </a>
                                                    </div>
                                                    
                                                    <div className="text-base font-medium text-gray-300 pl-7 text-orange-400">
                                                        🕒 {todayPreview.start && todayPreview.end ? `${formatTime(todayPreview.start)} – ${formatTime(todayPreview.end)}` : 'Hours not set'}
                                                    </div>
                                                    
                                                    {todayPreview.notes && (
                                                        <div className="text-sm text-gray-400 pl-7 italic mt-2">
                                                            Note: {todayPreview.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
