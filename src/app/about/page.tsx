import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Our Story | Indian Food Truck",
    description: "Learn about our journey bringing authentic Indian street food to Hartford, CT — the spices, the recipes, and the passion behind every dish.",
};

export default function AboutPage() {
    return (
        <main className="bg-black text-white min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-28 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_60%)]" />
                <div className="container-shell relative z-10 text-center">
                    <p className="text-orange-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">Our Story</p>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
                        Made with<br />
                        <span className="text-orange-500">Masala &amp; Heart</span>
                    </h1>
                    <p className="mt-6 text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        From family recipes passed down through generations to the streets of Hartford — every dish we serve carries a story.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="container-shell py-16">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                            How it started
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight">
                            A grandmother&apos;s kitchen.<br />A family&apos;s dream.
                        </h2>
                        <p className="mt-6 text-gray-400 leading-relaxed">
                            It all started with recipes that never had measurements — just instinct, love, and the right blend of spices. Our family has been cooking Indian food for generations, and we wanted to share those flavors with everyone, not just at the dinner table.
                        </p>
                        <p className="mt-4 text-gray-400 leading-relaxed">
                            We launched the truck because we believed great Indian food shouldn&apos;t be complicated or expensive. It should be fast, fresh, and feel like home — whether you&apos;ve grown up eating dal and roti or you&apos;re tasting it for the first time.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { number: "100+", label: "Recipes tested" },
                            { number: "3", label: "Generations of cooking" },
                            { number: "5★", label: "Average rating" },
                            { number: "Daily", label: "Fresh prep" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-black italic text-orange-500">{stat.number}</div>
                                <div className="mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container-shell py-16 border-t border-white/5">
                <div className="text-center mb-12">
                    <p className="text-orange-500 font-black text-[11px] uppercase tracking-[0.3em] mb-3">What drives us</p>
                    <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">Our values</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: "🌿",
                            title: "Fresh Every Day",
                            desc: "We prep from scratch every single morning. No shortcuts, no frozen shortcuts — just fresh ingredients and real spices.",
                        },
                        {
                            icon: "🫙",
                            title: "Authentic Recipes",
                            desc: "Our spice blends are homemade. Every dish follows traditional methods — the kind you won't find in a jar at the grocery store.",
                        },
                        {
                            icon: "🤝",
                            title: "Community First",
                            desc: "We love Hartford. We show up for local events, support community gatherings, and treat every customer like a guest in our home.",
                        },
                    ].map((val) => (
                        <div key={val.title} className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="text-4xl mb-4">{val.icon}</div>
                            <h3 className="text-lg font-black tracking-tight">{val.title}</h3>
                            <p className="mt-3 text-gray-400 leading-relaxed text-sm">{val.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container-shell py-16 border-t border-white/5">
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-10 text-center">
                    <h2 className="text-3xl font-black italic tracking-tighter">
                        Come taste the story
                    </h2>
                    <p className="mt-3 text-gray-400 max-w-md mx-auto">
                        Find us today, try something new, and let the food speak for itself.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/menu"
                            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition shadow-[0_12px_40px_rgba(249,115,22,0.25)]"
                        >
                            View Menu
                        </Link>
                        <Link
                            href="/catering"
                            className="border border-white/15 bg-white/5 hover:border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition"
                        >
                            Book Catering
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
