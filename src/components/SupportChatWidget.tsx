"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type Msg = {
    id: string;
    sender: "CUSTOMER" | "ADMIN";
    text: string;
    createdAt: string;
};

type ChatSession = {
    id: string;
    email: string;
    name: string;
};

export default function SupportChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"FORM" | "CHAT">("FORM");
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [chat, setChat] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [inputText, setInputText] = useState("");
    const [pending, startTransition] = useTransition();
    const [isEnding, setIsEnding] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-resume from localStorage
    useEffect(() => {
        const savedChat = localStorage.getItem("support_chat");
        if (savedChat) {
            const parsed = JSON.parse(savedChat);
            setChat(parsed);
            setEmail(parsed.email);
            setName(parsed.name);
            setStep("CHAT");
            setIsOpen(true);
        }
    }, []);

    const handleEndChat = useCallback(async (silent = false) => {
        if (!chat) return;
        if (!silent) {
            const ok = await confirm({ title: "End Chat", message: "Your chat history will be permanently deleted and cannot be recovered.", confirmLabel: "End Chat", variant: "danger" });
            if (!ok) return;
        }

        setIsEnding(true);
        try {
            if (!silent) {
                await fetch(`/api/support/chat?id=${chat.id}`, { method: "DELETE" });
            }
            localStorage.removeItem("support_chat");
            setChat(null);
            setMessages([]);
            setStep("FORM");
            setIsOpen(false);
        } catch (err) {
            console.error("Error ending chat:", err);
        } finally {
            setIsEnding(false);
        }
    }, [chat]);

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, isOpen]);

    async function handleStartChat(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            const res = await fetch("/api/support/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });

            if (res.ok) {
                const data = await res.json();
                setChat(data.chat);
                setMessages(data.chat.messages || []);
                setStep("CHAT");
                localStorage.setItem("support_chat", JSON.stringify(data.chat));
            } else {
                toast.error("Failed to start chat. Please try again.");
            }
        });
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || !chat) return;

        startTransition(async () => {
            const res = await fetch("/api/support/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId: chat.id, text: trimmed, sender: "CUSTOMER" }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setInputText("");
            }
        });
    }

    // Polling for messages
    useEffect(() => {
        if (step !== "CHAT" || !chat || !isOpen) return;

        const refresh = async () => {
            try {
                const res = await fetch(`/api/support/messages?chatId=${chat.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                } else if (res.status === 404) {
                    // Chat was probably ended/deleted from admin side
                    handleEndChat(true);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        refresh();
        const t = setInterval(refresh, 3000);
        return () => clearInterval(t);
    }, [step, chat, isOpen, handleEndChat]);

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[380px] h-[550px] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">IF</div>
                                <div>
                                    <div className="font-bold text-sm">Support Chat</div>
                                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        We&apos;re Online
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-white transition"
                                title="Close support widget"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {step === "FORM" ? (
                                <div className="h-full flex flex-col justify-center space-y-6 px-4">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold mb-2">How can we help?</h3>
                                        <p className="text-sm text-gray-400 font-medium">Please provide your details to start a conversation with our team.</p>
                                    </div>
                                    <form onSubmit={handleStartChat} className="space-y-4">
                                        <div>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Your Name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition"
                                            />
                                        </div>
                                        <button
                                            disabled={pending}
                                            type="submit"
                                            className="w-full bg-orange-500 text-black py-3 rounded-xl font-bold text-sm hover:bg-orange-400 transition disabled:opacity-50"
                                        >
                                            {pending ? "Initializing..." : "Start Chat"}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`flex flex-col ${m.sender === "CUSTOMER" ? "items-end" : "items-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                                    m.sender === "CUSTOMER"
                                                        ? "bg-orange-500 text-black font-medium"
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
                            )}
                        </div>

                        {/* Footer / Input */}
                        {step === "CHAT" && (
                            <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
                                <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-gray-500 leading-relaxed">
                                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>
                                        <span className="text-gray-400 font-bold">Close</span> saves your chat so you can return anytime.{" "}
                                        <span className="text-red-400/80 font-bold">End Session</span> permanently deletes the conversation.
                                    </span>
                                </div>
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500 outline-none transition"
                                    />
                                    <button
                                        disabled={pending || !inputText.trim()}
                                        type="submit"
                                        title="Send message"
                                        className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black hover:bg-orange-400 transition disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="hover:text-white transition"
                                    >
                                        Close Chat
                                    </button>
                                    <button 
                                        onClick={() => handleEndChat()}
                                        disabled={isEnding}
                                        className="text-red-500/70 hover:text-red-500 transition disabled:opacity-50"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.button
                        layoutId="support-btn"
                        onClick={() => setIsOpen(true)}
                        title="Contact Support"
                        style={{ borderRadius: "9999px", width: "64px", height: "64px" }}
                        className="relative bg-orange-500 text-black font-bold shadow-2xl shadow-orange-500/30 hover:bg-orange-400 transition-colors flex items-center justify-center group"
                    >
                        <Image
                            src="/icon.png"
                            alt="Support"
                            width={64}
                            height={64}
                            className="object-cover rounded-full group-hover:scale-105 transition-transform"
                        />
                        {chat && (
                            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-orange-500"></span>
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
