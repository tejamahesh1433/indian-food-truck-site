"use client";

import { useState, useTransition, useEffect } from "react";
import { updateCateringEnabled } from "../catering/actions";
import { useToast } from "@/components/ui/Toast";

export default function CateringAvailabilityToggle({
    initialEnabled
}: {
    initialEnabled: boolean
}) {
    const { toast } = useToast();
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setIsEnabled(initialEnabled);
    }, [initialEnabled]);

    const handleToggle = () => {
        const next = !isEnabled;
        setIsEnabled(next);

        startTransition(async () => {
            try {
                await updateCateringEnabled(next);
            } catch {
                // Revert on error
                setIsEnabled(!next);
                toast.error("Failed to update catering status. Please try again.");
            }
        });
    };

    return (
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="flex-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className={isEnabled ? "text-green-500" : "text-red-500"}>
                        ●
                    </span>
                    Catering Orders: {isEnabled ? "ACTIVE" : "DISABLED"}
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                    {isEnabled
                        ? "Customers can currently build requests and submit quotes."
                        : "The catering menu will show an 'unavailable' notice to customers."}
                </p>
            </div>

            <button
                onClick={handleToggle}
                disabled={isPending}
                aria-label="Toggle catering availability"
                title="Toggle catering availability"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? "bg-orange-500" : "bg-neutral-800"
                    } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}
