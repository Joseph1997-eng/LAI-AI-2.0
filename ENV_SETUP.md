# ENV Setup Instructions

Joseph ရေ၊ `.env.local` file က Git ကနေ ဖျက်လိုက်တဲ့အခါ Local မှာလည်း ပျောက်သွားပါတယ်။

## အဆင့်ဆင့် လုပ်ဆောင်ရန်:

1. **File အသစ် ဆောက်ပါ**: `c:\LAI AI\web\.env.local`

2. **အောက်ပါ content ထည့်ပါ**:
```env
# Google Gemini API
GOOGLE_API_KEY=your_actual_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

3. **သင့် API keys တွေ အစားထိုးပါ**:
   - Google AI Studio ကနေ API Key ယူပါ
   - Supabase Dashboard > Settings > API ကနေ URL နဲ့ Anon Key ယူပါ

4. **Save လုပ်ပါ**

5. Dev server က auto-reload လုပ်ပါလိမ့်မယ်

## ဘာကြောင့် လိုတာလဲ?

`.env.local` file က sensitive data (API keys) ပါလို့ Git မှာ မတင်ရပါဘူး။ ဒါပေမဲ့ Local development အတွက်တော့ လိုအပ်ပါတယ်။
