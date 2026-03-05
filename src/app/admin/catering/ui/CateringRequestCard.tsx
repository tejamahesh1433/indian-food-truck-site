"use client";

import { CateringRequest } from "@prisma/client";
import { updateCateringStatus } from "../actions";

export default function CateringRequestCard({
    request,
    onOpen,
}: {
    request: CateringRequest;
    onOpen: () => void;
}) {
    const isNew = request.status === "NEW";
    const isContacted = request.status === "CONTACTED";
    const isDone = request.status === "DONE";

    return (
        <div className={`p-5 rounded-2xl border transition hover:bg-white/[0.08] cursor-pointer ${isDone ? 'border-green-500/20 bg-green-500/5' : isContacted ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/10 bg-white/5'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1" onClick={onOpen}>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                        {isNew && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                        <span className="text-xs text-gray-500 ml-auto md:ml-0">
                            {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-y-2 gap-x-4 mt-4">
                        <div className="text-sm">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Event Date</span>
                            <span className="text-gray-200">{request.eventDate ? new Date(request.eventDate + "T12:00:00Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Guests</span>
                            <span className="text-gray-200">{request.guests || "TBD"}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Location</span>
                            <span className="text-gray-200 truncate block max-w-[200px]" title={request.location || ""}>{request.location || "TBD"}</span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={request.status}
                        onChange={(e) => updateCateringStatus(request.id, e.target.value)}
                        className={`w-full md:w-40 appearance-none px-4 py-2 rounded-xl border font-semibold text-sm outline-none cursor-pointer ${isNew ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : isContacted ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-green-500/10 border-green-500/30 text-green-400'
                            }`}
                    >
                        <option value="NEW" className="bg-neutral-900 text-white">Status: NEW</option>
                        <option value="CONTACTED" className="bg-neutral-900 text-white">Status: CONTACTED</option>
                        <option value="DONE" className="bg-neutral-900 text-white">Status: DONE</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
