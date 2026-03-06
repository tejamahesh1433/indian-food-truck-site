"use client";

import { createContext, useContext } from "react";
import { site as defaultSite } from "@/config/site";

export type DbSettings = {
    phone: string;
    instagramUrl: string;
    publicEmail?: string;
    businessName?: string;
    cityState?: string;
    footerMessage?: string;
    bannerEnabled?: boolean;
    bannerText?: string;

    truckToday: string;
    truckNext: string;

    // Advanced Today
    todayLocation?: string;
    todayStart?: string;
    todayEnd?: string;
    todayStatus?: string;
    todayNotes?: string;

    // Advanced Next
    nextLocation?: string;
    nextDate?: string;
    nextStart?: string;
    nextEnd?: string;
    nextNotes?: string;
};

const SiteContext = createContext<DbSettings | null>(null);

export function SiteProvider({ children, settings }: { children: React.ReactNode, settings: DbSettings | null }) {
    return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSite() {
    const dbSettings = useContext(SiteContext);

    if (!dbSettings) return defaultSite;

    return {
        ...defaultSite,
        brand: {
            ...defaultSite.brand,
            name: dbSettings.businessName || defaultSite.brand.name,
            city: dbSettings.cityState || defaultSite.brand.city,
        },
        contact: {
            ...defaultSite.contact,
            phoneE164: dbSettings.phone || defaultSite.contact.phoneE164,
            phoneDisplay: dbSettings.phone || defaultSite.contact.phoneDisplay,
            instagramUrl: dbSettings.instagramUrl || defaultSite.contact.instagramUrl,
            email: dbSettings.publicEmail || defaultSite.contact.email,
        },
        banner: {
            enabled: dbSettings.bannerEnabled ?? false,
            text: dbSettings.bannerText || "",
        },
        footer: {
            message: dbSettings.footerMessage || "",
        },
        truck: {
            ...defaultSite.truck,
            today: {
                ...defaultSite.truck.today,
                label: dbSettings.todayLocation || dbSettings.truckToday || defaultSite.truck.today.label,
                start: dbSettings.todayStart || "",
                end: dbSettings.todayEnd || "",
                status: dbSettings.todayStatus || "CLOSED",
                notes: dbSettings.todayNotes || "",
                // Keep label for backward compat
                hours: dbSettings.todayStart && dbSettings.todayEnd
                    ? `${dbSettings.todayStart} – ${dbSettings.todayEnd}`
                    : defaultSite.truck.today.hours,
                mapsQuery: dbSettings.todayLocation || defaultSite.truck.today.mapsQuery,
            },
            next: {
                ...defaultSite.truck.next,
                label: dbSettings.nextLocation || dbSettings.truckNext || defaultSite.truck.next.label,
                date: dbSettings.nextDate || "",
                start: dbSettings.nextStart || "",
                end: dbSettings.nextEnd || "",
                notes: dbSettings.nextNotes || "",
                hours: dbSettings.nextStart && dbSettings.nextEnd
                    ? `${dbSettings.nextStart} – ${dbSettings.nextEnd}`
                    : defaultSite.truck.next.hours,
            }
        }
    };
}
