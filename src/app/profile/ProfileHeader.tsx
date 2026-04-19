"use client";

import LogoutButton from "@/components/LogoutButton";

interface ProfileHeaderProps {
    user: any;
    memberSince: string;
}

export default function ProfileHeader({ user, memberSince }: ProfileHeaderProps) {
    const initials = user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "U";

    return (
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border border-orange-500/20 rounded-3xl p-8 mb-8">
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                        {initials}
                    </div>

                    {/* User Info */}
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                            {user.name}
                        </h1>
                        <div className="space-y-1 text-sm text-gray-300">
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {user.email}
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 107.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                                </svg>
                                Member since {memberSince}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <LogoutButton />
            </div>
        </div>
    );
}
