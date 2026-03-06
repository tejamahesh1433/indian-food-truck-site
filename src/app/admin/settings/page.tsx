"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type SettingsForm = {
    phone: string;
    instagramUrl: string;
    publicEmail: string;
    businessName: string;
    cityState: string;
    footerMessage: string;
    bannerEnabled: boolean;
    bannerText: string;
};

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
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
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/settings");
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
                    };
                    setForm(f);
                    setInitialForm(f);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const hasChanges = useMemo(() => {
        return initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);
    }, [form, initialForm]);

    const isValid = useMemo(() => {
        if (form.publicEmail && !form.publicEmail.includes("@")) return false;
        if (form.instagramUrl && !form.instagramUrl.includes("instagram.com")) return false;
        return true;
    }, [form]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;

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
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
        setSaving(false);
        setTimeout(() => setStatus("idle"), 3000);
    }

    if (loading) return <div className="p-10 text-white text-center">Loading Settings...</div>;

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <header className="mb-10">
                        <h1 className="text-3xl font-semibold mb-2">Site Settings</h1>
                        <p className="text-gray-400 text-sm">Manage global branding, contact info, and site-wide alerts.</p>
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
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Public Phone Number</label>
                                    <input
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition"
                                        placeholder="+1 555-555-5555"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Public Email</label>
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
                                        Instagram URL
                                        {form.instagramUrl && !form.instagramUrl.includes("instagram.com") && (
                                            <span className="text-red-400 text-[10px]">Must be a valid Instagram URL</span>
                                        )}
                                    </label>
                                    <input
                                        value={form.instagramUrl}
                                        onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 outline-none transition ${form.instagramUrl && !form.instagramUrl.includes("instagram.com") ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'}`}
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
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.bannerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className={`transition-all duration-300 ${form.bannerEnabled ? 'opacity-100 max-h-40' : 'opacity-30 max-h-40 pointer-events-none'}`}>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Banner Message</label>
                                <textarea
                                    value={form.bannerText}
                                    onChange={e => setForm({ ...form, bannerText: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 transition h-24 resize-none"
                                    placeholder="e.g. Custom catering now available for weddings!"
                                />
                            </div>
                        </section>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                disabled={saving || !hasChanges || !isValid}
                                className="bg-white text-black px-10 py-4 rounded-2xl font-bold hover:bg-gray-200 transition disabled:opacity-30 flex items-center gap-3 shadow-xl shadow-white/5"
                            >
                                {saving ? "Saving Settings..." : "Save Settings"}
                                {!saving && hasChanges && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                            </button>
                            {status === "saved" && <span className="text-green-400 text-sm font-medium animate-bounce">Saved Successfully!</span>}
                            {status === "error" && <span className="text-red-400 text-sm font-medium">Failed to save settings.</span>}
                        </div>
                    </form>
                </div>

                {/* Right Side: Previews */}
                <div className="w-full lg:w-96 space-y-8">
                    <div className="sticky top-12 space-y-8">
                        <section className="bg-black border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">Live Previews</h3>

                            <div className="space-y-8 text-center sm:text-left">
                                {/* Branding Preview */}
                                <div className="space-y-1">
                                    <div className="text-[9px] font-bold uppercase text-gray-600 mb-2">Public Branding</div>
                                    <div className="text-2xl font-bold">{form.businessName || "Indian Food Truck"}</div>
                                    <div className="text-sm text-gray-400">{form.cityState || "Hartford, CT"}</div>
                                </div>

                                {/* Contact Link Previews */}
                                <div className="space-y-3">
                                    <div className="text-[9px] font-bold uppercase text-gray-600 mb-1">Contact Buttons</div>
                                    <div className="flex flex-col gap-2">
                                        <a href={`tel:${form.phone}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition group">
                                            <span className="text-xs font-bold text-gray-300">Call Now</span>
                                            <span className="text-[10px] text-blue-400">{form.phone || "No phone set"}</span>
                                        </a>
                                        {form.instagramUrl && (
                                            <a href={form.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 transition">
                                                <span className="text-xs font-bold text-purple-400">Instagram</span>
                                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Banner Preview */}
                                {form.bannerEnabled && form.bannerText && (
                                    <div className="space-y-2">
                                        <div className="text-[9px] font-bold uppercase text-gray-600 mb-1">Banner Bar</div>
                                        <div className="bg-orange-500 text-black px-4 py-2 rounded-xl text-[10px] font-bold text-center">
                                            {form.bannerText}
                                        </div>
                                    </div>
                                )}

                                {/* Footer Preview */}
                                <div className="space-y-1 opacity-60">
                                    <div className="text-[9px] font-bold uppercase text-gray-600 mb-1">Footer Text</div>
                                    <div className="text-[10px] text-gray-400 leading-relaxed italic border-l border-white/10 pl-3">
                                        {form.footerMessage || "© 2024 Indian Food Truck. All rights reserved."}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div className="text-xs text-blue-300 leading-relaxed">
                                    <strong>Tip:</strong> These settings are global. Updating the Business Name or Phone will update the header, footer, and catering pages immediately.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
