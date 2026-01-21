"use client";

import { useState, useRef, useEffect } from "react";
import { Quote, getDailyQuote } from "@/lib/quotes";
import { Download, Share2, X, RefreshCw, Loader2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import Image from "next/image";
import { generateDailyQuote } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface DailyQuoteProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEY = 'lai_ai_daily_quote_v1';

export default function DailyQuote({ isOpen, onClose }: DailyQuoteProps) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const quoteRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const loadQuote = async () => {
            setIsLoading(true);
            try {
                // Check local storage
                const today = new Date().toISOString().split('T')[0];
                const stored = localStorage.getItem(STORAGE_KEY);

                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.date === today && parsed.quote) {
                        setQuote(parsed.quote);
                        setIsLoading(false);
                        return;
                    }
                }

                // If no quote for today, generate one
                const newQuote = await generateDailyQuote();
                if (newQuote) {
                    const quoteWithId = { ...newQuote, id: Date.now() };
                    setQuote(quoteWithId);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({
                        date: today,
                        quote: quoteWithId
                    }));
                } else {
                    // Fallback to static list
                    const fallback = getDailyQuote();
                    setQuote(fallback);
                }
            } catch (error) {
                console.error("Error loading quote:", error);
                setQuote(getDailyQuote());
            } finally {
                setIsLoading(false);
            }
        };

        loadQuote();
    }, [isOpen]);

    // Celebration effect when quote is loaded or changed
    useEffect(() => {
        if (isOpen && !isLoading && !error && quote) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen, isLoading, error, quote]);

    const handleShuffle = async () => {
        setIsShuffling(true);
        setError(null);
        try {
            const newQuote = await generateDailyQuote();
            if (newQuote) {
                const quoteWithId = { ...newQuote, id: Date.now() };
                setQuote(quoteWithId);

                // Update storage with new shuffled quote for today
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    date: today,
                    quote: quoteWithId
                }));
            } else {
                setError("Failed to generate quote. Please check your connection or try again.");
            }
        } catch (error) {
            console.error("Failed to shuffle quote:", error);
            setError("An error occurred while generating. Please try again.");
        } finally {
            setIsShuffling(false);
        }
    };

    const handleSaveImage = async () => {
        if (!quoteRef.current || !quote) return;

        setIsSharing(true);
        try {
            const blob = await toBlob(quoteRef.current, {
                cacheBust: true,
                backgroundColor: '#09090b',
                style: {
                    fontFamily: 'Inter, sans-serif'
                }
            });

            if (!blob) throw new Error("Failed to generate image blob");
            saveAs(blob, `lai-ai-quote-${quote.id}.png`);
        } catch (err) {
            console.error('Error saving image:', err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleShareQuote = async () => {
        if (!quoteRef.current || !quote) return;

        setIsSharing(true);
        try {
            const blob = await toBlob(quoteRef.current, {
                cacheBust: true,
                backgroundColor: '#09090b',
                style: {
                    fontFamily: 'Inter, sans-serif'
                }
            });

            if (!blob) throw new Error("Failed to generate image blob");

            const file = new File([blob], `lai-ai-quote-${quote.id}.png`, { type: 'image/png' });
            const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lai-ai.vercel.app';
            const shareText = `"${quote.text}"\n\n${quote.translation}\n- ${quote.author}\n\nGet your daily wisdom here: ${appUrl}`;

            if (navigator.share) {
                try {
                    const shareData = {
                        title: 'Daily Wise Quote from LAI AI',
                        text: shareText,
                        files: [file]
                    };

                    if (navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback: Share Text + Link only if file sharing fails checks
                        await navigator.share({
                            title: 'Daily Wise Quote from LAI AI',
                            text: shareText,
                            url: appUrl
                        });
                    }
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                alert("Sharing not supported on this device. Please use 'Save Image'.");
            }
        } catch (err) {
            console.error('Error sharing quote:', err);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#09090b] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-semibold text-lg text-white">Daily Wisdom</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffling || isLoading}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/90 text-sm font-medium",
                                (isShuffling || isLoading) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <RefreshCw className={cn("w-4 h-4", (isShuffling || isLoading) && "animate-spin")} />
                            <span>Generate</span>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content to Capture */}
                <div className="relative">
                    {(isShuffling || isLoading) && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/50 backdrop-blur-[2px] transition-all duration-300">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm text-white/70 font-medium">Generating Wisdom...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-20 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div ref={quoteRef} className="p-8 bg-[#09090b] text-center space-y-6 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                        {/* Logo */}
                        <div className="flex justify-center mb-6 relative z-10">
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg bg-white/10 backdrop-blur-md p-2">
                                <div className="relative w-full h-full rounded-md overflow-hidden">
                                    <Image
                                        src="/LAI AI.png"
                                        alt="LAI AI"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {quote ? (
                            <>
                                <div className="space-y-4 relative z-10 animate-in fade-in zoom-in duration-500">
                                    <blockquote className="text-xl md:text-2xl font-serif italic text-white leading-relaxed">
                                        &quot;{quote.text}&quot;
                                    </blockquote>

                                    <div className="w-16 h-0.5 bg-primary/30 mx-auto rounded-full" />

                                    <p className="text-lg text-white/90 font-medium leading-relaxed">
                                        {quote.translation}
                                    </p>
                                </div>

                                <div className="pt-4 relative z-10 animate-in slide-in-from-bottom-2 duration-700 delay-100">
                                    <p className="text-sm text-primary font-semibold tracking-wider uppercase">
                                        — {quote.author}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="relative z-10 text-white/50 animate-pulse">
                                <p>Finding inspiration...</p>
                            </div>
                        )}

                        {/* Footer Branding */}
                        <div className="pt-8 flex flex-col items-center gap-1 opacity-60">
                            <p className="text-[10px] text-white/50 tracking-widest uppercase">
                                Daily Inspiration by
                            </p>
                            <p className="text-xs font-bold text-white tracking-wider flex items-center gap-1">
                                LAI AI <span className="text-primary">•</span> V2
                            </p>
                            <p className="text-[10px] text-white/30 mt-1">
                                Copyright @LaiAIV2
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-3">
                    <button
                        onClick={handleShareQuote}
                        disabled={isSharing || isShuffling || isLoading || !quote}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSharing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4" />
                                Share Quote
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSaveImage}
                        disabled={isSharing || isShuffling || isLoading || !quote}
                        className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                </div>
            </div>
        </div>
    );
}
