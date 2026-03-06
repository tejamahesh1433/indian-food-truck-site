"use client";

import Reveal from "@/components/Reveal";
import { useSite } from "@/components/SiteProvider";

export default function Location() {
    const site = useSite();
    const today = site.truck.today;
    const next = site.truck.next;

    const statusConfig: Record<string, { label: string; color: string; animate: boolean }> = {
        SERVING: { label: "Serving Now", color: "bg-green-500", animate: true },
        ON_THE_WAY: { label: "On the Way", color: "bg-blue-500", animate: true },
        SOLD_OUT: { label: "Sold Out", color: "bg-red-500", animate: false },
        WEATHER_DELAY: { label: "Weather Delay", color: "bg-orange-500", animate: false },
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
                                href={`https://maps.google.com/?q=${encodeURIComponent(today.label)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition"
                            >
                                Directions
                            </a>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">Today</div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color} text-white flex items-center gap-1.5 shadow-lg shadow-${status.color.split('-')[1]}-500/20`}>
                                        {status.animate && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        {status.label}
                                    </div>
                                </div>

                                <div className="mt-2 text-2xl md:text-3xl font-bold text-white">
                                    {today.label || "Check back soon!"}
                                </div>
                                <div className="mt-2 text-lg text-orange-400 font-medium tracking-tight">
                                    {today.start && today.end ? `${today.start} – ${today.end}` : today.hours}
                                </div>

                                {today.notes && (
                                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 italic">
                                        " {today.notes} "
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 relative overflow-hidden">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Next stop</div>
                                    <div className="font-bold text-gray-100 truncate">
                                        {next.label}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                        {next.date} {next.start ? `· ${next.start}` : ""}
                                    </div>
                                </div>
                                <a href="/catering" className="rounded-2xl border border-white/10 bg-orange-500/5 hover:bg-orange-500/10 transition p-4 group">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Catering</div>
                                    <div className="font-bold text-gray-100 group-hover:text-orange-300 transition flex items-center gap-1">
                                        Book Now
                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">Request a quote</div>
                                </a>
                            </div>
                        </div>

                        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(255,140,0,0.12)]">
                            <iframe
                                title="Truck location map"
                                className="w-full h-[450px]"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(today.label)}&output=embed`}
                            />
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
