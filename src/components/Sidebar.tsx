"use client";

import { useState, useEffect } from "react";
import {
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    MessageSquare,
    Settings,
    Moon,
    Sun,
    Mail,
    Github,
    Info,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getConversations, type Conversation } from "@/lib/db/conversations";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
    onNewChat: () => void;
    onLoadConversation?: (conversationId: string) => void;
    onSidebarToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ onNewChat, onLoadConversation, onSidebarToggle }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [showAbout, setShowAbout] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const checkScreenSize = () => {
            const shouldOpen = window.innerWidth >= 768;
            setIsOpen(shouldOpen);
            onSidebarToggle?.(shouldOpen);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
            if (prefersDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }, []);

    useEffect(() => {
        const loadConversations = async () => {
            const convos = await getConversations();
            setConversations(convos);
        };
        loadConversations();
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || null);
            }
        };
        loadUser();
    }, []);

    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onSidebarToggle?.(newState);
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleConversationClick = (conversationId: string) => {
        onLoadConversation?.(conversationId);
        if (window.innerWidth < 768) setIsOpen(false);
    };

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen glass-card border-r border-white/10 transition-all duration-300 z-40 flex flex-col",
                    isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-16 md:translate-x-0"
                )}
            >
                <div className="flex-1 overflow-y-auto p-4 pt-16 space-y-4">
                    <button
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className={cn("font-medium", !isOpen && "md:hidden")}>New Chat</span>
                    </button>

                    <div className="space-y-2">
                        <h3 className={cn(
                            "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2",
                            !isOpen && "md:hidden"
                        )}>
                            Recent Chats
                        </h3>
                        <div className="space-y-1">
                            {conversations.length === 0 ? (
                                <div className="p-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className={cn("truncate", !isOpen && "md:hidden")}>No chat history yet</span>
                                </div>
                            ) : (
                                conversations.map((convo) => (
                                    <button
                                        key={convo.id}
                                        onClick={() => handleConversationClick(convo.id)}
                                        className="w-full p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 text-sm text-left"
                                    >
                                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                        <span className={cn("truncate", !isOpen && "md:hidden")}>{convo.title}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 space-y-2">
                    {userEmail && (
                        <div className="p-3 rounded-lg bg-white/5 mb-2">
                            <div className={cn("flex flex-row items-center gap-3", !isOpen && "md:hidden")}>
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{userEmail}</p>
                                    <p className="text-xs text-muted-foreground">Signed in</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowAbout(!showAbout)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        title="About LAI AI"
                    >
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <span className={cn(!isOpen && "md:hidden")}>About LAI AI</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        title={isDark ? "Light Mode" : "Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
                        <span className={cn(!isOpen && "md:hidden")}>{isDark ? "Light Mode" : "Dark Mode"}</span>
                    </button>

                    <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        <span className={cn(!isOpen && "md:hidden")}>Settings</span>
                    </Link>

                    <div className={cn("pt-2 border-t border-white/10 space-y-2", !isOpen && "md:hidden")}>
                        <p className="text-xs text-muted-foreground px-2">Contact Us</p>
                        <a
                            href="https://github.com/Joseph1997-eng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        >
                            <Github className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">GitHub</span>
                        </a>
                        <a
                            href="mailto:josephsaimonn@gmail.com"
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        >
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Email</span>
                        </a>
                    </div>
                </div>
            </aside>

            {showAbout && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAbout(false)}
                >
                    <div
                        className="glass-card p-6 rounded-2xl max-w-md w-full space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Info className="w-6 h-6 text-primary" />
                            About LAI AI
                        </h2>

                        <div className="space-y-3">
                            <p className="text-sm leading-relaxed">
                                <strong className="text-primary">LAI AI</strong> (Leoliver's Assistant Intelligence) is a culturally-aware AI chatbot
                                designed to serve the <strong>Lai Hakha-speaking community</strong> with warmth, wisdom, and care.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Built with cutting-edge technology (Next.js, Google Gemini Vision API), LAI AI preserves and celebrates
                                <strong> Lai language and culture</strong> while providing modern AI assistance.
                            </p>
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-4">
                            <p className="text-sm leading-relaxed">
                                <strong className="text-primary">LAI AI</strong> (Leoliver's Assistant Intelligence) cu Lai Hakha holh hman mi
                                zatlangbu caah <strong>lungthin a thiang, mifim, le dawtmi</strong> tein biaruahnak a pe mi AI chatbot a si.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Technology thar (Next.js, Google Gemini Vision API) hmang in <strong>Lai holh le nunphung</strong> kan humhim le kan upat.
                                Vawleicung Lai holh hman mi kip caah AI technology kan pe.
                            </p>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-primary">Core Values / Tum Duhnak Ṭha Bik:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>♡ Siaherhnak (Deep Love)</div>
                                <div>♡ Mifimnak (Wisdom)</div>
                                <div>♡ Hawikomnak (Friendship)</div>
                                <div>♡ Dawtnak (Care)</div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground italic">
                            Built with ♡ for the Lai community by Joseph (Leoliver)
                        </p>

                        <button
                            onClick={() => setShowAbout(false)}
                            className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            Close / Khar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
