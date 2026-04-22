import { prisma } from "@/lib/prisma";
import CateringClient from "./ui/CateringClient";
import CateringAvailabilityToggle from "../ui/CateringAvailabilityToggle";

export const dynamic = "force-dynamic";

export default async function CateringInboxPage() {
    const [requests, settings] = await Promise.all([
        prisma.cateringRequest.findMany({
            where: { isArchived: false },
            orderBy: { createdAt: "desc" },
        }),
        prisma.siteSettings.findUnique({
            where: { id: "global" },
            select: { cateringEnabled: true }
        })
    ]);

    const cateringEnabled = settings?.cateringEnabled ?? true;

    const counts = requests.reduce(
        (acc, r) => {
            acc.total += 1;
            acc[r.status] += 1;
            return acc;
        },
        { total: 0, NEW: 0, CONTACTED: 0, DONE: 0 } as Record<string, number>
    );

    return (
        <main className="mx-auto max-w-5xl px-6 py-12 text-white">
            <a href="/admin" className="text-sm font-medium text-gray-400 hover:text-white mb-8 inline-block transition">
                ← Back to Dashboard
            </a>

            <div className="flex flex-col gap-1 mb-8">
                <h1 className="text-3xl font-semibold mb-2 text-white">Catering Inbox</h1>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                    <p className="text-gray-400 text-sm">
                        Review incoming quotes and mark them as contacted or completed.
                    </p>
                    <a 
                        href="/admin/catering-menu" 
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-2"
                    >
                        <span className="text-base">📑</span>
                        Manage Catering Menu
                    </a>
                </div>

                <div className="max-w-md mt-4">
                    <CateringAvailabilityToggle initialEnabled={cateringEnabled} />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm mb-8">
                <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium">
                    {counts.total} Request{counts.total === 1 ? "" : "s"} Total
                </span>
                <span className="rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 px-4 py-2 font-bold uppercase tracking-wider text-xs">NEW: {counts.NEW}</span>
                <span className="rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400 px-4 py-2 font-bold uppercase tracking-wider text-xs">
                    CONTACTED: {counts.CONTACTED}
                </span>
                <span className="rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 px-4 py-2 font-bold uppercase tracking-wider text-xs">DONE: {counts.DONE}</span>
            </div>

            <CateringClient initialRequests={requests} />
        </main>
    );
}
