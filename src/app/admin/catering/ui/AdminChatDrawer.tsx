"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type Msg = {
    id: string;
    sender: "CUSTOMER" | "ADMIN";
    text: string;
    createdAt: string;
};

export default function AdminChatDrawer({
    requestId,
    customerName,
    customerEmail,
    open,
    onClose,
}: {
    requestId: string | null;
    customerName?: string;
    customerEmail?: string;
    open: boolean;
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [text, setText] = useState("");
    const [pending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function refresh() {
        if (!requestId) return;
        const res = await fetch(`/api/admin/catering/${requestId}/messages`, {
            cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
    }

    useEffect(() => {
        if (!open) return;
        refresh();
        const t = setInterval(refresh, 2500);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, requestId]);

    useEffect(() => {
        if (!open) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, open]);

    if (!open || !requestId) return null;

    return (
        <div className="fixed inset-0 z-[300] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-neutral-900 shadow-2xl flex flex-col h-full border-l border-white/10">
                <div className="border-b border-white/10 p-5 flex items-center justify-between bg-black/20">
                    <div>
                        <div className="text-xl font-bold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Live Chat
                        </div>
                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                            <span className="text-white font-medium">{customerName ?? "Customer"}</span>
                            <span>•</span>
                            <span>{customerEmail ?? ""}</span>
                        </div>
                    </div>
                    <button className="rounded-full p-2 hover:bg-white/10 text-gray-400 hover:text-white transition" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/40">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-10">
                            No messages yet. Send a message to start the conversation!
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div
                                key={m.id}
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.sender === "ADMIN"
                                    ? "ml-auto border border-orange-500/20 bg-orange-500/10 text-orange-50"
                                    : "mr-auto border border-white/10 bg-white/5 text-gray-200"
                                    }`}
                            >
                                <div className="text-[10px] font-bold tracking-wider uppercase opacity-50 mb-1.5 flex items-center gap-2">
                                    {m.sender === "ADMIN" ? "You" : customerName}
                                    <span className="font-normal normal-case opacity-75">
                                        {mounted ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <div className="leading-relaxed">{m.text}</div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                <form
                    className="border-t border-white/10 p-4 bg-neutral-900 flex gap-3 items-end"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = text.trim();
                        if (!trimmed) return;

                        startTransition(async () => {
                            const res = await fetch(`/api/admin/catering/${requestId}/messages`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ text: trimmed }),
                            });

                            if (res.ok) {
                                setText("");
                                await refresh();
                            }
                        });
                    }}
                >
                    <textarea
                        className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 resize-none outline-none focus:border-orange-500/50 transition"
                        placeholder="Reply to customer..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                e.currentTarget.form?.requestSubmit();
                            }
                        }}
                        disabled={pending}
                        rows={1}
                    />
                    <button
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 transition px-6 py-3 text-sm font-bold text-black disabled:opacity-50 shrink-0 h-[46px]"
                        disabled={pending || !text.trim()}
                        type="submit"
                    >
                        {pending ? "..." : "Send"}
                    </button>
                </form>
            </div>
        </div>
    );
}
