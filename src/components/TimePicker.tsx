"use client";

import { useEffect, useState, useRef } from "react";

interface TimePickerProps {
    value: string; // "HH:mm" (24h format)
    onChange: (val: string) => void;
    label: string;
    showNow?: boolean;
}

export default function TimePicker({ value, onChange, label, showNow }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNow = () => {
        const d = new Date();
        const h = d.getHours().toString().padStart(2, "0");
        const m = d.getMinutes().toString().padStart(2, "0");
        onChange(`${h}:${m}`);
        setIsOpen(false);
    };

    const handlePreset = (h24: number) => {
        onChange(`${h24.toString().padStart(2, "0")}:00`);
        setIsOpen(false);
    };

    // Parse value "HH:mm" into hours and minutes
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [ampm, setAmpm] = useState("PM");

    useEffect(() => {
        if (!value) return;
        const [hStr, mStr] = value.split(":");
        let h = parseInt(hStr || "12");
        const m = mStr || "00";

        const period = h >= 12 ? "PM" : "AM";
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;

        setHour(h12.toString());
        setMinute(m);
        setAmpm(period);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateTime = (newH: string, newM: string, newP: string) => {
        let h24 = parseInt(newH);
        if (newP === "PM" && h24 !== 12) h24 += 12;
        if (newP === "AM" && h24 === 12) h24 = 0;

        const hStr = h24.toString().padStart(2, "0");
        const mStr = newM.padStart(2, "0");
        onChange(`${hStr}:${mStr}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = ["00", "15", "30", "45"]; // Simplified for truck use

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-white/20 transition group"
            >
                <span className="text-white font-medium">
                    {value ? `${hour}:${minute} ${ampm}` : "Set Time"}
                </span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                    {showNow && (
                        <button
                            type="button"
                            onClick={handleNow}
                            className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition text-orange-400"
                        >
                            Select Now
                        </button>
                    )}

                    <div className="flex gap-4">
                        {/* Hours */}
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar px-1">
                            {hours.map(h => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => {
                                        setHour(h);
                                        updateTime(h, minute, ampm);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold transition ${hour === h ? "bg-orange-500 text-black" : "text-gray-400 hover:bg-white/5"}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>

                        {/* Minutes */}
                        <div className="flex flex-col gap-1">
                            {minutes.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        setMinute(m);
                                        updateTime(hour, m, ampm);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold transition ${minute === m ? "bg-orange-500 text-black" : "text-gray-400 hover:bg-white/5"}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col gap-1 border-l border-white/5 pl-4">
                            {["AM", "PM"].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                        setAmpm(p);
                                        updateTime(hour, minute, p);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold transition ${ampm === p ? "bg-orange-500 text-black" : "text-gray-400 hover:bg-white/5"}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        {[11, 12, 13, 17, 18, 20].map(h24 => (
                            <button
                                key={h24}
                                type="button"
                                onClick={() => handlePreset(h24)}
                                className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 hover:text-white transition"
                            >
                                {h24 > 12 ? h24 - 12 : h24} {h24 >= 12 ? 'PM' : 'AM'}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
