"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CustomCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
}

export default function CustomCheckbox({ 
    checked, 
    onChange, 
    label, 
    id, 
    disabled = false 
}: CustomCheckboxProps) {
    return (
        <div 
            className={`flex items-center gap-3 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(!checked)}
        >
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                {/* Hidden real checkbox for accessibility/forms */}
                <input
                    type="checkbox"
                    id={id}
                    title={label || "Checkbox"}
                    checked={checked}
                    onChange={() => {}} // Controlled via parent onClick
                    className="sr-only"
                    disabled={disabled}
                />
                
                {/* Checkbox Box Background */}
                <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 ${
                    checked 
                        ? "bg-orange-500 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                        : "bg-white/5 border-white/10 group-hover:border-white/30"
                }`} />
                
                {/* Checkmark Animation */}
                <AnimatePresence>
                    {checked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 500, 
                                damping: 30,
                                duration: 0.2
                            }}
                            className="relative z-10"
                        >
                            <svg 
                                className="w-3.5 h-3.5 text-white" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                strokeWidth={4}
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {label && (
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">
                    {label}
                </span>
            )}
        </div>
    );
}
