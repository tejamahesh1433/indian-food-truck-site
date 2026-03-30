import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Indian Food Truck",
    description: "Terms and conditions for ordering and using the Indian Food Truck website.",
};

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-black text-white relative flex flex-col pt-24">
            <Navbar />

            <div className="flex-grow container-shell py-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-gray-400">Last updated: March 2026</p>
                    </div>

                    <p className="text-gray-300 leading-relaxed">
                        Thanks for ordering with us! These terms cover how our ordering and catering process works. They&apos;re here to set clear expectations on both sides — nothing complicated.
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">1. Online Orders & Payment</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Payments are handled securely through Stripe and are charged at checkout. All prices are in USD. The amount shown at checkout is what you&apos;ll be charged — no surprises. Menu prices may be updated from time to time, but any change won&apos;t affect an order you&apos;ve already placed.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">2. Pickup & How It Works</h2>
                        <p className="text-gray-300 leading-relaxed">
                            All orders are <strong className="text-white">pickup only</strong> — we don&apos;t offer delivery at this time. Once your order is ready, you&apos;ll see it updated on your order tracking page. We do our best to hold orders, but if an order hasn&apos;t been picked up within 30 minutes of being marked &quot;Ready,&quot; we may need to move on — so we appreciate you coming by as soon as you can.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">3. Refunds & Issues with Your Order</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Because we&apos;re making fresh food, we generally can&apos;t offer refunds after an order is placed and paid. That said, if something is wrong — like a missing item or a quality issue — just let us know right away at the truck or through the order chat, and we&apos;ll do our best to make it right. We really do care about every customer having a good experience.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">4. Catering Inquiries</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Filling out our catering form is just the first step — it&apos;s not a confirmed booking yet. Once we review your request and everything looks good, we&apos;ll reach out to confirm availability and work out the details together. Any deposit or cancellation terms specific to your event will be shared at that point in a separate agreement.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">5. Allergens & Dietary Needs</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Our kitchen works with common allergens like nuts, dairy, gluten, soy, and eggs. We&apos;re happy to try and accommodate dietary needs, but we can&apos;t guarantee that any dish is completely free from cross-contact. If you have a serious allergy, please talk to us before ordering — we want to make sure you&apos;re safe.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">6. Menu & Availability</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We do our best to keep the menu, pricing, and location info up to date. Occasionally an item may run out or be unavailable — if that happens with something you ordered, we&apos;ll let you know and issue a refund for that item if we can&apos;t offer a suitable alternative.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">7. Your Account</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Keeping your login details secure is important — please don&apos;t share your password with anyone. If you ever notice something unusual with your account, reach out to us. We also ask that the information you provide when signing up is accurate, just so we can get in touch if needed.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">8. Our Content</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Everything on this site — photos, text, the logo, the design — belongs to Indian Food Truck. Please don&apos;t reproduce or use it without reaching out to us first.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">9. Updates to These Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            If we ever need to update these terms, we&apos;ll post the changes here. Nothing dramatic — just keeping things current as the business grows.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">10. Questions?</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Got a question about any of this? Feel free to use the contact form on our FAQ page, or just come find us at the truck — we&apos;re always happy to chat.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
