"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";

export default function Hero() {
    const site = useSite();

    return (
        <section className="min-h-[92vh] flex items-center">
            <div className="container-shell">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="inline-flex items-center gap-2 pill"
                    >
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        {site.brand.city} • Indian Street Food
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.05 }}
                        className="mt-5 text-5xl md:text-7xl font-bold leading-[1.05]"
                    >
                        Authentic Indian Street Food
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-400">
                            On Wheels in {site.brand.city.split(',')[0]}
                        </span>
                    </motion.h1>

                    <p className="mt-6 text-lg text-gray-300">
                        Freshly cooked. Bold spices. Real street flavors. Quick, hot, and satisfying.
                    </p>

                    <div className="mt-9 flex gap-4 flex-wrap">
                        <Link
                            href="/menu"
                            className="bg-orange-500 text-black px-7 py-3.5 rounded-full font-semibold hover:bg-orange-400 transition shadow-[0_12px_40px_rgba(255,140,0,0.25)]"
                        >
                            View Menu
                        </Link>

                        <a
                            href="#location"
                            className="border border-white/15 px-7 py-3.5 rounded-full hover:border-white/40 transition bg-white/5"
                        >
                            Find the Truck
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
