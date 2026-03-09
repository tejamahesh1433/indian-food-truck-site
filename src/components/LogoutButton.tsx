"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition flex items-center gap-2 px-4 py-2 border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/20"
        >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
        </button>
    );
}
