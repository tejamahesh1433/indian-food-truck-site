"use client";

import LogoutButton from "@/components/LogoutButton";

interface ProfileUser {
    name: string | null;
    email: string | null;
}

interface ProfileHeaderProps {
    user: ProfileUser;
    memberSince: string;
}

export default function ProfileHeader({ user, memberSince }: ProfileHeaderProps) {
    const initials = user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "U";

    return (
        <div className="bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8">
            {/* Mobile: stack avatar + info vertically, then logout below */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                
                {/* Top row: avatar + info side by side even on mobile */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Avatar */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-xl sm:text-3xl shadow-lg">
                        {initials}
                    </div>

                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-white mb-1 sm:mb-2 leading-tight truncate">
                            {user.name}
                        </h1>
                        <div className="space-y-0.5 sm:space-y-1">
                            <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 min-w-0">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="truncate">{user.email}</span>
                            </p>
                            <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                Member since {memberSince}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Logout: full-width on mobile, auto on desktop */}
                <div className="w-full sm:w-auto flex-shrink-0">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
