import { site } from "@/config/site";

export default function InstagramGrid() {
    const images: string[] = []; // empty for now

    return (
        <section className="section-shell">
            <div className="container-shell">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold">From the Truck</h2>
                        <p className="mt-2 text-gray-300">
                            Fresh shots, new specials, and where we’re parked.
                        </p>
                    </div>

                    <a
                        href={site.contact.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden md:inline-flex border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition bg-white/5"
                    >
                        Follow on Instagram
                    </a>
                </div>

                {/* EMPTY STATE */}
                {images.length === 0 && (
                    <div className="mt-10 card p-10 text-center">
                        <div className="mx-auto max-w-md">
                            <div className="text-2xl font-semibold">Photos coming soon</div>
                            <p className="mt-3 text-gray-300">
                                We’re just getting started. Follow us on Instagram to see
                                today’s specials, locations, and behind-the-scenes from the truck.
                            </p>

                            <a
                                href={site.contact.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-400 transition"
                            >
                                Follow @IndianFoodTruck
                            </a>
                        </div>
                    </div>
                )}

                <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        </section>
    );
}
