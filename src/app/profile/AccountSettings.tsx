"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailNotifications: boolean;
    marketingEmails: boolean;
}

interface AccountSettingsProps {
    user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [name, setName] = useState(user.name || "");
    const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
    const [marketingEmails, setMarketingEmails] = useState(user.marketingEmails ?? false);
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name, 
                    emailNotifications, 
                    marketingEmails 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Settings updated successfully!");
                setExpandedSection(null);
                router.refresh();
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setExpandedSection(null);
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Account deleted. Goodbye!");
                // Force sign out by redirecting to login (the session is already gone in DB)
                window.location.href = "/login";
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete account");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleExportData = async () => {
        setIsSubmitting(true);
        try {
            // Open the print-optimized export page in a new tab
            const exportWindow = window.open("/profile/export", "_blank");
            
            if (!exportWindow) {
                toast.error("Popup blocked! Please allow popups to download your data.");
                return;
            }

            toast.info("Preparing your data statement...");
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            // We set submitting to false immediately as the browser handles the print dialog
            setIsSubmitting(false);
        }
    };

    const settings = [
        {
            id: "profile",
            icon: "👤",
            label: "Edit Profile",
            description: "Update your name and personal details",
        },
        {
            id: "password",
            icon: "🔒",
            label: "Change Password",
            description: "Update your security credentials",
        },
        {
            id: "notifications",
            icon: "🔔",
            label: "Notifications",
            description: "Manage how we contact you",
        },
        {
            id: "privacy",
            icon: "👁️",
            label: "Privacy Settings",
            description: "Control your data and visibility",
        },
    ];

    return (
        <section className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-base sm:text-lg font-black italic tracking-tighter uppercase text-white mb-4">
                ⚙️ Account
            </h3>

            <div className="space-y-2 mb-6">
                {settings.map((setting) => (
                    <div
                        key={setting.id}
                        className="w-full text-left rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/30 transition overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedSection(
                                    expandedSection === setting.id ? null : setting.id
                                )
                            }
                            className="w-full p-3 text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{setting.icon}</span>
                                <div>
                                    <p className="font-bold text-white text-sm">
                                        {setting.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {setting.description}
                                    </p>
                                </div>
                            </div>
                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                    expandedSection === setting.id ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </button>

                        {expandedSection === setting.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/20">
                                {setting.id === "profile" && (
                                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                                        <div>
                                            <label htmlFor="displayName" className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Display Name</label>
                                            <input
                                                id="displayName"
                                                type="text"
                                                value={name}
                                                placeholder="Enter your name"
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : "Save Changes"}
                                        </button>
                                    </form>
                                )}

                                {setting.id === "password" && (
                                    <form onSubmit={handleChangePassword} className="space-y-3">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Current Password</label>
                                            <input
                                                id="currentPassword"
                                                type="password"
                                                value={currentPassword}
                                                placeholder="••••••••"
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">New Password</label>
                                            <input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                placeholder="••••••••"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Confirm New Password</label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                placeholder="••••••••"
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Updating Password..." : "Change Password"}
                                        </button>
                                    </form>
                                )}

                                {setting.id === "notifications" && (
                                    <div className="space-y-4 py-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">Order Updates</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Email on order status change</p>
                                            </div>
                                            <button
                                                onClick={() => setEmailNotifications(!emailNotifications)}
                                                aria-label="Toggle Order Updates Email Notifications"
                                                title="Toggle Order Updates Email Notifications"
                                                className={`w-10 h-5 rounded-full transition-colors relative ${emailNotifications ? "bg-orange-600" : "bg-white/10"}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${emailNotifications ? "right-1" : "left-1"}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">Marketing Emails</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Offers and truck updates</p>
                                            </div>
                                            <button
                                                onClick={() => setMarketingEmails(!marketingEmails)}
                                                aria-label="Toggle Marketing Email Notifications"
                                                title="Toggle Marketing Email Notifications"
                                                className={`w-10 h-5 rounded-full transition-colors relative ${marketingEmails ? "bg-orange-600" : "bg-white/10"}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${marketingEmails ? "right-1" : "left-1"}`} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isSubmitting}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition"
                                        >
                                            {isSubmitting ? "Saving..." : "Save Preferences"}
                                        </button>
                                    </div>
                                )}

                                {setting.id === "privacy" && (
                                    <div className="space-y-3 py-2 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 text-left">Your visibility is set to Private by default. Download your data history below.</p>
                                        <button 
                                            onClick={handleExportData}
                                            disabled={isSubmitting}
                                            className="w-full bg-white/5 border border-white/10 hover:border-white/20 p-3 rounded-xl flex items-center justify-between group transition disabled:opacity-50"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition">
                                                {isSubmitting ? "Generating Bundle..." : "Download Personal Data"}
                                            </span>
                                            <span className="text-xs">{isSubmitting ? "⏳" : "📥"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
                <Link
                    href="/privacy-policy"
                    className="block text-xs font-bold text-gray-400 hover:text-orange-400 transition"
                >
                    Privacy Policy
                </Link>
                <Link
                    href="/terms"
                    className="block text-xs font-bold text-gray-400 hover:text-orange-400 transition"
                >
                    Terms of Service
                </Link>
                
                {showDeleteConfirm ? (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Permanent Deletion?</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition shadow-lg shadow-red-900/20"
                            >
                                {isSubmitting ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full mt-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500/70 border border-red-500/20 rounded-lg hover:border-red-500/60 hover:text-red-500 transition"
                    >
                        Delete Account
                    </button>
                )}
            </div>
        </section>
    );
}
