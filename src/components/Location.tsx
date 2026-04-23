"use client";

import dynamic from "next/dynamic";
import { useSite } from "@/components/SiteProvider";
import GlassSurface from "@/components/GlassSurface";
import Reveal from "@/components/Reveal";

const MapFrame = dynamic(() => Promise.resolve(({ query }: { query: string }) => (
    <iframe
        title="Truck location map"
        className="w-full h-[450px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
    />
)), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-[450px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
            <p className="text-gray-500 font-medium tracking-wide">Loading location map...</p>
        </div>
    )
});

export default function Location() {

    const site = useSite();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const today = site.truck.today as any;

    const statusConfig: Record<string, { label: string; color: string; animate: boolean }> = {
        SERVING: { label: "Serving Now", color: "bg-green-500", animate: true },
        OPENING_SOON: { 
            label: today.remainingMins > 0 ? `Opening in ${today.remainingMins} minute${today.remainingMins !== 1 ? 's' : ''}` : "Opening Soon", 
            color: "bg-blue-500", 
            animate: true 
        },
        SOLD_OUT: { label: "Sold Out", color: "bg-red-500", animate: false },
        WEATHER_DELAY: { label: "Weather Delay", color: "bg-orange-500", animate: false },
        CLOSING_SOON: { 
            label: today.remainingMins > 0 ? `Closing in ${today.remainingMins} minute${today.remainingMins !== 1 ? 's' : ''}` : "Closing Soon", 
            color: "bg-orange-500", 
            animate: true 
        },
        CLOSED: { label: "Closed", color: "bg-gray-500", animate: false },
    };

    const status = statusConfig[today.status || "CLOSED"] || statusConfig.CLOSED;

    return (
        <section id="location" className="section-shell">
            <Reveal>
                <div className="container-shell">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold">Find the Truck</h2>
                            <p className="mt-2 text-gray-300">
                                Real-time status and upcoming stops. Come hungry!
                            </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <a
                                href={`tel:${site.contact.phoneE164}`}
                                className="bg-orange-500 text-black px-5 py-3 rounded-full font-semibold hover:bg-orange-400 transition"
                            >
                                Call
                            </a>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(today.mapsQuery)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition"
                            >
                                Directions
                            </a>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GlassSurface 
                            borderRadius={24} 
                            backgroundOpacity={0.2} 
                            distortionScale={-150}
                            saturation={2}
                            mixBlendMode="screen"
                            displace={0.5}
                            className="flex flex-col justify-between"
                        >
                            <div className="p-6 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">Today</div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color} text-white flex items-center gap-1.5 shadow-lg shadow-${status.color.split('-')[1]}-500/20`}>
                                            {status.animate && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                            {status.label}
                                        </div>
                                    </div>

                                    {today.status === "CLOSED" ? (
                                        <div className="mt-2 text-2xl md:text-3xl font-bold text-white/40">
                                            Closed for today
                                        </div>
                                    ) : today.status === "SOLD_OUT" ? (
                                        <div className="mt-2 text-2xl md:text-3xl font-bold text-red-500 flex items-center gap-3">
                                            <span className="text-2xl md:text-3xl">❌</span> SOLD OUT TODAY
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-2 text-2xl md:text-3xl font-bold text-white">
                                                {today.label || "Check back soon!"}
                                            </div>
                                            {today.address && (
                                                <div className="mt-1 text-sm md:text-base text-gray-400 font-medium">
                                                    {today.address}
                                                </div>
                                            )}
                                            <div className="mt-2 text-lg text-orange-400 font-medium tracking-tight">
                                                {today.hours}
                                            </div>
                                        </>
                                    )}

                                    {today.notes && (
                                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 italic">
                                            &quot; {today.notes} &quot;
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10 text-sm">
                                    <a href="/catering" className="rounded-2xl border border-white/10 bg-orange-500/5 hover:bg-orange-500/10 transition p-4 flex flex-col items-center sm:flex-row sm:justify-between group">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">Catering</div>
                                            <div className="font-bold text-gray-100 group-hover:text-orange-300 transition flex items-center gap-1">
                                                Book the Truck for your Event
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex items-center gap-1 text-orange-400 font-bold text-xs uppercase tracking-widest bg-orange-500/10 px-4 py-2 rounded-full">
                                            Request Quote
                                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </GlassSurface>

                        {today.mapsQuery ? (
                            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(255,140,0,0.12)] group">
                                {today.lat && today.lng && (
                                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-orange-500/30 flex items-center gap-2 animate-bounce-subtle">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Live Pin Active</span>
                                    </div>
                                )}
                                <MapFrame query={today.mapsQuery} />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(255,140,0,0.04)] flex flex-col items-center justify-center h-[450px] gap-4">
                                <span className="text-5xl opacity-30">📍</span>
                                <p className="text-sm text-gray-500 font-medium">No active location today</p>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(site.contact.phoneDisplay)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-orange-500/70 hover:text-orange-400 transition font-semibold"
                                >
                                    Follow us on Instagram for updates →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
