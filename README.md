# LAI AI 2.0 🤖

![LAI AI Banner](public/joseph.jpg)

**LAI AI 2.0** is a modern, culturally-aware AI chatbot designed specifically for the **Lai Hakha-speaking community**. Built with the latest web technologies and powered by **Google Gemini**, it bridges the gap between advanced AI and local culture, providing a seamless bilingual experience.

> *"Hmailei AI biaruahnak sining cu a tu ah rak hman ve."* (Experience the future of AI conversation now.)

## ✨ Key Features

- **🗣️ Bilingual Support**: Full support for **English** and **Lai Hakha** languages, including UI translations and AI responses.
- **🧠 Advanced AI**: Powered by **Google Gemini Pro** and **Gemini Pro Vision** for intelligent text and image analysis.
- **👁️ Vision Capabilities**: Upload images and ask questions about them in Lai Hakha or English.
- **🎨 Modern UI/UX**:
  - Glassmorphism design with smooth animations.
  - Responsive Sidebar with dynamic layout adjustments.
  - Dark/Light mode support with auto-detection.
  - "Thinking" animations for a natural conversational feel.
- **⚡ Real-time Streaming**: Fast, streaming responses for a fluid chat experience.
- **📂 File Management**: Drag-and-drop file uploads with preview.
- **🔐 Secure Authentication**: Integrated with **Supabase Auth** for secure user management.
- **🗄️ Chat History**: Automatically saves conversations to Supabase database.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project
- A Google Cloud project with Gemini API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Joseph1997-eng/LAI-AI-2.0.git
   cd LAI-AI-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ♡ for the Lai community by Joseph (Leoliver)**
