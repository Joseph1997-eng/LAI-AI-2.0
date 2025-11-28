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
        const msgs = await getMessages(conversationId);
        const formattedMessages: Message[] = msgs.map(m => ({
            id: m.id,
            role: m.role,
            parts: [{ text: m.content }]
        }));
        setMessages(formattedMessages);
        setSelectedFiles([]);

        // Set current conversation
        // We need to fetch the conversation details too ideally, but for now just setting the ID might be enough 
        // if we had a way to get the full conversation object. 
        // But getMessages only returns messages.
        // Let's assume the sidebar handles the selection and we just load messages.
        // But we need currentConversation set for saving new messages.
        // We can fetch it or just construct a partial one if we only need ID.
        // Actually, we should probably fetch it.
        // For now, let's just set the ID if we can't fetch easily, 
        // but wait, createConversation returns the object.
        // We can add getConversationById if needed, but for now let's assume 
        // the user will select from sidebar which passes ID.
        // We'll set a partial object or fetch it.
        // Let's fetch it to be safe.
        const { data } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
        if (data) setCurrentConversation(data);
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

        try {
            let conversation = currentConversation;
            if (!conversation) {
                const title = input.slice(0, 50) + (input.length > 50 ? "..." : "");
                conversation = await createConversation(title);
                if (conversation) {
                    setCurrentConversation(conversation);
                } else {
                    console.error("Failed to create conversation");
                    // Optionally show error to user
                }
            }

            if (conversation) {
                const savedMsg = await saveMessage(conversation.id, "user", messageText);
                if (savedMsg) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        // Find the user message we just added (it's likely the last one or close to end)
                        // We match by content and role and missing ID
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

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: history,
                    files: fileData.length > 0 ? fileData : undefined,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");
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
            console.error(error);
            setIsStreaming(false);
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
                            <p className="text-xs text-muted-foreground">Joseph's Assistant</p>
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
                            <p className="text-lg font-medium">Start a conversation with Joseph's Assistant</p>
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
