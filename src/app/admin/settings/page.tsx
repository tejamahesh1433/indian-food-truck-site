"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizePhone } from "@/lib/utils/phone";


function PinManager() {
    const [pin, setPin] = useState("");
    const [initialPin, setInitialPin] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setPin(data.adminAccessPin || "");
                setInitialPin(data.adminAccessPin || "");
            }
        })();
    }, []);

    async function savePin() {
        setSaving(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminAccessPin: pin.trim() }),
            });
            if (res.ok) {
                setStatus("saved");
                setInitialPin(pin.trim());
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        } finally {
            setSaving(false);
        }
    }

    const hasChanged = pin !== initialPin;

    return (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Security: Admin Access PIN</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">6-digit code required before login</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Access PIN Code</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN"
                        value={pin}
                        onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setPin(v);
                            setStatus("idle");
                        }}
                        className="flex-1 rounded-xl border border-white/10 px-4 py-3 bg-black/50 text-white font-mono text-lg tracking-[0.5em] outline-none focus:border-orange-500/50 transition placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-sm placeholder:font-sans"
                    />
                    <button
                        onClick={savePin}
                        disabled={saving || !hasChanged || pin.length !== 6}
                        className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Update"}
                    </button>
                </div>
                {pin.length > 0 && pin.length < 6 && (
                    <p className="text-[10px] text-yellow-400 ml-1">PIN must be exactly 6 digits</p>
                )}
            </div>

            {status === "saved" && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-4 py-2 rounded-xl">
                    ✓ PIN updated successfully
                </div>
            )}
            {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl">
                    Failed to update PIN
                </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-2">
                <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-[10px] text-yellow-300 leading-relaxed">
                    This PIN is required to access the admin login page. Without it, nobody can even see the login form. Keep it secret!
                </p>
            </div>
        </section>
    );
}

type SettingsForm = {
    phone: string;
    instagramUrl: string;
    publicEmail: string;
    businessName: string;
    cityState: string;
    footerMessage: string;
    bannerEnabled: boolean;
    bannerText: string;
    logoUrl: string;
};

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [initialForm, setInitialForm] = useState<SettingsForm | null>(null);
    const [form, setForm] = useState<SettingsForm>({
        phone: "",
        instagramUrl: "",
        publicEmail: "",
        businessName: "",
        cityState: "",
        footerMessage: "",
        bannerEnabled: false,
        bannerText: "",
        logoUrl: "",
    });

    useEffect(() => {
        const controller = new AbortController();
        const abortId = setTimeout(() => controller.abort(), 10000);
        // Safety fallback: clear loading even if the abort race is cancelled (e.g. in StrictMode cleanup)
        const safetyId = setTimeout(() => setLoading(false), 15000);

        (async () => {
            try {
                const res = await fetch("/api/admin/settings", { signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    const f: SettingsForm = {
                        phone: data.phone || "",
                        instagramUrl: data.instagramUrl || "",
                        publicEmail: data.publicEmail || "",
                        businessName: data.businessName || "Indian Food Truck",
                        cityState: data.cityState || "Hartford, CT",
                        footerMessage: data.footerMessage || "",
                        bannerEnabled: data.bannerEnabled ?? false,
                        bannerText: data.bannerText || "",
                        logoUrl: data.logoUrl || "",
                    };
                    setForm(f);
                    setInitialForm(f);
                    if (data.updatedAt) {
                        setLastSaved(new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    }
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Failed to fetch settings:", err);
                }
            } finally {
                clearTimeout(abortId);
                clearTimeout(safetyId);
                setLoading(false);
            }
        })();
        return () => { clearTimeout(abortId); clearTimeout(safetyId); controller.abort(); };
    }, []);

    const hasChanges = useMemo(() => {
        if (!initialForm) return false;
        return (
            form.phone !== initialForm.phone ||
            form.instagramUrl !== initialForm.instagramUrl ||
            form.publicEmail !== initialForm.publicEmail ||
            form.businessName !== initialForm.businessName ||
            form.cityState !== initialForm.cityState ||
            form.footerMessage !== initialForm.footerMessage ||
            form.bannerEnabled !== initialForm.bannerEnabled ||
            form.bannerText !== initialForm.bannerText ||
            form.logoUrl !== initialForm.logoUrl
        );
    }, [form, initialForm]);

    const isValid = useMemo(() => {
        if (form.publicEmail && !form.publicEmail.includes("@")) return false;
        if (form.instagramUrl && (!form.instagramUrl.includes("instagram.com/") || form.instagramUrl.endsWith("instagram.com/"))) return false;
        if (form.bannerEnabled && !form.bannerText.trim()) return false;
        return true;
    }, [form]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;

        setSaving(true);
        setStatus("idle");
        try {
            const sanitizedForm = {
                ...form,
                phone: form.phone.trim(),
                publicEmail: form.publicEmail.trim(),
                instagramUrl: form.instagramUrl.trim(),
                businessName: form.businessName.trim(),
                bannerText: form.bannerEnabled ? form.bannerText.trim() : "",
            };

            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitizedForm)
            });
            if (res.ok) {
                setStatus("saved");
                setInitialForm(sanitizedForm);
                setForm(sanitizedForm); // Sync trimmed values back
                setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
        setSaving(false);
        setTimeout(() => setStatus("idle"), 3000);
    }

    function handleReset() {
        if (initialForm) setForm(initialForm);
    }

    if (loading) return <div className="p-10 text-white text-center">Loading Settings...</div>;

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white transition">
                    ← Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-orange-500/20 animate-pulse">
                            Unsaved Changes
                        </span>
                    )}
                    {lastSaved && (
                        <span className="text-xs text-gray-500 italic">Last saved: {lastSaved}</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <header className="mb-10 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold mb-2">Site Settings</h1>
                            <p className="text-gray-400 text-sm">Manage global branding, contact info, and site-wide alerts.</p>
                        </div>
                        {hasChanges && (
                            <button
                                onClick={handleReset}
                                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition pb-1 border-b border-white/10"
                            >
                                Discard Changes
                            </button>
                        )}
                    </header>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Branding Section */}
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                                Branding & Display
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Business Name</label>
                                    <input
                                        value={form.businessName}
                                        onChange={e => setForm({ ...form, businessName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition"
                                        placeholder="e.g. Indian Food Truck"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">City/State</label>
                                    <input
                                        value={form.cityState}
                                        onChange={e => setForm({ ...form, cityState: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition"
                                        placeholder="e.g. Hartford, CT"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Logo URL (Optional)</label>
                                    <input
                                        value={form.logoUrl}
                                        onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Footer Message</label>
                                    <input
                                        value={form.footerMessage}
                                        onChange={e => setForm({ ...form, footerMessage: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition"
                                        placeholder="e.g. Handmade with love since 2024"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contact & Social Section */}
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full" />
                                Contact & Social
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                                    <input
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition"
                                        placeholder="+1 555-555-5555"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={form.publicEmail}
                                        onChange={e => setForm({ ...form, publicEmail: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center justify-between">
                                        Instagram handle URL
                                        {form.instagramUrl && (!form.instagramUrl.includes("instagram.com/") || form.instagramUrl.endsWith("instagram.com/")) && (
                                            <span className="text-red-400 text-[10px]">Provide full handle URL</span>
                                        )}
                                    </label>
                                    <input
                                        value={form.instagramUrl}
                                        onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 outline-none transition ${form.instagramUrl && (!form.instagramUrl.includes("instagram.com/") || form.instagramUrl.endsWith("instagram.com/")) ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'}`}
                                        placeholder="https://instagram.com/yourhandle"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Announcement Banner Section */}
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                                    Announcement Banner
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, bannerEnabled: !form.bannerEnabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.bannerEnabled ? 'bg-orange-500' : 'bg-gray-700'}`}
                                    title="Toggle Announcement Banner"
                                    aria-label="Toggle Announcement Banner"
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.bannerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className={`transition-all duration-300 ${form.bannerEnabled ? 'opacity-100 max-h-60' : 'opacity-30 max-h-60'}`}>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center justify-between">
                                    Banner Message
                                    {form.bannerEnabled && !form.bannerText.trim() && (
                                        <span className="text-red-400 text-[10px]">Message required when enabled</span>
                                    )}
                                </label>
                                <textarea
                                    disabled={!form.bannerEnabled}
                                    value={form.bannerText}
                                    onChange={e => setForm({ ...form, bannerText: e.target.value })}
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 outline-none transition h-24 resize-none ${form.bannerEnabled && !form.bannerText.trim() ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50'}`}
                                    placeholder="e.g. Closed for Diwali!"
                                />
                            </div>
                        </section>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving || !hasChanges || !isValid}
                                className="bg-white text-black px-10 py-4 rounded-2xl font-bold hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
                            >
                                {saving ? "Saving..." : "Save Settings"}
                                {!saving && hasChanges && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                            </button>
                            {status === "saved" && <span className="text-green-400 text-sm font-medium">Settings Updated!</span>}
                            {status === "error" && <span className="text-red-400 text-sm font-medium">Error saving changes.</span>}
                        </div>
                    </form>
                </div>

                {/* Previews Sidebar */}
                <div className="w-full lg:w-96 space-y-8">
                    <div className="sticky top-12 space-y-8">
                        <section className="bg-black border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Live Website Previews
                            </h3>

                            <div className="space-y-8">
                                {/* Logo & Branding Preview */}
                                <div className="space-y-3">
                                    <div className="text-[9px] font-bold uppercase text-gray-600">Header Branding</div>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        {form.logoUrl ? (
                                            <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl overflow-hidden relative">
                                                <Image
                                                    src={form.logoUrl}
                                                    fill
                                                    className="object-contain p-1"
                                                    alt="Preview"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-xs">IFT</div>
                                        )}
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-bold truncate">{form.businessName || "Indian Food Truck"}</div>
                                            <div className="text-[10px] text-gray-400 truncate">{form.cityState || "Hartford, CT"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Link Previews */}
                                <div className="space-y-3">
                                    <div className="text-[9px] font-bold uppercase text-gray-600">Contact Interaction</div>
                                    <div className="flex flex-col gap-2">
                                        <a href={`tel:${normalizePhone(form.phone)}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition">
                                            <span className="text-xs font-bold text-gray-300">Call Now</span>
                                            <span className="text-[10px] text-blue-400 font-mono">{normalizePhone(form.phone) || "No digit match"}</span>
                                        </a>
                                        {form.instagramUrl && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                <span className="text-xs font-bold text-purple-400">Instagram Button</span>
                                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Banner Preview */}
                                <div className="space-y-2">
                                    <div className="text-[9px] font-bold uppercase text-gray-600">Site-wide Alert</div>
                                    {form.bannerEnabled ? (
                                        <div className={`p-3 rounded-xl text-[10px] font-bold text-center transition-all ${form.bannerText.trim() ? 'bg-orange-500 text-black' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {form.bannerText.trim() || "ERROR: Text Required"}
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 border border-dashed border-white/10 text-gray-500 py-3 rounded-xl text-[10px] font-bold text-center">
                                            Banner Disabled
                                        </div>
                                    )}
                                </div>

                                {/* Footer Fidelity Preview */}
                                <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="text-[9px] font-bold uppercase text-gray-600 mb-1">Footer Preview</div>
                                    <div className="space-y-2">
                                        {form.footerMessage && (
                                            <div className="text-[10px] text-gray-300 italic border-l-2 border-orange-500 pl-3 leading-snug">
                                                {form.footerMessage}
                                            </div>
                                        )}
                                        <div className="text-[9px] text-gray-500 font-mono">
                                            © {new Date().getFullYear()} {form.businessName}. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
                            <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div className="text-[10px] text-blue-300 leading-relaxed">
                                <strong>System Logic:</strong> Previews show exactly how links will resolve on mobile versus desktop. Normalized phone links ensure one-tap dialing works.
                            </div>
                        </div>

                        {/* ── Security: Admin Access PIN ── */}
                        <PinManager />
                    </div>
                </div>
            </div>
        </main>
    );
}
