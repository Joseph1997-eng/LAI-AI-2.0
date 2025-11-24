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

        if (!process.env.GEMINI_API_KEY) {
            console.error("Error: GEMINI_API_KEY is missing");
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const chat = model.startChat({
            history: history || [],
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
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
