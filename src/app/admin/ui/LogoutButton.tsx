"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition text-gray-300 hover:text-white"
        >
            Logout
        </button>
    );
}
