import Link from "next/link";
import { site } from "@/config/site";

export default function Footer() {
    return (
        <footer className="mt-10 border-t border-white/10 bg-black/30">
            <div className="container-shell py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-orange-500/90 text-black font-bold flex items-center justify-center shadow-[0_12px_40px_rgba(255,140,0,0.22)]">
                                {site.brand.short}
                            </div>
                            <div className="leading-tight">
                                <div className="font-semibold">{site.brand.name}</div>
                                <div className="text-xs text-gray-400">{site.brand.city}</div>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-300 max-w-sm">
                            {site.brand.tagline}. Freshly cooked street favorites, served fast.
                        </p>

                        <div className="mt-6 flex gap-3 flex-wrap">
                            <a
                                href={`tel:${site.contact.phoneE164}`}
                                className="bg-orange-500 text-black px-5 py-3 rounded-full font-semibold hover:bg-orange-400 transition"
                            >
                                Call
                            </a>
                            <a
                                href={site.contact.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition bg-white/5"
                            >
                                Instagram
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <div className="text-sm font-semibold text-gray-200">Quick links</div>
                        <div className="mt-4 grid gap-3 text-gray-300">
                            <Link href="/menu" className="hover:text-white transition">
                                Menu
                            </Link>
                            <Link href="/#location" className="hover:text-white transition">
                                Find the Truck
                            </Link>
                            <Link href="/catering" className="hover:text-white transition">
                                Catering
                            </Link>
                        </div>

                        <div className="mt-8 text-sm font-semibold text-gray-200">Hours</div>
                        <div className="mt-3 text-gray-300 text-sm">
                            <div className="flex items-center justify-between max-w-xs">
                                <span>Today</span>
                                <span className="text-gray-400">{site.truck.today.hours}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between max-w-xs">
                                <span>Next stop</span>
                                <span className="text-gray-400">{site.truck.next.hours}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="card p-6">
                        <div className="text-xl font-semibold">Catering & Events</div>
                        <p className="mt-2 text-gray-300">
                            Offices, birthdays, weddings, campus events. We’ll make it easy.
                        </p>
                        <Link
                            href="/catering"
                            className="mt-6 inline-flex bg-white text-black px-5 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                        >
                            Request Catering
                        </Link>

                        <div className="mt-6 text-sm text-gray-400">
                            Prefer quick contact?{" "}
                            <a className="underline hover:text-white" href={`sms:${site.contact.phoneE164}`}>
                                Text us
                            </a>
                            .
                        </div>
                    </div>
                </div>

                <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm text-gray-400">
                    <div>
                        © {new Date().getFullYear()} {site.brand.name}. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <Link href="/menu" className="hover:text-white transition">
                            Menu
                        </Link>
                        <Link href="/catering" className="hover:text-white transition">
                            Catering
                        </Link>
                        <Link href="/admin/login" className="hover:text-white transition">
                            Owner Login
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
