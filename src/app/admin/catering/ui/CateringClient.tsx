"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CateringRequest } from "@prisma/client";
import FiltersBar, { FiltersState } from "./FiltersBar";
import CateringRequestCard from "./CateringRequestCard";
import CateringDetailsDrawer from "./CateringDetailsDrawer";
import AdminChatDrawer from "./AdminChatDrawer";

type Props = {
    initialRequests: CateringRequest[];
};

export default function CateringClient({ initialRequests }: Props) {
    const [filters, setFilters] = useState<FiltersState>({
        q: "",
        status: "ALL",
        sort: "CREATED_DESC",
    });

    const [selected, setSelected] = useState<CateringRequest | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState<{ id: string; name: string; email: string } | null>(null);

    const router = useRouter();

    // Auto-refresh the server payload every 30 seconds to catch new incoming requests
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();

        let list = initialRequests.filter((r) => {
            const matchesStatus =
                filters.status === "ALL" ? true : r.status === filters.status;

            const haystack =
                `${r.name} ${r.email} ${r.phone ?? ""} ${r.location} ${r.notes ?? ""}`.toLowerCase();

            const matchesQ = q ? haystack.includes(q) : true;

            return matchesStatus && matchesQ;
        });

        switch (filters.sort) {
            case "CREATED_ASC":
                list = list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
                break;
            case "EVENT_ASC":
                list = list.sort((a, b) => +new Date(a.eventDate || 0) - +new Date(b.eventDate || 0));
                break;
            case "GUESTS_DESC":
                list = list.sort((a, b) => Number(b.guests) - Number(a.guests));
                break;
            default:
                list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
                break;
        }

        return list;
    }, [filters, initialRequests]);

    return (
        <div className="space-y-6">
            <FiltersBar value={filters} onChange={setFilters} totalShown={filtered.length} />

            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-gray-400">
                        No catering requests match your filters.
                    </div>
                ) : (
                    filtered.map((r) => (
                        <CateringRequestCard
                            key={r.id}
                            request={r}
                            onOpen={() => setSelected(r)}
                            onChat={() => {
                                setChatTarget({ id: r.id, name: r.name, email: r.email });
                                setChatOpen(true);
                            }}
                        />
                    ))
                )}
            </div>

            <CateringDetailsDrawer
                request={selected}
                onClose={() => setSelected(null)}
            />

            <AdminChatDrawer
                requestId={chatTarget?.id ?? null}
                customerName={chatTarget?.name}
                customerEmail={chatTarget?.email}
                open={chatOpen}
                onClose={() => {
                    setChatOpen(false);
                    setChatTarget(null);
                }}
            />
        </div>
    );
}
