import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";
import type { CateringRequest } from "@prisma/client";

export default async function AdminCatering() {
    const ok = await isAdminAuthed();
    if (!ok) redirect("/admin/login");

    const items = await prisma.cateringRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
    });

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="container-shell py-12">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Catering Inbox</h1>
                        <p className="mt-2 text-gray-300">New requests from the website.</p>
                    </div>

                    <form action="/api/admin/logout" method="post">
                        <button className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition">
                            Logout
                        </button>
                    </form>
                </div>

                <div className="mt-8 card overflow-hidden">
                    <div className="grid grid-cols-12 gap-0 border-b border-white/10 text-sm text-gray-400">
                        <div className="col-span-3 p-4">Name</div>
                        <div className="col-span-3 p-4">Phone</div>
                        <div className="col-span-3 p-4">Event</div>
                        <div className="col-span-3 p-4">Status</div>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-6 text-gray-300">No requests yet.</div>
                    ) : (
                        items.map((r: CateringRequest) => (
                            <div key={r.id} className="grid grid-cols-12 border-b border-white/5">
                                <div className="col-span-3 p-4">
                                    <div className="font-semibold">{r.name}</div>
                                    <div className="text-xs text-gray-400">{r.email}</div>
                                </div>
                                <div className="col-span-3 p-4">{r.phone}</div>
                                <div className="col-span-3 p-4">
                                    <div>{r.eventDate || "—"}</div>
                                    <div className="text-xs text-gray-400">{r.guests ? `${r.guests} guests` : ""}</div>
                                </div>
                                <div className="col-span-3 p-4">
                                    <span className="pill">{r.status}</span>
                                </div>

                                <div className="col-span-12 px-4 pb-4 text-gray-300">
                                    {r.location ? <div><span className="text-gray-400">Location:</span> {r.location}</div> : null}
                                    {r.notes ? <div className="mt-1"><span className="text-gray-400">Notes:</span> {r.notes}</div> : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 text-sm text-gray-400">
                    Tip: Later we’ll add Status update buttons + search.
                </div>

                <div className="mt-8">
                    <Link href="/catering" className="underline text-gray-300 hover:text-white">
                        Back to Catering page
                    </Link>
                </div>
            </div>
        </main>
    );
}
