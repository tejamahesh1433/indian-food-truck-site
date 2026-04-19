"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token || !email) {
            setStatus("error");
            setMessage("Invalid verification link. Missing token or email.");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}&email=${email}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("An unexpected error occurred. Please try again later.");
            }
        };

        verifyToken();
    }, [token, email]);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            {status === "loading" && (
                <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Verifying your account...</p>
                </div>
            )}

            {status === "success" && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto border border-green-500/20 shadow-xl shadow-green-500/10">
                        ✓
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Verified!</h1>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">{message}</p>
                    <Link
                        href="/login"
                        className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl transition shadow-lg shadow-orange-900/20 active:scale-95"
                    >
                        Proceed to Login
                    </Link>
                </div>
            )}

            {status === "error" && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto border border-red-500/20 shadow-xl shadow-red-500/10">
                        ✕
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Oh No!</h1>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">{message}</p>
                    <Link
                        href="/signup"
                        className="inline-block bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl transition border border-white/10 active:scale-95"
                    >
                        Back to Signup
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0B] relative flex items-center justify-center p-6 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
            
            <div className="z-10 w-full max-w-md bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing...</p>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </main>
    );
}
