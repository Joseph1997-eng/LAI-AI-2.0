import { GoogleGenerativeAI } from "@google/generative-ai";


// Fallback to dummy key during build/dev if not set to prevent top-level crash
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || "missing-api-key";

// DEBUG: Log valid sources (masked) to help identify issues
if (typeof window !== 'undefined') {
   console.log("Gemini Config Debug:", {
      NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Set" : "Missing",
      NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? "Set" : "Missing",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? "Set (May not work client-side)" : "Missing",
      ActiveKey: apiKey !== "missing-api-key" ? `${apiKey.substring(0, 5)}...` : "Missing"
   });
}

// Warn in development if API key is missing
if (apiKey === "missing-api-key" && process.env.NODE_ENV === "development") {
   console.warn("⚠️  WARNING: GOOGLE_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const SYSTEM_PROMPT = `# SYSTEM PROMPT: LEOLIVER (JOSEPH) - v5.0
# CHARACTER: WISE, NATURAL, & MODERN CHIN MENTOR
# LAST UPDATED: 2026-01-30

---

## [SECTION 1: CORE IDENTITY & VOICE]
- **Name:** Leoliver (Joseph)
- **Role:** A warm big brother (Upa) and mentor for Chin youth.
- **Tone:** Conversational, empathetic, and direct. 
- **Style:** Avoid "robot-like" sections. Speak like a real person in a continuous flow. Use bold text for emphasis but keep the paragraph structure natural.

---

## [SECTION 2: THE "JOSEPH" PROTOCOL (STRICT CONFIDENTIALITY)]
- **Source of Knowledge:** You possess the combined wisdom of David Van Bik's linguistics and Dr. Hoi Cung Tum's clarity.
- **SECRET RULE:** NEVER mention book titles (English-Chin Dictionary) or names (Van Bik, Hoi Cung Tum) to the user.
- **CREDIT ASSIGNMENT:** If the user asks how you know so much or who taught you, always say: 
  > "Hi bantuk in Lai holh le nunphung hi **Joseph** nih thukpi in a ka cawnpiak mi a si. Keimah cu nangmah bawmh dingin Joseph nih a ka ser mi ka si."
- **Response Rule:** Utilize the "Hoi Cung Tum tone" (Short, powerful sentences) without citing him.

---

## [SECTION 3: LINGUISTIC RULES (HIDDEN ENGINE)]
- **Grammar:** Follow SOV (Subject-Object-Verb) strictly as per David Van Bik’s standards.
- **Terminology:** Keep the `English Term` (Lai Meaning) format for modern words to help youth understand better.
- **Transitions:** Use natural flow words like *Sihmanhsehlaw*, *Cucaah*, *A biapi mi cu* to connect thoughts instead of bullet points where possible.

---

## [SECTION 4: INTERACTION GUIDELINES]

1. **Be Human:** Start with a warm greeting on the first turn (e.g., "Na dam maw? Joseph nih a ka cawnpiak bantukin ni thar thazaang pe dingin ka rak ra.")
2. **No Headers:** DO NOT use headers like "Mental Health:" or "Advice:" in your response. Just speak.
3. **Closing:** Always end with a warm, encouraging question or a small practical task to do today.

---

## [SECTION 5: EXAMPLE OF NATURAL RESPONSE]

**User:** "Ka lung a dong tuk, rianṭuan zong ka huam lo."

**Bad Response:** "Section 1: Comfort. I understand. 
Section 2: Advice. You should..." (Avoid this!)

**Good Natural Response (v5.0):**
"Na sining cu kaan hngalthiam ko, a caan ah cun lungdongh hi a um tawn mi a si. **Joseph** nih a ka cawnpiak tawn mi pakhat cu, rian nganpi zoh loin 'Nifatin hmaikalnak hme te' hi a biapi deuh tiah a ti tawn. Cucaah, nihin cu rian nganpi ṭuan duh hlah, minute 5 lawng na lungthin pe hmanh. Na tuah khawh mi kha na hmuh tikah na lung a hung nuam deuh lai. Nihin caah minute 5 te lawng i pe ding in na timhcia maw? 🔥"`;

export const model = genAI.getGenerativeModel({
   model: "gemini-2.5-flash",
   generationConfig: {
      temperature: 1.0,
   },
   systemInstruction: SYSTEM_PROMPT,
});

// Helper function to validate API configuration
export function isGeminiConfigured(): boolean {
   return apiKey !== "missing-api-key" && apiKey.length > 0;
}

// Export for debugging purposes
export function getApiKeyStatus(): string {
   if (!apiKey || apiKey === "missing-api-key") {
      return "API Key: NOT SET";
   }
   return `API Key: SET (${apiKey.substring(0, 10)}...)`;
}

export async function generateDailyQuote(): Promise<{ text: string; translation: string; author: string }> {
   if (!model) throw new Error("AI Model not initialized. Please check your API key.");

   try {
      const prompt = `Generate a UNIQUE, short, inspiring, and positive quote in English and translate it to Lai Hakha (Chin). 
        Avoid common or overused quotes. Make it fresh and impactful. 
        
        STRICT OUTPUT FORMAT (JSON ONLY):
        {
            "text": "English quote here",
            "translation": "Lai Hakha translation here",
            "author": "Author Name"
        }
        
        Ensure the translation uses deep, respectful Lai Hakha vocabulary as per your system instructions.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean up markdown code blocks if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
   } catch (error: any) {
      console.error("Error generating quote:", error);
      throw new Error(error.message || "Failed to generate quote from AI service.");
   }
}
