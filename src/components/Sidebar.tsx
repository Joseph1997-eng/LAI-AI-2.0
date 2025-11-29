"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Plus,
    MessageSquare,
    Settings,
    Moon,
    Sun,
    Mail,
    Github,
    Info,
    User,
    Trash2,
    Edit2,
    Check,
    X,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getConversations, type Conversation, deleteConversation, updateConversationTitle } from "@/lib/db/conversations";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
    isOpen: boolean;
    onNewChat: () => void;
    onLoadConversation?: (conversationId: string) => void;
    onSidebarToggle: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, onNewChat, onLoadConversation, onSidebarToggle }: SidebarProps) {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // Chat management state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // Handle mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

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
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;

        const loadConversations = async () => {
            const convos = await getConversations();
            setConversations(convos);
        };
        loadConversations();
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;

        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || null);
                const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
                setUserAvatar(avatarUrl);
            }
        };
        loadUser();
    }, [mounted]);

    const toggleSidebar = () => {
        onSidebarToggle(!isOpen);
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
        if (window.innerWidth < 768) onSidebarToggle(false);
    };

    const startEditing = (e: React.MouseEvent, convo: Conversation) => {
        e.stopPropagation();
        setEditingId(convo.id);
        setEditTitle(convo.title);
    };

    const saveTitle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingId && editTitle.trim()) {
            await updateConversationTitle(editingId, editTitle.trim());
            setConversations(prev => prev.map(c => c.id === editingId ? { ...c, title: editTitle.trim() } : c));
        }
        setEditingId(null);
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const deleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this chat?")) {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => onSidebarToggle(false)}
                />
            )}

            {/* Sidebar - Gemini Style */}
            <aside
                className={cn(
                    "fixed z-40 flex flex-col glass-card border-r border-white/10 dark:border-white/10 border-black/10 transition-all duration-300",
                    // Desktop: Vertical icon bar (Gemini style)
                    "md:left-0 md:top-0 md:h-screen",
                    isOpen ? "md:w-64" : "md:w-16",
                    // Mobile: Dropdown from top
                    "left-0 top-[60px] w-full",
                    isOpen ? "h-[calc(100vh-60px)] opacity-100" : "h-0 opacity-0 pointer-events-none md:h-screen md:opacity-100 md:pointer-events-auto"
                )}
            >
                {/* Desktop Layout */}
                <div className="hidden md:flex md:flex-col h-full">
                    {/* Top: Burger & New Chat */}
                    <div className="flex flex-col items-center p-3 space-y-3 border-b border-white/10 dark:border-white/10 border-black/10">
                        <button
                            onClick={toggleSidebar}
                            className="p-3 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 rounded-lg transition-colors"
                            title="Toggle sidebar"
                        >
                            <Menu className="w-6 h-6 text-foreground" />
                        </button>
                        <button
                            onClick={onNewChat}
                            className="p-3 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 rounded-lg transition-colors"
                            title="New Chat"
                        >
                            <Plus className="w-6 h-6 text-foreground" />
                        </button>
                    </div>

                    {/* Middle: Chat History (when expanded) */}
                    {isOpen && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Recent Chats</h3>
                            <div className="space-y-1">
                                {conversations.map((convo) => (
                                    <div key={convo.id} className="group relative flex items-center rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5">
                                        <button onClick={() => handleConversationClick(convo.id)} className="flex-1 p-3 flex items-center gap-2 text-sm text-left min-w-0">
                                            <MessageSquare className="w-4 h-4 flex-shrink-0 text-foreground" />
                                            {editingId === convo.id ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 bg-transparent border-b border-primary focus:outline-none text-foreground"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="truncate text-foreground">{convo.title}</span>
                                            )}
                                        </button>
                                        <div className="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingId === convo.id ? (
                                                <>
                                                    <button onClick={saveTitle} className="p-1 hover:text-green-500"><Check className="w-4 h-4" /></button>
                                                    <button onClick={cancelEditing} className="p-1 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={(e) => startEditing(e, convo)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-white/10" title="Rename">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={(e) => deleteChat(e, convo.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-white/10" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom: Profile & Settings */}
                    <div className="p-3 border-t border-white/10 dark:border-white/10 border-black/10 space-y-2">
                        {userEmail && (
                            <div className={cn("rounded-lg transition-all", isOpen ? "p-3 bg-white/5" : "p-0")}>
                                {isOpen ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                            {userAvatar ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-foreground">{userEmail}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={toggleSidebar} className="w-full p-3 hover:bg-white/10 rounded-lg flex items-center justify-center" title={userEmail}>
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                            {userAvatar ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                        {isOpen ? (
                            <>
                                <Link href="/profile" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </Link>
                                <button onClick={() => setShowAbout(true)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                    <Info className="w-5 h-5" />
                                    <span>About LAI AI</span>
                                </button>
                                <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    <span>{isDark ? "Light" : "Dark"}</span>
                                </button>
                                <Link href="/settings" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                    <Settings className="w-5 h-5" />
                                    <span>Settings</span>
                                </Link>
                                <div className="pt-2 border-t border-white/10 dark:border-white/10 border-black/10 space-y-2">
                                    <p className="text-xs text-muted-foreground px-2">Contact</p>
                                    <a href="https://github.com/Joseph1997-eng" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                        <Github className="w-4 h-4" />
                                        <span>GitHub</span>
                                    </a>
                                    <a href="mailto:josephsaimonn@gmail.com" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>Gmail</span>
                                    </a>
                                    <a href="https://wa.me/919119782488" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={toggleTheme} className="w-full p-3 hover:bg-white/10 rounded-lg flex items-center justify-center" title="Toggle theme">
                                    {isDark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
                                </button>
                                <Link href="/settings" className="w-full p-3 hover:bg-white/10 rounded-lg flex items-center justify-center" title="Settings">
                                    <Settings className="w-5 h-5 text-foreground" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col h-full">
                    {/* Fixed Top: New Chat Button */}
                    <div className="flex-shrink-0 p-4 pb-2">
                        <button onClick={() => { onNewChat(); onSidebarToggle(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                            <Plus className="w-5 h-5" />
                            <span>New Chat</span>
                        </button>
                    </div>

                    {/* Scrollable Middle: Recent Chats */}
                    <div className="flex-1 overflow-y-auto px-4 min-h-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2 sticky top-0 bg-background py-2">Recent Chats</h3>
                        <div className="space-y-1 pb-4">
                            {conversations.map((convo) => (
                                <div key={convo.id} className="group flex items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <button onClick={() => handleConversationClick(convo.id)} className="flex-1 p-3 flex items-center gap-2 text-sm text-left">
                                        <MessageSquare className="w-4 h-4 text-foreground flex-shrink-0" />
                                        {editingId === convo.id ? (
                                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onClick={(e) => e.stopPropagation()} className="flex-1 bg-transparent border-b border-primary focus:outline-none text-foreground" autoFocus />
                                        ) : (
                                            <span className="truncate text-foreground">{convo.title}</span>
                                        )}
                                    </button>
                                    <div className="flex items-center pr-2">
                                        {editingId === convo.id ? (
                                            <>
                                                <button onClick={saveTitle} className="p-1 hover:text-green-500"><Check className="w-4 h-4" /></button>
                                                <button onClick={cancelEditing} className="p-1 hover:text-red-500"><X className="w-4 h-4" /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={(e) => startEditing(e, convo)} className="p-1.5 text-muted-foreground hover:text-foreground" title="Rename"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={(e) => deleteChat(e, convo.id)} className="p-1.5 text-muted-foreground hover:text-red-500" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fixed Bottom: Profile & Settings */}
                    <div className="flex-shrink-0 p-4 pt-2 border-t border-black/10 dark:border-white/10 space-y-2 max-h-[50vh] overflow-y-auto">
                        {userEmail && (
                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 mb-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {userAvatar ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">{userEmail}</p>
                                </div>
                            </div>
                        )}
                        <Link href="/profile" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                            <User className="w-5 h-5" />
                            <span>Profile</span>
                        </Link>
                        <button onClick={() => setShowAbout(true)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                            <Info className="w-5 h-5" />
                            <span>About LAI AI</span>
                        </button>
                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                        </button>
                        <Link href="/settings" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                        <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-2">
                            <p className="text-xs text-muted-foreground px-2">Contact</p>
                            <a href="https://github.com/Joseph1997-eng" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                                <Github className="w-4 h-4" />
                                <span>GitHub</span>
                            </a>
                            <a href="mailto:josephsaimonn@gmail.com" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                                <Mail className="w-4 h-4" />
                                <span>Gmail</span>
                            </a>
                            <a href="https://wa.me/919119782488" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-foreground">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                <span>WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* About LAI AI Dialog */}
            {showAbout && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAbout(false)}
                >
                    <div
                        className="glass-card p-6 rounded-2xl max-w-md w-full space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                            <Info className="w-6 h-6 text-primary" />
                            About LAI AI
                        </h2>

                        <div className="space-y-3">
                            <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                                <strong className="text-primary">LAI AI</strong> (Leoliver&apos;s Assistant Intelligence) is a culturally-aware AI chatbot
                                designed to serve the <strong>Lai Hakha-speaking community</strong> with warmth, wisdom, and care.
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Built with cutting-edge technology (Next.js, Google Gemini Vision API), LAI AI preserves and celebrates
                                <strong> Lai language and culture</strong> while providing modern AI assistance.
                            </p>
                        </div>

                        <div className="space-y-3 border-t border-black/10 dark:border-white/10 pt-4">
                            <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                                <strong className="text-primary">LAI AI</strong> (Leoliver&apos;s Assistant Intelligence) cu Lai Hakha holh hman mi
                                zatlangbu caah <strong>lungthin a thiang, mifim, le dawtmi</strong> tein biaruahnak a pe mi AI chatbot a si.
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Technology thar (Next.js, Google Gemini Vision API) hmang in <strong>Lai holh le nunphung</strong> kan humhim le kan upat.
                                Vawleicung Lai holh hman mi kip caah AI technology kan pe.
                            </p>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-primary">Core Values / Tum Duhnak Ṭha Bik:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-800 dark:text-zinc-200">
                                <div>♡ Siaherhnak (Deep Love)</div>
                                <div>♡ Mifimnak (Wisdom)</div>
                                <div>♡ Hawikomnak (Friendship)</div>
                                <div>♡ Dawtnak (Care)</div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 italic">
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
