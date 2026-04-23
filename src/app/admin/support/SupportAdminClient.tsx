"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type Chat = {
    id: string;
    email: string;
    name: string;
    updatedAt: Date | string;
    messages: { text: string }[];
};

type Msg = {
    id: string;
    sender: "CUSTOMER" | "ADMIN";
    text: string;
    createdAt: string;
};

export default function SupportAdminClient({ initialChats }: { initialChats: Chat[] }) {
    const { confirm } = useConfirm();
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [inputText, setInputText] = useState("");
    const [pending, startTransition] = useTransition();
    const bottomRef = useRef<HTMLDivElement>(null);

    const selectedChat = chats.find(c => c.id === selectedChatId);

    // Polling for the chat list
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch("/api/support/chat");
                if (res.ok) {
                    const data = await res.json();
                    setChats(data.chats);
                }
            } catch (err) {
                console.error("Error fetching chats:", err);
            }
        };

        const t = setInterval(fetchChats, 5000);
        return () => clearInterval(t);
    }, []);

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {
            try {
                // When admin views messages, mark them as read
                const res = await fetch(`/api/support/messages?chatId=${selectedChatId}&markAsRead=true`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();
        const t = setInterval(fetchMessages, 3000);
        return () => clearInterval(t);
    }, [selectedChatId]);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || !selectedChatId) return;

        startTransition(async () => {
            const res = await fetch("/api/support/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId: selectedChatId, text: trimmed, sender: "ADMIN" }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setInputText("");
            }
        });
    }

    async function handleDeleteChat(id: string) {
        const ok = await confirm({ title: "End Support Chat", message: "This chat will be permanently deleted for both you and the customer. This cannot be undone.", confirmLabel: "End Chat", variant: "danger" });
        if (!ok) return;

        try {
            const res = await fetch(`/api/support/chat?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setChats(prev => prev.filter(c => c.id !== id));
                if (selectedChatId === id) {
                    setSelectedChatId(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
        }
    }

    return (
        <div className="flex bg-zinc-900/50 border border-white/10 rounded-3xl h-[70vh] overflow-hidden backdrop-blur-md">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-white/5">
                <div className="p-4 font-bold text-xs uppercase tracking-widest text-gray-500 border-b border-white/10">Active Chats</div>
                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-500">No active support chats.</div>
                    ) : (
                        chats.map((c: any) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedChatId(c.id)}
                                className={`w-full p-4 text-left border-b border-white/5 transition hover:bg-white/5 ${selectedChatId === c.id ? "bg-white/10" : ""}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-sm truncate">{c.name}</div>
                                    {c._count?.messages > 0 && (
                                        <div className="h-4 min-w-[16px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">
                                            {c._count.messages}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate mb-2">{c.email}</div>
                                <div className="text-xs text-gray-500 line-clamp-1 italic">
                                    {c.messages[0]?.text || "No messages yet"}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Pane */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold">{selectedChat.name}</div>
                                <div className="text-xs text-gray-400">{selectedChat.email}</div>
                            </div>
                            <button
                                onClick={() => handleDeleteChat(selectedChat.id)}
                                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition"
                            >
                                End Session
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${m.sender === "ADMIN" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                                            m.sender === "ADMIN"
                                                ? "bg-blue-500 text-white font-medium"
                                                : "bg-white/10 text-gray-200"
                                        }`}
                                    >
                                        {m.text}
                                    </div>
                                    <span className="text-[10px] text-gray-600 mt-1 px-1">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input
                                    required
                                    type="text"
                                    placeholder="Type your reply..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition"
                                />
                                <button
                                    disabled={pending || !inputText.trim()}
                                    type="submit"
                                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-400 transition disabled:opacity-50"
                                >
                                    {pending ? "..." : "Send Reply"}
                                </button>
                            </form>
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[10px] text-gray-600">
                                    Ending the chat permanently deletes it for both you and the customer.
                                </p>
                                <button
                                    onClick={() => handleDeleteChat(selectedChat.id)}
                                    className="text-[11px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest transition flex items-center gap-1.5 flex-shrink-0 ml-4"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    End Chat
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Chat Selected</h3>
                        <p className="max-w-xs mx-auto text-sm">Select a customer session from the sidebar to start responding to their questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
