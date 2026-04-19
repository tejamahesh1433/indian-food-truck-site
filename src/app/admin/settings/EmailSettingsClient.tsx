"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmailSettings {
    emailOrderStatusUpdates: boolean;
    emailNewsletterSend: boolean;
    emailVerificationRequired: boolean;
    emailAdminAlerts: boolean;
}

export default function EmailSettingsClient({ 
    initialSettings, 
    publicEmail 
}: { 
    initialSettings: EmailSettings,
    publicEmail: string 
}) {
    const [settings, setSettings] = useState(initialSettings);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [testing, setTesting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isConfigured = publicEmail && publicEmail.trim().length > 0 && publicEmail.includes("@");

    const handleToggle = async (key: keyof EmailSettings) => {
        // Optimistic Update
        const oldValue = settings[key];
        const newValue = !oldValue;
        
        setSettings(prev => ({ ...prev, [key]: newValue }));
        setSyncing(key);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: newValue }),
            });

            if (!response.ok) throw new Error("Failed to save");
            
            // Success - keep optimistic value
            setTimeout(() => setSyncing(null), 500);
        } catch {
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: oldValue }));
            setMessage({ type: 'error', text: 'Cloud sync failed. Connection lost?' });
            setSyncing(null);
        }
    };

    const handleSendTest = async (key: string) => {
        setTesting(key);
        setMessage(null);
        try {
            const response = await fetch("/api/admin/settings/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: key }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to send test");
            }

            setMessage({ type: 'success', text: `Test email dispatched for ${key.replace('email', '')}!` });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Test failed. Check console.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setTesting(null);
        }
    };

    const toggles = [
        {
            key: 'emailOrderStatusUpdates' as const,
            label: 'Order Confirmation',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            description: 'Customer notification on receipt & prep.',
            effort: 'High impact on quota',
        },
        {
            key: 'emailAdminAlerts' as const,
            label: 'Admin Real-time Alerts',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            description: 'Instant notification of new web orders.',
            effort: 'Critical for operations',
        },
        {
            key: 'emailNewsletterSend' as const,
            label: 'Newsletter Engine',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" />
                </svg>
            ),
            description: 'Broadcast capabilities for promotions.',
            effort: 'Manual triggers only',
        },
        {
            key: 'emailVerificationRequired' as const,
            label: 'Auth Verification',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            ),
            description: 'Force email validation on signup.',
            effort: 'Enhanced security',
        },
    ];

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {!isConfigured && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-red-400">Configuration Required</h5>
                                <p className="text-[10px] text-red-400/70">Add a Contact Email in the <b>Branding</b> section above to enable testing.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                            className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition"
                        >
                            Fix Now ↑
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {toggles.map((toggle) => (
                    <motion.div
                        key={toggle.key}
                        layout
                        className={`relative group border rounded-3xl p-5 transition-all duration-500 overflow-hidden ${
                            settings[toggle.key]
                                ? 'bg-orange-500/5 border-orange-500/20'
                                : 'bg-white/5 border-white/10 opacity-70 grayscale'
                        }`}
                    >
                        {/* Background Pulse during sync */}
                        {syncing === toggle.key && (
                            <motion.div 
                                layoutId="sync-pulse"
                                className="absolute inset-0 bg-orange-500/10 pointer-events-none"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                        )}

                        <div className="flex flex-col h-full gap-4 relative z-10">
                            {/* Header Info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                        settings[toggle.key] ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-white/10 text-gray-500'
                                    }`}>
                                        {toggle.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white leading-none mb-1">{toggle.label}</h4>
                                        <span className="text-[10px] font-medium text-orange-500/60 uppercase tracking-widest">{toggle.effort}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggle(toggle.key)}
                                    aria-label={`Toggle ${toggle.label}`}
                                    title={`Toggle ${toggle.label}`}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings[toggle.key] ? 'bg-orange-600' : 'bg-gray-800'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings[toggle.key] ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Middle Description */}
                            <p className="text-xs text-gray-400 leading-relaxed min-h-[32px]">
                                {toggle.description}
                            </p>

                            {/* Footer Interaction */}
                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${settings[toggle.key] ? 'text-green-500' : 'text-gray-600'}`}>
                                    {settings[toggle.key] ? 'Active Engaged' : 'Not Integrated'}
                                </span>

                                {settings[toggle.key] && (
                                    <button
                                        onClick={() => handleSendTest(toggle.key)}
                                        disabled={testing !== null || !isConfigured}
                                        title={!isConfigured ? "Setup contact email first" : ""}
                                        className={`text-[10px] font-bold transition flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                            !isConfigured 
                                                ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                                                : 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400 hover:text-white'
                                        }`}
                                    >
                                        {testing === toggle.key ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Test
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Alert Center */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-xs font-bold">{message.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Engine Status */}
            <div className="bg-black/40 border border-orange-500/10 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                             </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-white">Automation Engine Ready</h5>
                        <p className="text-[10px] text-gray-500 font-medium">Syncing with Resend Cloud v5.1 • Connecticut Region</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 px-6 py-2 bg-black/60 rounded-2xl border border-white/5">
                    <div className="text-center">
                        <div className="text-lg font-black text-white leading-none">3,000</div>
                        <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Monthly Limit</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <div className="text-lg font-black text-orange-500 leading-none">Free</div>
                        <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Plan Tier</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
