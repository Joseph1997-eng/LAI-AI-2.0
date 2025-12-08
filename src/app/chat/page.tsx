"use client";

import { useState, useRef, useEffect } from "react";
import { Send, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import FileUpload from "@/components/chat/FileUpload";
import Image from "next/image";
import {
    createConversation,
    getMessages,
    saveMessage,
    updateMessage,
    type Conversation,
} from "@/lib/db/conversations";

type Message = {
    id?: string;
    role: "user" | "model";
    parts: { text: string }[];
};

const ThinkingAnimation = () => (
    <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm italic">Ka ruat ta lio...</span>
    </div>
);

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    // Check if desktop on mount
    useEffect(() => {
        const checkDesktop = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
        };
        checkAuth();
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleNewChat = async () => {
        setMessages([]);
        setCurrentConversation(null);
        setSelectedFiles([]);
    };

    const handleLoadConversation = async (conversationId: string) => {
        try {
            const msgs = await getMessages(conversationId);
            const formattedMessages: Message[] = msgs.map(m => ({
                id: m.id,
                role: m.role,
                parts: [{ text: m.content }]
            }));
            setMessages(formattedMessages);
            setSelectedFiles([]);

            // Fetch conversation details
            const { data, error } = await supabase.from('conversations').select('*').eq('id', conversationId).single();

            if (data) {
                setCurrentConversation(data);
            } else {
                // Fallback: create a partial conversation object if fetch fails but we have ID
                // This ensures sendMessage appends to this conversation instead of creating a new one
                console.warn("Could not fetch conversation details, using fallback", error);
                setCurrentConversation({
                    id: conversationId,
                    title: "Chat", // Default title, will be updated if we have it in list
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_id: "" // We don't strictly need this for sending messages usually
                });
            }
        } catch (error) {
            console.error("Error loading conversation:", error);
        }
    };

    const handleFileSelect = (files: File[]) => {
        setSelectedFiles(files);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleEditMessage = async (index: number, newContent: string) => {
        const message = messages[index];
        if (!message.id) return;

        // Optimistic update
        const updatedMessages = [...messages];
        updatedMessages[index] = {
            ...message,
            parts: [{ text: newContent }]
        };
        setMessages(updatedMessages);

        // Save to DB
        await updateMessage(message.id, newContent);
    };

    const sendMessage = async () => {
        if ((!input.trim() && selectedFiles.length === 0) || loading) return;

        // Clear any previous errors
        setError(null);

        let messageText = input;
        if (selectedFiles.length > 0) {
            const fileNames = selectedFiles.map(f => f.name).join(", ");
            messageText = `${input}\n\n[Attached files: ${fileNames}]`;
        }

        const userMessage: Message = { role: "user", parts: [{ text: messageText }] };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        const filesToProcess = [...selectedFiles];
        setSelectedFiles([]);
        setLoading(true);
        setIsStreaming(true);

        // Timeout mechanism (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 30000);
        });

        try {
            let conversation = currentConversation;
            if (!conversation) {
                const title = input.slice(0, 50) + (input.length > 50 ? "..." : "");
                conversation = await createConversation(title);
                if (conversation) {
                    setCurrentConversation(conversation);
                } else {
                    console.error("Failed to create conversation");
                    throw new Error("Failed to create conversation");
                }
            }

            if (conversation) {
                const savedMsg = await saveMessage(conversation.id, "user", messageText);
                if (savedMsg) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const idx = newMsgs.findIndex(m => m.role === 'user' && m.parts[0].text === messageText && !m.id);
                        if (idx !== -1) {
                            newMsgs[idx].id = savedMsg.id;
                        }
                        return newMsgs;
                    });
                }
            }

            const history = messages.map(m => ({
                role: m.role,
                parts: m.parts
            }));

            const fileData = await Promise.all(
                filesToProcess.map(async (file) => ({
                    name: file.name,
                    mimeType: file.type,
                    data: await fileToBase64(file)
                }))
            );

            // Race between API call and timeout
            const fetchPromise = fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: history,
                    files: fileData.length > 0 ? fileData : undefined,
                }),
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || "Failed to send message");
            }
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let modelText = "";

            setMessages((prev) => [...prev, { role: "model", parts: [{ text: "" }] }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                modelText += chunk;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        role: "model",
                        parts: [{ text: modelText }],
                    };
                    return newMessages;
                });
            }

            setIsStreaming(false);

            if (conversation && modelText) {
                const savedModelMsg = await saveMessage(conversation.id, "model", modelText);
                if (savedModelMsg) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg.role === 'model') {
                            lastMsg.id = savedModelMsg.id;
                        }
                        return newMsgs;
                    });
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setIsStreaming(false);

            // Remove the empty model message if it was added
            setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'model' && !newMsgs[newMsgs.length - 1].parts[0].text) {
                    newMsgs.pop();
                }
                return newMsgs;
            });

            // Set error message in Lai language
            if (error instanceof Error) {
                if (error.message === 'TIMEOUT') {
                    setError("Hngak khawh a rei deuhdeuh. Tivei hnih in i fel law.");
                } else if (error.message.includes('API Key')) {
                    setError("API key biafelmiam a um. Administrator ah a hriamhnak petu.");
                } else {
                    setError("Biafelmiam a um. Tivei na fel bah law.");
                }
            } else {
                setError("Biafelmiam a um. Tivei na fel bah law.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onNewChat={handleNewChat}
                onLoadConversation={handleLoadConversation}
                onSidebarToggle={setSidebarOpen}
            />

            {/* Main Chat Area - responsive margin based on sidebar state */}
            <div
                className={`flex-1 flex flex-col relative transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'
                    }`}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

                <header className="flex items-center justify-between p-4 border-b border-border glass z-10">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
                            aria-label="Toggle Menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src="/joseph.jpg"
                                alt="LAI AI"
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-lg">LAI AI</span>
                            <p className="text-xs text-muted-foreground">Joseph&apos;s Assistant</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 hover:bg-accent rounded-full transition-colors" title="Sign Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                                <Image
                                    src="/joseph.jpg"
                                    alt="LAI AI"
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-lg font-medium">Start a conversation with Joseph&apos;s Assistant</p>
                            <p className="text-sm">Lai holh in biaruah khawh ka si.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ChatMessage
                                    role={msg.role}
                                    content={msg.parts[0].text}
                                    isStreaming={isStreaming && idx === messages.length - 1}
                                    onEdit={(newContent) => handleEditMessage(idx, newContent)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                                    <Image
                                        src="/joseph.jpg"
                                        alt="Joseph AI"
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="bg-muted/50 border border-white/5 rounded-2xl rounded-tl-none p-4">
                                    <ThinkingAnimation />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 max-w-md">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <span className="text-red-500 text-sm">⚠</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-red-400 text-sm mb-3">{error}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setError(null);
                                                    // Retry by getting the last user message and resending
                                                    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                                                    if (lastUserMsg) {
                                                        setInput(lastUserMsg.parts[0].text);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                                            >
                                                Tivei fel biak
                                            </button>
                                            <button
                                                onClick={() => setError(null)}
                                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-muted-foreground rounded-lg text-sm transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 glass border-t border-border">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end gap-2">
                            <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    placeholder="Bia halnak..."
                                    className="flex-1 bg-background/50 border border-input rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    disabled={loading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading || (!input.trim() && selectedFiles.length === 0)}
                                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
