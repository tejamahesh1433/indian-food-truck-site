import Image from "next/image";
import Reveal from "@/components/Reveal";

const dishes = [
    {
        name: "Butter Chicken",
        desc: "Creamy tomato curry, finished with butter and spice.",
        tags: ["Popular"],
        image: "/images/menu/butter-chicken.png",
    },
    {
        name: "Paneer Tikka Wrap",
        desc: "Charred paneer, mint sauce, crunchy onions, warm wrap.",
        tags: ["Veg"],
        image: "/images/menu/paneer-wrap.png",
    },
    {
        name: "Chicken Tikka Roll",
        desc: "Smoky tikka, tangy chutney, street-style bite.",
        tags: ["Spicy"],
        image: "/images/menu/tikka-roll.png",
    },
    {
        name: "Samosa Chaat",
        desc: "Crispy samosa, yogurt, chutneys, masala crunch.",
        tags: ["Veg"],
        image: "/images/menu/samosa-chaat.png",
    },
    {
        name: "Mango Lassi",
        desc: "Thick, chilled, sweet mango yogurt drink.",
        tags: ["Drink"],
        image: "/images/menu/mango-lassi.png",
    },
];

export default function SignatureDishes() {
    return (
        <section className="section-shell">
            <Reveal>
                <div className="container-shell">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold">Signature Dishes</h2>
                            <p className="mt-2 text-gray-300">Crowd favorites that hit every time.</p>
                        </div>
                        <div className="hidden md:block text-sm text-gray-400">
                            Veg • Spicy • Popular
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dishes.map((d) => (
                            <div key={d.name} className="group card overflow-hidden hover:bg-white/10 transition">
                                <div className="relative h-48">
                                    <Image
                                        src={d.image}
                                        alt={d.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover group-hover:scale-[1.03] transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-xl font-semibold">{d.name}</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-gray-300">{d.desc}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {d.tags.map((t) => (
                                            <span key={t} className="pill">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </Reveal>
        </section>
    );
}
