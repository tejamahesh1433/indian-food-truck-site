"use client";

import { useSite } from "@/components/SiteProvider";

export default function AnnouncementBanner() {
    const site = useSite();

    if (!site.banner.enabled || !site.banner.text) return null;

    return (
        <div className="bg-orange-500 text-black py-2 px-4 text-center text-sm font-semibold relative hidden md:block print:hidden">
            <div className="container-shell flex items-center justify-center gap-2">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest leading-tight">
                    {site.banner.text}
                </p>
            </div>
        </div>
    );
}
