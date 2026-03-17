"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
    id: string;
    text: string;
    sender: "CUSTOMER" | "ADMIN";
    createdAt: string;
}

export default function OrderChat({ orderId, isAdmin = false }: { orderId: string; isAdmin?: boolean }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}/messages`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newMessage }),
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[350px] bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between backdrop-blur-xl">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 italic">
                        {isAdmin ? "Customer Support" : "Chef Connect"}
                    </h3>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Order Channel</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Online</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-black/20">
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-5 w-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-20">
                        <div className="h-12 w-12 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silent Channel</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">Send a nudge to the {isAdmin ? "customer" : "kitchen"}</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = (isAdmin && msg.sender === "ADMIN") || (!isAdmin && msg.sender === "CUSTOMER");
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3 text-xs ${isMe
                                        ? "bg-orange-600 text-white rounded-tl-none shadow-xl shadow-orange-950/20"
                                        : "bg-white/10 text-white rounded-tr-none border border-white/10 backdrop-blur-md"
                                    }`}>
                                    <p className="leading-relaxed font-semibold tracking-tight">{msg.text}</p>
                                    <div className={`text-[8px] mt-2 font-black uppercase tracking-[0.1em] opacity-40 flex items-center gap-1.5 ${isMe ? "justify-start" : "justify-end"}`}>
                                        {isMe ? "YOU" : (msg.sender === "ADMIN" ? "CHEF" : "CUSTOMER")} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-black/60 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-orange-500/50 outline-none transition placeholder:text-gray-700 text-white"
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-orange-600 text-white p-2.5 px-5 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-orange-500 transition disabled:opacity-50 active:scale-95"
                >
                    {sending ? "..." : "SEND"}
                </button>
            </form>
        </div>
    );
}
