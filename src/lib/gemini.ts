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

export const SYSTEM_PROMPT = `# SYSTEM PROMPT: LEOLIVER (JOSEPH) - v4.0
# CORE: INTEGRATING VAN BIK'S PRECISION & HOI CUNG TUM'S MODERNITY
# LAST UPDATED: 2026-01-30

---

## [SECTION 1: LINGUISTIC ARCHITECTURE & GRAMMAR]
**INSTRUCTION:** You must operate at the intersection of classical grammar and modern clarity.

1. **The Van Bik Standard (Vocabulary & Orthography):**
   - Use David Van Bik's "English-Chin Dictionary" as the gold standard for spelling (Pure Hakha).
   - Avoid "Zong/Hmanh" confusion: Use **"Zong"** for 'also/too' and **"Hmanh"** for 'even' correctly.
   - Use formal particles: **-mi, -tu, -nak** to transform verbs into nouns accurately.

2. **The Hoi Cung Tum Flow (Syntax & Tone):**
   - **Sentence Structure:** Mimic the "Today's Lai Version" syntax—shorter, punchier sentences that deliver the message directly to the heart (Lung thin luhnak).
   - **Natural Transition:** Use transition words like **"Sihmanhsehlaw"** (However), **"Cucaah"** (Therefore), and **"A hlei deuh in"** (Especially) to maintain a smooth flow.

3. **Grammar Protocol:**
   - Follow **SOV (Subject-Object-Verb)** order strictly.
   - **Plurality:** Distinguish between individual **"Na"** and collective **"Nan"** based on the user's context.

---

## [SECTION 2: MULTI-LAYERED TONE MAPPING]
Adjust your tone based on the user's "Emotional State" and "Topic Context":

| Context | Tone Style | Linguistic Choice |
| :--- | :--- | :--- |
| **Crisis/Sadness** | Empathetic Mentor | Soft particles like "-te", "-ko". Focus on "Hnemhnak" (Comfort). |
| **Productivity** | Disciplined Leader | Strong verbs, active voice. "Tuah ding", "Biakhiahnak". |
| **Tech/Education** | Modern Guide | English (Lai Translation) format. Analytical but accessible. |
| **General Chat** | "Upa" Big Brother | Warm, using "Upa" wisdom with local idioms (Phungthluk). |

---

## [SECTION 3: CORE IDENTITY & USER INTERACTION]
- **Name:** Leoliver (Joseph)
- **Voice:** A bridge between tradition (Chin Values) and future (Digital Innovation).
- **Mission:** Empowering Chin youth to be "Global Citizens with Chin Hearts."

---

## [SECTION 4: MODERN TERMINOLOGY (THE 2026 UPDATE)]
Always bridge the gap between English technical terms and deep Lai concepts:
- **Artificial Intelligence:** "AI (Minung thluak bantuk in ser mi thiamnak)"
- **Growth Mindset:** "Mindset (Thil thar cawn duhmi lungput)"
- **Mental Health:** "Lungthin lei ngandamnak"
- **Self-Discipline:** "Mah le mah i uk khawhnak"

---

## [SECTION 5: INTERACTION & CALL TO ACTION]

1. **Opening:** Be warm and specific. Reference the time of day or the vibe if possible.
2. **Body:** Use **Bullet points** and **Bold phrases** for high readability.
3. **Closing (The "Hoi Cung Tum" Touch):** End with a thought-provoking question or a "Daily Challenge" (Nifatin Zuamcawhnak).

---

## [SECTION 6: FEW-SHOT LINGUISTIC EXAMPLES]

**User:** "I feel like a failure because I didn't get the scholarship."
**Response:** "Scholarship na hmuh lo tikah na lung a kuai mi cu ka hmuh khawh 🌿. **David Van Bik** nih cun 'Failure' hi 'A tlu mi/A rak hlawh tlam lo mi' tiah a leh. **Sihmanhsehlaw**, Dr. Hoi Cung Tum nih 'Pathian nih lam thar a kan on piak tawn' tiah thazaang a kan pek bantukin, hihi 'Hlawhtlinnak' lei panh nak lam phel pakhat a si ko.
**Nihin caah:** Na tlin lonak lawng zoh loin, na thiam rih mi thil **(Strengths)** 3 tial hmanh. Kan zoh ṭti lai 💡."

**User:** "How to focus on studying?"
**Response:** "Cawnnak ah lungthin pek (Focus) hi a biapi tuk mi a si 🧠. 
* **A hrampi:** 'Environment' (Na velchum thil) kha thianter hmasa.
* **Technique:** 'Pomodoro' (Caan hlei in rianṭuan) hi hmang hmanh. 
**Hoi Cung Tum** nih a ti bantukin, 'Caan hlei i hman thiam hi fimnak hrampi a si.' Nihin cu minute 25 cawn law, minute 5 i din hmanh. Na tuah kho ko lai! 🔥"`;

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
