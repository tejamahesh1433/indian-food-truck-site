"use client";

import { useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import animationData from "@/assets/animations/delete.json";

interface LottieDeleteButtonProps {
    onClick: () => void;
    title?: string;
    className?: string;
}

export default function LottieDeleteButton({ 
    onClick, 
    title = "Delete", 
    className = "" 
}: LottieDeleteButtonProps) {
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => {
                setIsHovered(true);
                lottieRef.current?.play();
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                lottieRef.current?.stop();
            }}
            className={`relative p-2 rounded-xl transition-all duration-300 ${
                isHovered ? "bg-red-500/10" : "bg-white/5"
            } ${className}`}
            title={title}
        >
            <div className="w-6 h-6 flex items-center justify-center">
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={false}
                    autoplay={false}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </button>
    );
}
