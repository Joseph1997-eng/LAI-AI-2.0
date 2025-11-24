# Database Setup Instructions

Joseph ရေ၊ Chat History အလုပ်လုပ်ဖို့ Supabase မှာ Database Tables တွေ Create လုပ်ဖို့ လိုပါတယ်။

## အဆင့်ဆင့် လုပ်ဆောင်ရန်:

### 1. Supabase Dashboard ကို ဖွင့်ပါ
- [supabase.com](https://supabase.com) သွားပြီး Sign in ဝင်ပါ
- မိမိ Project ကို ရွေးပါ

### 2. SQL Editor ကို သွားပါ
- ဘယ်ဘက် Sidebar မှာ **SQL Editor** ကို နှိပ်ပါ
- **New query** ကို နှိပ်ပါ

### 3. SQL Schema ကို Run ပါ
1. `web/supabase_schema.sql` ဖိုင်ကို ဖွင့်ပါ
2. အဲဒီဖိုင်ထဲက SQL code အားလုံးကို **Copy** ကူးပါ
3. SQL Editor မှာ **Paste** လုပ်ပါ
4. **Run** (သို့မဟုတ် Ctrl+Enter) နှိပ်ပါ

### 4. အောင်မြင်မှု စစ်ဆေးခြင်း
- **Table Editor** ကို သွားပါ
- `conversations` နဲ့ `messages` ဆိုတဲ့ Tables ၂ ခု ပေါ်လာရပါမယ်

## အခု ပြင်ထားတာတွေ:

✅ **System Prompt** - Gemini က Joseph's Assistant အဖြစ် စကားပြောပါလိမ့်မယ်
✅ **User Profile** - Sidebar မှာ User Email ပြပေးပါတယ်
✅ **Database Schema** - Chat History သိမ်းဖို့ Tables ဆောက်ထားပါတယ်

## နောက်ထပ် လုပ်စရာ:
- Supabase မှာ SQL Schema Run ပေးရပါမယ်
- Google/GitHub OAuth Setup လုပ်ရပါမယ် (Login အလုပ်လုပ်ဖို့)

အဆင်မပြေတာ ရှိရင် ပြန်မေးနိုင်ပါတယ်ခင်ဗျာ!
