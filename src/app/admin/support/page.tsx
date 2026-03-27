import { prisma } from "@/lib/prisma";
import SupportAdminClient from "./SupportAdminClient";

export const dynamic = "force-dynamic";

export default async function SupportAdminPage() {
    const chats = await prisma.supportChat.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        }
    });

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <a href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-4 inline-block transition">
                        ← Back to Dashboard
                    </a>
                    <h1 className="text-4xl font-black tracking-tight">Support <span className="text-blue-500">Inbox</span></h1>
                    <p className="mt-2 text-gray-400 font-medium">Manage and respond to live customer inquiries.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Active Sessions</div>
                    <div className="text-2xl font-black">{chats.length}</div>
                </div>
            </div>

            <SupportAdminClient initialChats={chats} />
        </main>
    );
}
