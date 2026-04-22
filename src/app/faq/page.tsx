// Server Component — can export metadata safely
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
    title: "FAQ | Catch the Cravings",
    description: "Got questions about our locations, catering, or menu? We've got answers.",
};

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            <Navbar />

            <section className="px-6 md:px-20 py-12 sm:py-16 md:py-20 relative">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-16">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                            Frequently Asked <span className="text-orange-500">Questions</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl font-medium">
                            Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to contact us directly.
                        </p>
                    </header>

                    <FaqClient />
                </div>
            </section>
        </main>
    );
}
