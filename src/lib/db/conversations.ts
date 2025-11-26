import { createClient } from "@/utils/supabase/client";

export type Conversation = {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

export type Message = {
    id: string;
    conversation_id: string;
    role: "user" | "model";
    content: string;
    created_at: string;
};

export async function createConversation(title: string): Promise<Conversation | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();

    if (error) {
        console.error("Error creating conversation:", error);
        return null;
    }

    return data;
}

export async function getConversations(): Promise<Conversation[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }

    return data || [];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data || [];
}

export async function saveMessage(
    conversationId: string,
    role: "user" | "model",
    content: string
): Promise<Message | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, role, content })
        .select()
        .single();

    if (error) {
        console.error("Error saving message:", error);
        return null;
    }

    // Update conversation's updated_at
    await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

    return data;
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

    if (error) {
        console.error("Error deleting conversation:", error);
        return false;
    }

    return true;
}

export async function updateConversationTitle(
    conversationId: string,
    title: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", conversationId);

    if (error) {
        console.error("Error updating conversation title:", error);
        return false;
    }

    return true;
}

export async function updateMessage(
    messageId: string,
    content: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("messages")
        .update({ content })
        .eq("id", messageId);

    if (error) {
        console.error("Error updating message:", error);
        return false;
    }

    return true;
}
