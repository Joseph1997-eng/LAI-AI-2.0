import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Helper function to convert file to base64
async function fileToBase64(file: { data: string; mimeType: string }) {
    return {
        inlineData: {
            data: file.data,
            mimeType: file.mimeType
        }
    };
}

export async function POST(req: Request) {
    try {
        const { message, history, files } = await req.json();

        console.log("Received message:", message);
        console.log("Received files:", files?.length || 0);

        if (!process.env.GOOGLE_API_KEY) {
            console.error("Error: GOOGLE_API_KEY is missing");
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        // Sanitize history to ensure no consecutive user messages
        // Gemini API expects User -> Model -> User -> Model
        // If we have User -> User, we should drop the previous one or merge?
        // Dropping the previous one is safer as it might be a failed attempt.
        const sanitizedHistory = [];
        if (history && history.length > 0) {
            let lastRole = null;
            for (const msg of history) {
                if (msg.role === lastRole && msg.role === 'user') {
                    // Skip consecutive user message (keep the new one, drop old one? or vice versa?)
                    // Actually, if we are building a list, and we see User, and last was User.
                    // We should replace the last one with this one? Or drop this one?
                    // Usually the *last* message in history is the one before the *current* message.
                    // If history has [... User, User], it's invalid.
                    // Let's keep the *last* user message of a sequence.
                    sanitizedHistory.pop(); // Remove previous user message
                }
                sanitizedHistory.push(msg);
                lastRole = msg.role;
            }

            // Also, history should not end with 'user' because we are about to send a 'user' message?
            // Wait, startChat takes history.
            // If history ends with User, and we call sendMessage (which sends User content),
            // Gemini will see User -> User.
            // So history MUST end with Model (or be empty).
            if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
                console.warn("History ends with user, dropping last message to prevent User-User turn error.");
                sanitizedHistory.pop();
            }
        }

        console.log("Sanitized history length:", sanitizedHistory.length);

        const chat = model.startChat({
            history: sanitizedHistory,
        });

        // Prepare message content with files if provided
        let messageContent: any;

        if (files && files.length > 0) {
            // For multimodal content (text + images)
            const parts: any[] = [];

            // Add text part
            if (message) {
                parts.push({ text: message });
            }

            // Add file parts (images)
            for (const file of files) {
                if (file.data && file.mimeType) {
                    parts.push(await fileToBase64(file));
                }
            }

            messageContent = parts;
        } else {
            // Text only
            messageContent = message;
        }

        const result = await chat.sendMessageStream(messageContent);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                    controller.close();
                } catch (streamError) {
                    console.error("Stream Error:", streamError);
                    controller.error(streamError);
                }
            },
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (error: any) {
        console.error("Chat API Error Detailed:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error", details: error.toString() }, { status: 500 });
    }
}
