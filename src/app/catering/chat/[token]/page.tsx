import { prisma } from "@/lib/prisma";
import CustomerChatClient from "./ui/CustomerChatClient";
import Navbar from "@/components/Navbar";
import { site } from "@/config/site";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomerChatPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    // Check if valid chat token
    const req = await prisma.cateringRequest.findUnique({
        where: { chatToken: token },
        include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!req || !req.chatEnabled) {
        return (
            <main className="min-h-screen bg-neutral-900 pt-32 pb-12 flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-black/40 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Chat Unavailable</h1>
                    <p className="text-gray-400 mb-6">
                        This catering request chat link is invalid, expired, or has been closed by the admin.
                    </p>
                    <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition">
                        Return to Homepage
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-900 pb-12 px-6">
            <Navbar />
            <div className="max-w-2xl mx-auto space-y-4 pt-32">
                <Link
                    href="/catering"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition text-xs font-bold uppercase tracking-wider mb-4 inline-flex"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Catering
                </Link>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Event Chat</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Message {site.brand.short} directly regarding your catering quote.
                        </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">Quote Status</span>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${req.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : req.status === 'CONTACTED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                            {req.status}
                        </span>
                    </div>
                </div>

                <CustomerChatClient
                    token={token}
                    initialMessages={req.messages.map((m) => ({
                        id: m.id,
                        sender: m.sender,
                        text: m.text,
                        createdAt: m.createdAt.toISOString(),
                    }))}
                />
            </div>
        </main>
    );
}
