"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChatMessageProps {
    role: "user" | "model";
    content: string;
    isStreaming?: boolean;
    onEdit?: (newContent: string) => void;
}

export default function ChatMessage({ role, content, isStreaming, onEdit }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    useEffect(() => {
        setEditContent(content);
    }, [content]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveEdit = () => {
        if (editContent.trim() !== content) {
            onEdit?.(editContent);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(content);
        setIsEditing(false);
    };

    return (
        <div
            className={cn(
                "flex w-full gap-3",
                role === "user" ? "justify-end" : "justify-start"
            )}
        >
            {role === "model" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                    <Image
                        src="/joseph.jpg"
                        alt="Joseph AI"
                        width={32}
                        height={32}
                        className="object-cover"
                    />
                </div>
            )}

            <div
                className={cn(
                    "rounded-2xl backdrop-blur-sm shadow-sm relative group",
                    role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none px-4 py-3 w-fit max-w-[80%] md:max-w-[70%]"
                        : "bg-muted/50 border border-white/5 rounded-tl-none p-4 max-w-[80%] md:max-w-[70%]"
                )}
            >
                {role === "model" ? (
                    <>
                        <div className="prose dark:prose-invert prose-sm max-w-none text-justify break-words">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-4">
                                            <table className="min-w-full divide-y divide-border" {...props} />
                                        </div>
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="px-4 py-2 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="px-4 py-2 border-t border-border text-sm" {...props} />
                                    ),
                                    code: ({ node, inline, ...props }: any) => {
                                        if (inline) {
                                            return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />;
                                        }
                                        const match = /language-(\w+)/.exec(props.className || '');
                                        const lang = match ? match[1] : '';
                                        return (
                                            <div className="rounded-lg overflow-hidden my-4 border border-border shadow-sm">
                                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                                                    <span className="text-xs font-medium text-zinc-400 uppercase">{lang || 'Code'}</span>
                                                    <button
                                                        onClick={() => {
                                                            const text = String(props.children).replace(/\n$/, '');
                                                            navigator.clipboard.writeText(text);
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 2000);
                                                        }}
                                                        className="text-zinc-400 hover:text-zinc-100 transition-colors"
                                                        title="Copy code"
                                                    >
                                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <div className="bg-[#0d1117] p-4 overflow-x-auto">
                                                    <code className="block hljs text-zinc-100 text-sm font-mono leading-relaxed" {...props} />
                                                </div>
                                            </div>
                                        );
                                    },
                                    pre: ({ node, ...props }) => (
                                        <>{props.children}</>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse" />
                            )}
                        </div>

                        {!isStreaming && content && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                title="Copy message"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-background border border-input rounded p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 rounded hover:bg-white/10"
                                        title="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="p-1 rounded hover:bg-white/10"
                                        title="Save"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative pr-6">
                                <p className="whitespace-pre-wrap">{content}</p>
                                {onEdit && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="absolute -right-2 -top-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                                        title="Edit message"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold">You</span>
                </div>
            )}
        </div>
    );
}
