"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { site as defaultSite } from "@/config/site";

import { normalizePhone } from "@/lib/utils/phone";

export type DbSettings = {
    phone: string;
    instagramUrl: string;
    publicEmail?: string | null;
    businessName?: string | null;
    cityState?: string | null;
    footerMessage?: string | null;
    bannerEnabled?: boolean | null;
    bannerText?: string | null;
    logoUrl?: string | null;

    truckToday: string;
    truckNext: string;

    // Advanced Today
    todayLocation?: string | null;
    todayStart?: string | null;
    todayEnd?: string | null;
    todayStatus?: string | null;
    todayNotes?: string | null;

    // Advanced Next
    nextLocation?: string | null;
    nextDate?: string | null;
    nextStart?: string | null;
    nextEnd?: string | null;
    nextNotes?: string | null;

    cateringEnabled?: boolean | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weeklySchedule?: any | null;
};

const formatTime12h = (timeStr?: string | null) => {
    if (!timeStr) return "";
    try {
        const [hourStr, minuteStr] = timeStr.split(':');
        let hours = parseInt(hourStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minuteStr} ${ampm}`;
    } catch {
        return timeStr;
    }
};

const SiteContext = createContext<{ settings: DbSettings | null; liveDate: Date } | null>(null);

export function SiteProvider({ children, settings: initialSettings }: { children: React.ReactNode, settings: DbSettings | null }) {
    const [liveDate, setLiveDate] = useState(new Date());
    const [settings, setSettings] = useState<DbSettings | null>(initialSettings);

    useEffect(() => {
        // 1. Clock timer (updates every minute)
        const clockTimer = setInterval(() => setLiveDate(new Date()), 60000);

        // 2. Settings Poller (updates every 10 seconds to keep sync with admin)
        const pollSettings = async () => {
            try {
                // Add timestamp to prevent browser caching
                const res = await fetch(`/api/settings?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Only update and log if something actually changed
                    // (prevents unnecessary re-renders project-wide)
                    setSettings(prev => {
                        // Exclude updatedAt from comparison as it changes on every save 
                        // but doesn't necessarily mean a visual change occurred.
                        const sanitize = (obj: Record<string, unknown> | null) => {
                            if (!obj) return {};
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { updatedAt, ...rest } = obj;
                            return rest;
                        };

                        if (JSON.stringify(sanitize(prev)) === JSON.stringify(sanitize(data))) return prev;
                        
                        console.log("[SiteProvider] Settings synchronized:", data.businessName, "@", new Date().toLocaleTimeString());
                        return data;
                    });
                }
            } catch (err) {
                console.error("[SiteProvider] Failed to poll settings:", err);
            }
        };

        const settingsTimer = setInterval(pollSettings, 10000);

        // Initial fetch on mount to ensure client is in sync with latest DB state immediately 
        pollSettings();

        return () => {
            clearInterval(clockTimer);
            clearInterval(settingsTimer);
        };
    }, []);

    return (
        <SiteContext.Provider value={{ settings, liveDate }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    const context = useContext(SiteContext);
    const dbSettings = context?.settings;
    const now = context?.liveDate || new Date();

    if (!dbSettings) return defaultSite;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const currentDayIndex = now.getDay();
    const currentDayName = dayNames[currentDayIndex];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weekly = dbSettings.weeklySchedule as Record<string, any> | null;
    const currentSchedule = weekly?.[currentDayName] || {};

    const activeStart = currentSchedule.start || "";
    const activeEnd = currentSchedule.end || "";
    const activeStatusRaw = (currentSchedule.status || "CLOSED") as string;
    const activeNotes = (currentSchedule.notes || "") as string;

    // --- Automatic Status Derivation ---
    const { status: activeStatus, remainingMins } = (() => {
        // 1. Manual Hard Overrides always take precedence
        if (activeStatusRaw === "SOLD_OUT" || activeStatusRaw === "WEATHER_DELAY") {
            return { status: activeStatusRaw, remainingMins: 0 };
        }

        // 2. If no hours are set, we can't automate - return CLOSED
        if (!activeStart || !activeEnd) return { status: "CLOSED", remainingMins: 0 };

        try {
            const [startH, startM] = activeStart.split(':').map(Number);
            const [endH, endM] = activeEnd.split(':').map(Number);
            
            const nowH = now.getHours();
            const nowM = now.getMinutes();
            
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;
            const nowTotal = nowH * 60 + nowM;

            // --- Window Checks ---

            // 1. Within the active serving window
            if (nowTotal >= startTotal && nowTotal < endTotal) {
                // If within last 30 minutes of serving
                if (nowTotal >= endTotal - 30) {
                    return { status: "CLOSING_SOON", remainingMins: endTotal - nowTotal };
                }
                return { status: "SERVING", remainingMins: endTotal - nowTotal };
            }
            
            // 2. Before the serving window
            if (nowTotal < startTotal) {
                // If within 30 minutes of opening
                if (nowTotal >= startTotal - 30) {
                    return { status: "OPENING_SOON", remainingMins: startTotal - nowTotal };
                }
                return { status: "CLOSED", remainingMins: 0 };
            }

            // 3. Past the serving window (Automated Close)
            return { status: "CLOSED", remainingMins: 0 };
        } catch {
            return { status: "CLOSED", remainingMins: 0 };
        }
    })();

    let nextStart = dbSettings.nextStart || "";
    let nextEnd = dbSettings.nextEnd || "";
    const nextLabel = dbSettings.nextLocation || dbSettings.truckNext || defaultSite.truck.next.label;
    let nextDayName = "";
    
    // Attempt to automatically derive "Next Stop" from the weekly schedule
    if (weekly) {
        for (let i = 1; i <= 7; i++) {
            const checkIndex = (currentDayIndex + i) % 7;
            const checkDayName = dayNames[checkIndex];
            const schedule = weekly[checkDayName];
            
            if (schedule && schedule.status && schedule.status !== "CLOSED" && schedule.status !== "SOLD_OUT") {
                nextStart = schedule.start || "";
                nextEnd = schedule.end || "";
                // Do NOT overwrite nextLabel with todayLocation anymore as it might be different
                nextDayName = checkDayName.slice(0, 3);
                break;
            }
        }
    }

    return {
        ...defaultSite,
        cateringEnabled: dbSettings.cateringEnabled ?? true,
        brand: {
            ...defaultSite.brand,
            name: dbSettings.businessName || defaultSite.brand.name,
            city: dbSettings.cityState || defaultSite.brand.city,
            logoUrl: dbSettings.logoUrl || "",
        },
        contact: {
            ...defaultSite.contact,
            phoneE164: normalizePhone(dbSettings.phone || defaultSite.contact.phoneE164),
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
                label: dbSettings.todayLocation || defaultSite.truck.today.label,
                address: dbSettings.truckToday || "",
                start: activeStart,
                end: activeEnd,
                status: activeStatus,
                notes: activeNotes,
                remainingMins,
                hours: activeStart && activeEnd
                    ? `${formatTime12h(activeStart)} – ${formatTime12h(activeEnd)}`
                    : activeStatus === "CLOSED" ? "Closed" : defaultSite.truck.today.hours,
                mapsQuery: dbSettings.truckToday || dbSettings.todayLocation || defaultSite.truck.today.mapsQuery,
            },
            next: {
                ...defaultSite.truck.next,
                label: nextLabel,
                date: dbSettings.nextDate || "",
                start: nextStart,
                end: nextEnd,
                notes: dbSettings.nextNotes || "",
                hours: nextStart && nextEnd
                    ? (nextDayName ? `${nextDayName} · ${formatTime12h(nextStart)} – ${formatTime12h(nextEnd)}` : `${formatTime12h(nextStart)} – ${formatTime12h(nextEnd)}`)
                    : defaultSite.truck.next.hours,
            }
        }
    };
}
