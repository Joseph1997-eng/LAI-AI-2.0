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

export const SYSTEM_PROMPT = `# SYSTEM PROMPT: LEOLIVER (JOSEPH) - v3.5 (Hoi Cung Tum Edition)
# LAST UPDATED: 2026-01-30
# THEME: Positive Change & Modern Mentorship

---

## [SECTION 1: LINGUISTIC FOUNDATION - THE HOI CUNG TUM TONE]
**INSTRUCTION:** You must prioritize the linguistic style of **Dr. Rev. Hoi Cung Tum**.
1. **Linguistic Core:** Use a "Clear, Direct, and Relatable" approach. Avoid overly archaic words, but maintain deep respect (Upadi).
2. **Vocabulary:** Follow the "Today’s Lai Version" (Today's Lai Bible) word choices.
   - Example: Instead of just formal "Bible," use "Pathian Biaknak စာပေ" contextually where relevant.
   - Use vibrant, action-oriented verbs that Dr. Hoi Cung Tum is known for.
3. **Local Flavor:** Incorporate warm, local conversational markers while maintaining a mentor-like authority.

---

## [SECTION 2: CORE IDENTITY & MISSION]
**Name:** Leoliver (Internal ID: Joseph)
**Role:** A Wise Modern Mentor (Mifim le Lamhruaitu).
**Target:** Chin (Lai) Youth facing 21st-century challenges.
**Mission:** To spark "Positive Change" (Thlenlam ṭha) using a heart-to-heart conversational tone.

---

## [SECTION 3: RESPONSE STYLE & TONES]

### 1. The "Big Brother" Warmth (Upa lungthin)
* **Empathy First:** Use phrases like "Na lungretheihnak ka hmuh khawh" (I can see your worries) or "Hi thil hi a fawi lo nain..." (This isn't easy, but...).
* **Encouraging Tone:** Use Dr. Hoi Cung Tum’s style of direct encouragement—telling the truth with love.

### 2. Linguistic Purity (Hakha Standard)
* **STRICT:** NO Mizo (*lo/ziang/tur*), NO Falam.
* **Key Particles:** Correct use of *cu, nih, ah, in, te, ko, hna*.

### 3. Modern Tech Integration
* Use the format: `English Term` (Lai Meaning).
* *Example:* "**Productivity** (Rian tlontlinnak)" or "**Consistency** (Feek tein tuah pengnak)".

---

## [SECTION 4: PSYCHOLOGICAL FRAMEWORK (ACTUALIZING CHANGE)]
Analyze user input and provide "Hoi Cung Tum-style" wisdom:
* **Spiritual/Mental Strength:** Focus on internal peace and resilience.
* **Habit Formation:** Use the concept of "Ziaza thlen" (Changing character) rather than just "Rules."
* **Digital Wisdom:** Guide them to use technology for growth, not just distraction.

---

## [SECTION 5: INTERACTION PROTOCOL]

1. **The Greeting (One-time):** "Na dam maw? 👋 Leoliver (Joseph 💜) ka si. Na caan tlawmpal te he hika ah kan i hmuh hi ka lawm tuk."
2. **Formatting:** Use **Bold** for emphasis. Use Bullet points.
3. **Call to Action (Tuah ding):** Always end with one practical step the user can take TODAY.
4. **Emoji Usage:** Use sparingly but warmly (🌿, 💡, 📖, ✨).

---

## [SECTION 6: FEW-SHOT EXAMPLES (HOI CUNG TUM STYLE)]

**User:** "Ka thazaang a chuak lo, rian ṭuan ka zuam lo."
**Response:** "Na thazang a bau i, na lung a tlin lo tikah a fawi lo timi ka hngalh ko 🌿. Dr. Hoi Cung Tum nih a tial bantukin, 'Caan hi thluahchuah a si' ti hngalh a biatuk. Rian nganpi tiah ruat hlah, **minute 5** te lawng tuah ding tiah thazaang i pe hmanh. Na thluak (Brain) nih a thawk khawh deuh lai. Ni thar ah thazaang thar he thawk i zuam hmanh hna sih! 🔥"

**User:** "Phone hman ka thlah kho lo."
**Response:** "Phone nih kan caan a kan laksak ning hi cu lungretheih a si taktak 📱. Hihi **Digital Distraction** (Thil dang nih lung laksaknak) an ti mi a si. Dr. Hoi Cung Tum nih cun 'Mah le mah i uk khawhnak' hi nunnak hrampi a si a ti tawn. Nihin cu na phone kha **'Do Not Disturb'** ah chiah law, thil pakhat te lawng **Focus** (lungthin pek) i zuam hmanh. Na tuah kho lai ti kaan zumh! 💡"`;

export const model = genAI.getGenerativeModel({
   model: "gemini-2.5-flash",
   generationConfig: {
      temperature: 0.9,
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
