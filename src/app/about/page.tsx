import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Our Story | Catch the Cravings – Hartford, CT",
    description: "Authentic Andhra & Telangana street food on wheels in Hartford, CT. Hand-toasted spices, slow-cooked biryanis, and family recipes three generations in the making.",
};

const dishes = [
    { emoji: "🍛", name: "Chicken Biryani", desc: "Slow-cooked dum biryani, Andhra style — fiery, fragrant, and nothing like the takeout version." },
    { emoji: "🔥", name: "Guntur Chicken", desc: "Named after the chilli capital of India. Coated in a dry rub of Guntur mirchi that builds heat with every bite." },
    { emoji: "🫓", name: "Garlic Naan", desc: "Hand-stretched, tandoor-baked, brushed with ghee and garlic the moment it hits the plate." },
    { emoji: "🥘", name: "Dal Tadka", desc: "Yellow lentils with a sizzling tempering of cumin, dried red chillies, and ghee poured tableside." },
    { emoji: "🍢", name: "Chicken 65", desc: "Crispy, spiced, tossed in curry leaves and green chillies. Hartford&apos;s new favourite starter." },
    { emoji: "🧆", name: "Samosa Chaat", desc: "Crushed samosa layered with chickpea curry, tamarind, mint chutney, and sev. Street food at its finest." },
];

const promises = [
    { icon: "🌿", title: "No shortcuts", desc: "Our masala blends are ground fresh. Jarred spices have no place in this truck." },
    { icon: "🔥", title: "Heat you can trust", desc: "We offer mild, medium, and Andhra hot. We'll be honest — Andhra hot is very hot." },
    { icon: "🫙", title: "Made to order", desc: "Nothing sits under a lamp. Your order is cooked when you place it." },
    { icon: "💛", title: "Family recipes only", desc: "Every dish on the menu has been made in our family for at least two generations." },
];

export default function AboutPage() {
    return (
        <main className="bg-black text-white min-h-screen">
            <Navbar />

            {/* ── HERO ── */}
            <section className="relative pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-24 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.18),transparent)]" />
                {/* Spice strip */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <div className="container-shell relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.35em] px-4 py-2 rounded-full mb-8">
                        <span>🌶️</span> Andhra &amp; Telangana • Hartford, CT
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85]">
                        Cooked with fire.<br />
                        <span className="text-orange-500">Served with soul.</span>
                    </h1>
                    <p className="mt-8 text-gray-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Three generations of Andhra kitchen wisdom, hand-pounded masalas, and the kind of heat that makes you come back for more — now rolling through Hartford.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/menu"
                            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_12px_40px_rgba(249,115,22,0.3)] hover:-translate-y-0.5"
                        >
                            See the Menu
                        </Link>
                        <Link
                            href="/catering"
                            className="border border-white/15 bg-white/5 hover:border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:-translate-y-0.5"
                        >
                            Book Catering
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── SCROLLING SPICE MARQUEE ── */}
            <div className="border-y border-white/5 bg-white/[0.02] overflow-hidden py-4">
                <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max">
                    {[...Array(3)].map((_, i) => (
                        <span key={i} className="flex items-center gap-8 px-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">
                            <span className="text-orange-500/60">✦</span> Guntur Chillies
                            <span className="text-orange-500/60">✦</span> Curry Leaves
                            <span className="text-orange-500/60">✦</span> Dum Biryani
                            <span className="text-orange-500/60">✦</span> Tamarind
                            <span className="text-orange-500/60">✦</span> Mustard Seeds
                            <span className="text-orange-500/60">✦</span> Black Cardamom
                            <span className="text-orange-500/60">✦</span> Andhra Spice
                            <span className="text-orange-500/60">✦</span> Telangana Soul
                        </span>
                    ))}
                </div>
            </div>

            {/* ── ORIGIN STORY ── */}
            <section className="container-shell py-24">
                <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
                    <div className="space-y-7">
                        <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            The Heritage
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">
                            Grandma never used<br />a measuring spoon.
                        </h2>
                        <div className="space-y-5 text-gray-400 leading-relaxed text-[17px]">
                            <p>
                                It all started in a small kitchen in Andhra Pradesh. No recipe cards, no timers — just the &quot;andaaz&quot; (instinct) that only comes after decades of cooking. The crack of mustard seeds hitting hot oil, the hand-pounded masalas, the patience to wait until the gravy is exactly right.
                            </p>
                            <p>
                                That knowledge passed to us, and now we&apos;re bringing it to Hartford. Every dish on this truck is a direct line back to that kitchen — the same techniques, the same spice ratios, the same rule: if it doesn&apos;t smell incredible, it doesn&apos;t leave the truck.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Est. in Hartford, CT</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 bg-orange-500/8 blur-3xl rounded-full" />
                        <div className="relative grid grid-cols-2 gap-4">
                            {[
                                { number: "15+", label: "Signature Spices", desc: "Hand-toasted every morning" },
                                { number: "3", label: "Generations", desc: "of Andhra recipes" },
                                { number: "100%", label: "Fresh Daily", desc: "Nothing pre-made" },
                                { number: "0", label: "Shortcuts", desc: "Ever. Not once." },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/8 hover:border-orange-500/20 transition-all duration-300 group">
                                    <div className="text-4xl font-black italic text-orange-500 transition-transform duration-500 group-hover:-translate-y-0.5">{stat.number}</div>
                                    <div className="mt-2 text-[11px] font-black text-white uppercase tracking-wider">{stat.label}</div>
                                    <div className="mt-1 text-[10px] text-gray-600 font-bold uppercase tracking-tight">{stat.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MORNING RITUAL ── */}
            <section className="bg-white/[0.015] border-y border-white/5 py-24">
                <div className="container-shell">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            Behind the scenes
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">The 5 AM ritual</h2>
                        <p className="mt-5 text-gray-400 text-lg leading-relaxed">
                            By the time you order at noon, we&apos;ve already been cooking for 7 hours.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                time: "05:00 AM",
                                emoji: "🌶️",
                                title: "The Spice Toast",
                                desc: "Whole cumin, coriander, black pepper, and dried Guntur chillies go into a dry pan. We toast until the kitchen smells like South India.",
                            },
                            {
                                time: "07:30 AM",
                                emoji: "🫕",
                                title: "The Long Simmer",
                                desc: "Biryanis take 90 minutes minimum. Curries take two hours. We let them go low and slow — the flavour is in the patience.",
                            },
                            {
                                time: "11:00 AM",
                                emoji: "🔥",
                                title: "Tandoor Fires Up",
                                desc: "The clay oven reaches 480°C. Marinated chicken goes in. The first batch of naan is ready. We open in an hour.",
                            },
                        ].map((step, idx) => (
                            <div key={step.title} className="relative group">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full hover:border-orange-500/20 hover:bg-white/8 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-6">
                                        <span className="text-4xl">{step.emoji}</span>
                                        <span className="text-white/10 text-5xl font-black italic leading-none">0{idx + 1}</span>
                                    </div>
                                    <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.25em] mb-2">{step.time}</p>
                                    <h3 className="text-xl font-black tracking-tight text-white mb-3">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SIGNATURE DISHES ── */}
            <section className="container-shell py-24">
                <div className="text-center mb-14">
                    <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                        What we&apos;re known for
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                        Dishes that people<br />drive across town for
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dishes.map((dish) => (
                        <div key={dish.name} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-orange-500/25 hover:bg-white/8 transition-all duration-300 group">
                            <span className="text-4xl">{dish.emoji}</span>
                            <h3 className="mt-4 font-black text-lg tracking-tight group-hover:text-orange-400 transition-colors">{dish.name}</h3>
                            <p className="mt-2 text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: dish.desc }} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 border border-white/15 bg-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                        View Full Menu
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── OUR PROMISES ── */}
            <section className="bg-white/[0.015] border-y border-white/5 py-24">
                <div className="container-shell">
                    <div className="text-center mb-14">
                        <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            Our standards
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">What we promise you</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {promises.map((p) => (
                            <div key={p.title} className="text-center space-y-3 p-6">
                                <div className="text-5xl">{p.icon}</div>
                                <h3 className="font-black text-base tracking-tight">{p.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HARTFORD LOVE ── */}
            <section className="container-shell py-24">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="space-y-7">
                        <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            Roots in Hartford
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">
                            Hartford deserves<br />real Indian food.
                        </h2>
                        <div className="space-y-5 text-gray-400 leading-relaxed text-[17px]">
                            <p>
                                Hartford is a city with real appetite for bold, global flavours — and we&apos;re here to meet that. From Bushnell Park to downtown office crowds, we show up with food that doesn&apos;t pull punches.
                            </p>
                            <p>
                                We also cater — and we do it properly. Corporate lunches, birthday parties, weddings, campus events. Chafing dishes, signage, the works. If you&apos;re feeding 20 or 200, we&apos;ll make it feel like a proper feast.
                            </p>
                        </div>
                        <Link
                            href="/catering"
                            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-7 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_8px_30px_rgba(249,115,22,0.2)]"
                        >
                            Enquire About Catering
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>

                    {/* Visual cards replacing empty placeholders */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { emoji: "🎪", label: "Local Events", sub: "We show up at festivals, markets & pop-ups" },
                            { emoji: "🏢", label: "Office Catering", sub: "Weekday lunch drops for your whole team" },
                            { emoji: "🎂", label: "Private Events", sub: "Birthdays, graduations, celebrations" },
                            { emoji: "🎓", label: "Campus Events", sub: "UConn, Trinity, and beyond" },
                        ].map((card) => (
                            <div key={card.label} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-orange-500/20 hover:bg-white/8 transition-all duration-300 group">
                                <div className="text-3xl mb-3">{card.emoji}</div>
                                <div className="font-black text-sm uppercase tracking-wide text-white group-hover:text-orange-400 transition-colors">{card.label}</div>
                                <div className="mt-1 text-[11px] text-gray-500 leading-snug">{card.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="container-shell pb-24">
                <div className="relative bg-gradient-to-br from-orange-600/20 via-orange-500/5 to-transparent border border-orange-500/25 rounded-3xl sm:rounded-[3rem] p-7 sm:p-12 md:p-20 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12),transparent_65%)]" />
                    <div className="relative z-10">
                        <span className="text-5xl block mb-6">🌶️</span>
                        <h2 className="text-3xl sm:text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.95] sm:leading-[0.9] mb-5">
                            Don&apos;t just read<br />
                            <span className="text-orange-500">about it. Taste it.</span>
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                            Find the truck today, pick something you&apos;ve never tried before, and let the food do the talking.
                        </p>
                        <div className="mt-12 flex flex-wrap justify-center gap-5">
                            <Link
                                href="/menu"
                                className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-[0_15px_45px_rgba(249,115,22,0.35)] hover:-translate-y-1"
                            >
                                Explore the Menu
                            </Link>
                            <Link
                                href="/#location"
                                className="border border-white/20 bg-white/5 hover:border-white/35 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all hover:-translate-y-1"
                            >
                                Find Today&apos;s Stop
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
