"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { quotes } from "@/lib/quotes";
import { cn } from "@/lib/utils";

export default function QuoteTicker() {
    const { showQuoteTicker } = useSettings();
    const [randomQuotes, setRandomQuotes] = useState<typeof quotes>([]);

    useEffect(() => {
        // Shuffle quotes and take top 10 for the ticker
        const shuffled = [...quotes].sort(() => 0.5 - Math.random());
        setRandomQuotes(shuffled.slice(0, 10));
    }, []);

    if (!showQuoteTicker) return null;

    return (
        <div className="w-full bg-primary/10 border-b border-primary/10 overflow-hidden h-8 flex items-center relative z-40 backdrop-blur-sm">
            <div className="animate-ticker flex whitespace-nowrap gap-16 min-w-full">
                {/* Duplicate the list to create seamless loop */}
                {[...randomQuotes, ...randomQuotes].map((quote, idx) => (
                    <span key={idx} className="text-xs md:text-sm text-primary/80 font-medium inline-block">
                        "{quote.text}" — <span className="opacity-75">{quote.author}</span>
                    </span>
                ))}
            </div>

            <style jsx global>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 60s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
