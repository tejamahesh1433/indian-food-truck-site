"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import SplitText from "@/components/SplitText";
import DotGrid from "@/components/DotGrid";

export default function Hero() {
    const site = useSite();
    const city = site.brand.city.split(",")[0];

    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-transparent">
                <div className="absolute left-[-20%] top-[-10%] h-[280px] w-[280px] rounded-full bg-orange-500/20 blur-3xl pointer-events-none md:left-[-10%] md:h-[320px] md:w-[320px]" />
                <div className="absolute right-[-15%] top-[10%] h-[240px] w-[240px] rounded-full bg-red-500/15 blur-3xl pointer-events-none md:right-[-8%] md:h-[280px] md:w-[280px]" />
                <div className="absolute bottom-[-10%] left-[10%] h-[220px] w-[220px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none md:left-[20%] md:h-[260px] md:w-[260px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)] pointer-events-none" />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-50 mix-blend-screen pointer-events-none">
              <DotGrid
                dotSize={2}
                gap={24}
                baseColor="#3D3D3D"
                activeColor="#f97316"
                proximity={150}
                shockRadius={200}
                shockStrength={4}
                resistance={600}
                returnDuration={2}
                style={{ pointerEvents: 'auto' }}
              />
            </div>

            <div className="container-shell">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-md mb-2 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                    >
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                        <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">
                            Opening Soon
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
                    >
                        <span className="text-sm font-medium text-white/80">
                            {site.brand.city} • Authentic Street Food
                        </span>
                    </motion.div>

                    <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl md:leading-[1.02]">
                        <SplitText
                          text="Authentic Indian Street Food"
                          delay={40}
                          duration={1.2}
                          ease="power3.out"
                          splitType="words,chars"
                          from={{ opacity: 0, y: 30, rotateX: -60 }}
                          to={{ opacity: 1, y: 0, rotateX: 0 }}
                          textAlign="left"
                          tag="span"
                          className="block"
                        />
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-2 block bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 bg-clip-text text-transparent text-3xl md:text-5xl"
                        >
                            On Wheels in {city}
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.12 }}
                        className="mt-6 max-w-xl text-base leading-7 text-gray-300 md:text-lg"
                    >
                        Freshly cooked. Bold spices. Real street flavors. Quick, hot, and satisfying.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-white/60"
                    >
                        <span>Fresh daily</span>
                        <span className="opacity-40">•</span>
                        <span>Vegetarian options</span>
                        <span className="opacity-40">•</span>
                        <span>Catering available</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.18 }}
                        className="mt-9 flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            href="/menu"
                            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-3.5 font-semibold text-black transition hover:scale-[1.02] hover:bg-orange-400 shadow-[0_12px_40px_rgba(255,140,0,0.25)] w-full sm:w-auto"
                        >
                            View Menu
                        </Link>
                        <a
                            href="#location"
                            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-white shadow-[0_8px_24px_rgba(255,255,255,0.04)] transition hover:border-white/35 hover:bg-white/10 w-full sm:w-auto"
                        >
                            Find the Truck
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
