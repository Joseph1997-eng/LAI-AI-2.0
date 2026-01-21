"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
    showQuoteTicker: boolean;
    setShowQuoteTicker: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'lai_ai_settings_v1';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [showQuoteTicker, setShowQuoteTicker] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed.showQuoteTicker === 'boolean') {
                    setShowQuoteTicker(parsed.showQuoteTicker);
                }
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ showQuoteTicker }));
    }, [showQuoteTicker, isLoaded]);

    return (
        <SettingsContext.Provider value={{ showQuoteTicker, setShowQuoteTicker }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
