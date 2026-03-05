"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type Msg = {
    id: string;
    sender: "CUSTOMER" | "ADMIN";
    text: string;
    createdAt: string; // ISO
};

export default function CustomerChatClient({
    token,
    initialMessages,
}: {
    token: string;
    initialMessages: Msg[];
}) {
    const [messages, setMessages] = useState<Msg[]>(initialMessages);
    const [text, setText] = useState("");
    const [pending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    function copyLink() {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function refresh() {
        const res = await fetch(`/api/chat/${token}/messages`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
    }

    useEffect(() => {
        // polling (simple MVP)
        const t = setInterval(refresh, 2500);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div className="rounded-2xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md overflow-hidden relative">
            <button
                onClick={copyLink}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
            >
                {copied ? (
                    <span className="text-green-400">Copied!</span>
                ) : (
                    <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Order Link
                    </>
                )}
            </button>
            <div className="h-[55vh] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-10">
                        No messages yet. Send a message to get started!
                    </div>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m.id}
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.sender === "CUSTOMER"
                                ? "ml-auto border border-orange-500/20 bg-orange-500/10 text-orange-50"
                                : "mr-auto border border-white/10 bg-white/5 text-gray-200"
                                }`}
                        >
                            <div className="text-[10px] font-bold tracking-wider uppercase opacity-50 mb-1.5 flex items-center gap-2">
                                {m.sender === "CUSTOMER" ? "You" : "Store Admin"}
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
                className="border-t border-white/10 p-4 bg-white/5 flex gap-3 items-end"
                onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = text.trim();
                    if (!trimmed) return;

                    startTransition(async () => {
                        const res = await fetch(`/api/chat/${token}/messages`, {
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
                    placeholder="Type your message..."
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
    );
}
