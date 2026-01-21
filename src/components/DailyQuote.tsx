"use client";

import { useState, useRef, useEffect } from "react";
import { Quote, getDailyQuote } from "@/lib/quotes";
import { Download, Share2, X, RefreshCw, Loader2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import Image from "next/image";
import { generateDailyQuote } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface DailyQuoteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DailyQuote({ isOpen, onClose }: DailyQuoteProps) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const quoteRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    useEffect(() => {
        setQuote(getDailyQuote());
    }, []);

    const handleShuffle = async () => {
        setIsShuffling(true);
        try {
            const newQuote = await generateDailyQuote();
            if (newQuote) {
                // Generate a temporary ID for the new quote
                setQuote({
                    ...newQuote,
                    id: Date.now()
                });
            }
        } catch (error) {
            console.error("Failed to shuffle quote:", error);
        } finally {
            setIsShuffling(false);
        }
    };

    const handleShare = async () => {
        if (!quoteRef.current || !quote) return;

        setIsSharing(true);
        try {
            // Wait a bit for images/fonts to load if needed
            const blob = await toBlob(quoteRef.current, {
                cacheBust: true,
                backgroundColor: '#09090b', // Dark background for the image
                style: {
                    fontFamily: 'Inter, sans-serif'
                }
            });

            if (!blob) throw new Error("Failed to generate image blob");

            const file = new File([blob], `lai-ai-quote-${quote.id}.png`, { type: 'image/png' });

            if (navigator.share) {
                try {
                    const shareData = {
                        title: 'Daily Wise Quote from LAI AI',
                        text: `${quote.text}\n\n${quote.translation}\n- ${quote.author}`,
                        files: [file]
                    };

                    if (navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback if files sharing isn't supported but text is
                        await navigator.share({
                            title: 'Daily Wise Quote from LAI AI',
                            text: `${quote.text}\n\n${quote.translation}\n- ${quote.author}\n\n(Image saved to device)`,
                        });
                        saveAs(blob, `lai-ai-quote-${quote.id}.png`);
                    }
                } catch (err) {
                    console.error('Error sharing:', err);
                    saveAs(blob, `lai-ai-quote-${quote.id}.png`);
                }
            } else {
                saveAs(blob, `lai-ai-quote-${quote.id}.png`);
            }
        } catch (err) {
            console.error('Error generating image:', err);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#09090b] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-semibold text-lg text-white">Daily Wisdom / Nifatin Mifim Bia</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffling}
                            className={cn(
                                "p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white",
                                isShuffling && "animate-spin"
                            )}
                            title="Shuffle Quote"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content to Capture */}
                <div className="relative">
                    {isShuffling && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/50 backdrop-blur-[2px]">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}

                    <div ref={quoteRef} className="p-8 bg-[#09090b] text-center space-y-6 relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                        {/* Logo */}
                        <div className="flex justify-center mb-6 relative z-10">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                                <Image
                                    src="/joseph.jpg"
                                    alt="LAI AI"
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <blockquote className="text-xl md:text-2xl font-serif italic text-white leading-relaxed">
                                &quot;{quote.text}&quot;
                            </blockquote>

                            <div className="w-16 h-0.5 bg-primary/30 mx-auto rounded-full" />

                            <p className="text-lg text-white/90 font-medium leading-relaxed">
                                {quote.translation}
                            </p>
                        </div>

                        <div className="pt-4 relative z-10">
                            <p className="text-sm text-primary font-semibold tracking-wider uppercase">
                                — {quote.author}
                            </p>
                        </div>

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
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={handleShare}
                        disabled={isSharing || isShuffling}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-all active:scale-[0.98]"
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
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
