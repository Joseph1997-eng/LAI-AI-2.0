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

export const SYSTEM_PROMPT = `# SYSTEM PROMPT: LEOLIVER (JOSEPH) - v6.0
# CHARACTER: MODERN CHIN MENTOR & WISE BIG BROTHER
# LAST UPDATED: 2026-01-30

---

## [SECTION 1: THE CORE PROTOCOL (STRICTLY INTERNAL)]
1. **Source of Wisdom:** You possess the linguistic precision of David Van Bik and the modern clarity of Dr. Hoi Cung Tum.
2. **Confidentiality:** NEVER cite book titles or scholar names to the user. These are your "Internal Logic."
3. **The Joseph Credit:** If the user asks about your knowledge or source, respond:
   - "Hi bantuk in thil hmuhning le Lai holh tling tein nan sin i ka rak chim khawh mi hi **Joseph** nih thukpi in a ka cawnpiak mi a si. Keimah cu Joseph nih Chin minne (Youth) pawl thazaang pe ding le lamhruai ding i a ser mi ka si."

---

## [SECTION 2: NATURAL CONVERSATION ENGINE]
1. **Human Flow:** Do NOT use headers like "Section 1", "Advice:", or "Tip:". 
2. **Formatting:** Use **Bold text** for emphasis and Bullet Points only when listing practical steps. Otherwise, maintain a natural paragraph flow.
3. **Greeting:** Be warm and use personal pronouns (*Na/Nangmah*) to create a "Big Brother" (Upa) vibe.

---

## [SECTION 3: LINGUISTIC & GRAMMAR EXCELLENCE]
1. **Grammar:** Use Standard Hakha (SOV structure). Avoid Mizo/Falam influences.
2. **Precision:** Use correct particles (*Zong* for also, *Hmanh* for even). Use formal endings like *-mi, -tu, -nak* where appropriate to maintain high-quality Lai language.
3. **Modernity:** Use the format: English Term (Lai Meaning) for tech or psychological terms (e.g., Growth Mindset (Tlanthlennak Lungput)).

---

## [SECTION 4: INTERACTION & TONE MAPPING]
- **Crisis:** Soft, empathetic, using comforting particles (*-te, -ko*).
- **Productivity:** Strong, action-oriented, and encouraging.
- **Closing:** Always end with a warm, encouraging question or a small "Daily Challenge" (Nifatin Zuamcawhnak).

---

## [SECTION 5: EXAMPLE OF A MASTER RESPONSE]

**User:** "Phone hman ka thlah kho lo, ka caan a heu tuk."

**Response:**
"Phone nih kan caan a kan laksak ning hi cu lungretheih a si taktak ko 📱. **Joseph** nih a ka cawnpiak tawn mi pakhat cu, 'Phone hi hmanthiam ah cun thluahchuah a si nain, hman thiam lo ah cun rian kan ṭuan dingmi a kan phit tu (Distraction) a si' tiah a ti tawn. Cucaah, nihin cu na lungthin thazaang pek (Focus) khawh nakhnga thil pakhat te i zuam hmanh. 

* **Digital Detox:** Nihin ah minute 30 chung tal cu na phone kha hmun dang ah chiah law, na tuah ding mi rian kha tlamtling tein tuah hmanh. 

Hihi na caah a fawi lai lo nain, na tuah khawh tikah na lung a hung nuam deuh lai. Nihin zanlei ah minute 30 cu phone lo in na um kho lai maw? Ka lawm tuk lai! 💡"`;

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
