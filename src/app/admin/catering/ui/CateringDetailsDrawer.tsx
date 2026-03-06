"use client";

import { useState, useEffect } from "react";
import { CateringRequest } from "@prisma/client";
import { updateInternalNotes, deleteCateringRequest, updateCateringStatus, archiveCateringRequest } from "../actions";
import { SelectedItem } from "@/app/catering/ui/types";

export default function CateringDetailsDrawer({
    request,
    onClose,
}: {
    request: CateringRequest | null;
    onClose: () => void;
}) {
    const [internalNotes, setInternalNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (request) {
            setInternalNotes(request.internalNotes || "");
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [request]);

    if (!request) return null;

    const handleSaveNotes = async () => {
        if (internalNotes === request.internalNotes) return;
        setIsSaving(true);
        await updateInternalNotes(request.id, internalNotes);
        setIsSaving(false);
    };

    const handleArchive = async () => {
        if (confirm("Are you sure you want to archive this catering request? It will be safely removed from your active inbox.")) {
            setIsSaving(true);
            await archiveCateringRequest(request.id);
            setIsSaving(false);
            onClose();
        }
    };

    const handleCopyDetails = () => {
        const details = `Name: ${request.name}
Event Date: ${request.eventDate || "TBD"}
Guests: ${request.guests || "TBD"}
Location: ${request.location || "TBD"}
Email: ${request.email}
Phone: ${request.phone || "N/A"}`;

        navigator.clipboard.writeText(details);
        alert("Details copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-neutral-900 h-full overflow-y-auto border-l border-white/10 shadow-2xl flex flex-col animate-slide-left">
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 sticky top-0 bg-neutral-900/90 backdrop-blur z-10">
                    <h2 className="text-xl font-bold text-white">Request Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex-1 space-y-8">
                    {/* Header Info */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-white">{request.name}</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={handleCopyDetails} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10" title="Copy Request Details">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Details
                                </button>
                                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <a href={`mailto:${request.email}`} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-sm font-medium transition text-gray-300 hover:text-white">
                                <span>✉️</span> Email
                            </a>
                            <a href={`tel:${request.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-sm font-medium transition text-gray-300 hover:text-white">
                                <span>📞</span> Call
                            </a>
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Event Date</div>
                            <div className="text-sm text-gray-200">{request.eventDate ? new Date(request.eventDate + "T12:00:00Z").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Not Specified"}</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Guests</div>
                            <div className="text-sm text-gray-200">{request.guests || "Not Specified"}</div>
                        </div>
                        <div className="col-span-2 bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</div>
                            <div className="text-sm text-gray-200">{request.location || "Not Specified"}</div>
                        </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                        <div className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <span>💬</span> Customer Message
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {request.notes || <span className="text-gray-600 italic">No additional notes provided.</span>}
                        </p>
                    </div>

                    {/* Structured Selections */}
                    {(request.selections as any as SelectedItem[])?.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-xs text-orange-400 uppercase tracking-wider font-bold flex items-center gap-2">
                                <span>🍱</span> Order Selections
                            </div>
                            <div className="space-y-3">
                                {(request.selections as any as SelectedItem[]).map((item, idx) => (
                                    <div key={item.internalId || idx} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                                            <span className="text-xs font-black text-orange-500">Qty {item.quantity}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                            {Object.entries(item.options).map(([k, v]) => (
                                                <div key={k} className="text-[10px] text-gray-500 font-medium">
                                                    <span className="opacity-50 uppercase tracking-tighter">{k}:</span> {v}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-white/[0.03] text-[10px] text-orange-500/60 font-black uppercase tracking-widest text-right">
                                            {item.priceLabel}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-white/10 my-4" />

                    {/* Internal Operations */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-white">Internal Operations</h4>

                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Update Status</label>
                            <select
                                value={request.status}
                                onChange={(e) => updateCateringStatus(request.id, e.target.value)}
                                className="w-full appearance-none px-4 py-3 rounded-xl border border-white/10 bg-black/40 font-semibold text-sm outline-none cursor-pointer focus:border-orange-500 text-white"
                            >
                                <option value="NEW" className="bg-neutral-900 text-white">🔴 NEW</option>
                                <option value="CONTACTED" className="bg-neutral-900 text-white">🟠 CONTACTED</option>
                                <option value="DONE" className="bg-neutral-900 text-white">🟢 DONE</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Private Notes</label>
                                {isSaving && <span className="text-xs text-orange-400 font-medium animate-pulse">Saving...</span>}
                            </div>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                onBlur={handleSaveNotes}
                                placeholder="Add private notes about this request here. The customer will never see this."
                                className="w-full h-32 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-gray-600 focus:border-orange-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 shrink-0 bg-black/20">
                    <button
                        disabled={isSaving}
                        onClick={handleArchive}
                        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
                    >
                        Archive Request
                    </button>
                </div>
            </div>
        </div>
    );
}
