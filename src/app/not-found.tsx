"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "@/assets/animations/404.json";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="container-shell py-20 flex flex-col lg:flex-row items-center gap-10">
                {/* Lottie Animation */}
                <div className="w-full max-w-md lg:max-w-lg">
                    <Lottie 
                        animationData={animationData} 
                        loop={true} 
                        className="w-full h-auto drop-shadow-[0_0_50px_rgba(255,140,0,0.2)]"
                    />
                </div>

                <div className="max-w-xl text-center lg:text-left">
                    <div className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-2">Error 404</div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                        Lost in <span className="text-orange-500">Space?</span>
                    </h1>
                    <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md mx-auto lg:mx-0">
                        The page you&apos;re looking for has drifted away. Don&apos;t worry, the truck is still serving fresh food!
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link
                            href="/"
                            className="bg-orange-500 text-black px-8 py-4 rounded-full font-bold hover:bg-orange-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                        >
                            Back to Earth (Home)
                        </Link>
                        <Link
                            href="/menu"
                            className="border border-white/15 bg-white/5 px-8 py-4 rounded-full font-bold hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                        >
                            View Menu
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
