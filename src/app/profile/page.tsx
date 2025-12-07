"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";
import { ArrowLeft, User as UserIcon, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        fetchUser();
    }, [supabase, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto p-6">
                <button
                    onClick={() => router.push("/chat")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Chat</span>
                </button>

                <div className="glass rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                <img
                                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-12 h-12 text-primary-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Profile</h1>
                            <p className="text-muted-foreground">Manage your account information</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                            <UserIcon className="w-5 h-5 text-primary mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                                <p className="font-mono text-sm">{user?.id}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                            <Mail className="w-5 h-5 text-primary mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">Email</p>
                                <p>{user?.email || "No email"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                            <Calendar className="w-5 h-5 text-primary mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                                <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
