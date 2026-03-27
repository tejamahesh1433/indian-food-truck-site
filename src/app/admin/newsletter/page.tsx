import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewsletterClient from "./NewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
    });

    const serializableSubscribers = subscribers.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString()
    }));

    return (
        <main className="mx-auto max-w-5xl px-6 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
                    <p className="mt-2 text-gray-400">
                        View, export, and manage your email list.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
                >
                    Back to Dashboard
                </Link>
            </div>

            <NewsletterClient initialSubscribers={serializableSubscribers} />
        </main>
    );
}
