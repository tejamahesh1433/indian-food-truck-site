import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Catch the Cravings",
    description: "Your privacy matters to us. Learn how Catch the Cravings handles your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-black text-white relative flex flex-col pt-24">
            <Navbar />

            <div className="flex-grow container-shell py-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-gray-400">Last updated: March 2026</p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">1. Information We Collect</h2>
                        <p className="text-gray-300 leading-relaxed">
                            When you submit a catering request through our website, we collect your name, email address, phone number, and any event details you provide. We also collect basic, anonymized analytics data about how visitors use our website.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">2. How We Use Your Information</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The information collected via our catering and contact forms is used solely to respond to your inquiry and coordinate our services. We do not sell or share your personal information with third parties for marketing purposes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">3. Data Security and Spam Protection</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We implement standard security measures to protect your submitted data. Our forms employ invisible honeypot techniques and rate-limiting to prevent spam and automated bot submissions.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-orange-400">4. Analytics Tracking</h2>
                        <p className="text-gray-300 leading-relaxed">
                            This website uses Vercel Analytics, a privacy-friendly analytics service that does not track your IP address or use cookies for tracking personal behavior. It only provides aggregated insights into traffic and page views to help us improve site performance.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
