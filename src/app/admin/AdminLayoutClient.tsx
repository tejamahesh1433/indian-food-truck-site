"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./ui/LogoutButton";

const NAVIGATION = [
    { name: "Live Orders", href: "/admin", icon: "🍔" },
    { name: "Orders History", href: "/admin/orders", icon: "📋" },
    { name: "Menu Management", href: "/admin/menu-items", icon: "🥘" },
    { name: "Catering", href: "/admin/catering", icon: "🎉" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
    { name: "Support Chat", href: "/admin/support", icon: "💬" },
    { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    { name: "Truck Schedule", href: "/admin/locations", icon: "📍" },
    { name: "Newsletter", href: "/admin/newsletter", icon: "📧" },
    { name: "POS Sync", href: "/admin/pos-sync", icon: "🔄" },
    { name: "Today's Special", href: "/admin/todays-special", icon: "🔥" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayoutClient({ children, businessName }: { children: React.ReactNode, businessName: string }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Run asynchronously to avoid React cascading render warnings
        const t = setTimeout(() => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        }, 0);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                suppressHydrationWarning
                className={"fixed lg:relative top-0 left-0 z-50 h-full bg-zinc-900 flex flex-col transition-[width] duration-300 overflow-hidden shrink-0 " + (sidebarOpen ? "w-64 border-r border-white/10" : "w-0 border-r-0")}
            >
                <div className="w-64 h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                    <span className="font-bold text-orange-500 tracking-wider">C2C ADMIN</span>
                    <button className="text-gray-400 hover:text-white p-3 -mr-3 flex items-center justify-center relative z-[60] cursor-pointer" onClick={() => setSidebarOpen(false)} title="Close Sidebar" type="button">
                        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {NAVIGATION.map((item) => {
                        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                onClick={() => {
                                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={"flex items-center gap-3 px-3 py-2.5 rounded-lg transition font-medium text-sm " + (isActive ? "bg-orange-500/10 text-orange-400" : "text-gray-400 hover:bg-white/5 hover:text-white")}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-30">
                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 p-1 hover:text-white transition" onClick={() => setSidebarOpen(true)} title="Open Sidebar">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="font-semibold hidden sm:block">{businessName}</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
