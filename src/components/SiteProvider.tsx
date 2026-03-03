"use client";

import { createContext, useContext } from "react";
import { site as defaultSite } from "@/config/site";

export type DbSettings = {
    phone: string;
    instagramUrl: string;
    truckToday: string;
    truckNext: string;
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
        contact: {
            ...defaultSite.contact,
            phoneE164: dbSettings.phone || defaultSite.contact.phoneE164,
            phoneDisplay: dbSettings.phone || defaultSite.contact.phoneDisplay,
            instagramUrl: dbSettings.instagramUrl || defaultSite.contact.instagramUrl,
        },
        truck: {
            ...defaultSite.truck,
            today: {
                ...defaultSite.truck.today,
                label: dbSettings.truckToday || defaultSite.truck.today.label
            },
            next: {
                ...defaultSite.truck.next,
                label: dbSettings.truckNext || defaultSite.truck.next.label
            }
        }
    };
}
