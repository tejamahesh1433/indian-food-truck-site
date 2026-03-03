"use client";

import Reveal from "@/components/Reveal";
import { useSite } from "@/components/SiteProvider";

export default function Location() {
    const site = useSite();
    return (
        <section id="location" className="section-shell">
            <Reveal>
                <div className="container-shell">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold">Find the Truck</h2>
                            <p className="mt-2 text-gray-300">
                                Today’s stop and hours. Tap directions and come hungry.
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
                                href={`sms:${site.contact.phoneE164}`}
                                className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition"
                            >
                                Message
                            </a>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(site.truck.today.mapsQuery)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition"
                            >
                                Directions
                            </a>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <div className="text-sm text-gray-400">Today</div>
                            <div className="mt-2 text-xl font-semibold">
                                {site.truck.today.label}
                            </div>
                            <div className="mt-1 text-gray-300">{site.truck.today.hours}</div>

                            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                    <div className="text-gray-400">Next stop</div>
                                    <div className="mt-1 font-medium text-gray-200">
                                        {site.truck.next.label}
                                    </div>
                                    <div className="mt-1 text-gray-400">{site.truck.next.hours}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                    <div className="text-gray-400">Catering</div>
                                    <div className="mt-1 font-medium text-gray-200">
                                        Events & offices
                                    </div>
                                    <div className="mt-1 text-gray-400">Request a quote</div>
                                </div>
                            </div>

                            <p className="mt-6 text-gray-400 text-sm">
                                Replace the phone number + schedule later. This layout stays the same.
                            </p>
                        </div>

                        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(255,140,0,0.12)]">
                            <iframe
                                title="Truck location map"
                                className="w-full h-[420px]"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(site.truck.today.mapsQuery)}&output=embed`}
                            />
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
