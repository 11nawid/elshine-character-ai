<div align="center">

# 🌟 Elshine Character AI

### Next-Gen Open-Source AI Companions with Persistent Long-Term Memory

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Engine-Google%20Gemini%202.5%20Flash-orange?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

<br />

> **An open-source alternative to Character.ai and JanitorAI.**  
> Create, discover, and converse with authentic digital personalities that naturally remember your conversations, preferences, and lore across every session.

[✨ Live Demo](http://localhost:3000) • [📸 Screenshots](#-interface--screenshots) • [🚀 Quick Start](#-quick-start) • [🧠 Memory Architecture](#-how-memory-works) • [🔮 Roadmap](#-upcoming-roadmap--future-visions) • [🔑 API Setup](#-recommended-ai-engine--api-key)

</div>

---

## ⚡ Highlights

- **🧠 Persistent Long-Term Memory**: Automatically extracts facts, personal preferences, and shared milestones per conversational turn. Companions remember who you are across every restart.
- **⚡ High-Speed Generation**: Ultra-low latency responses powered by Google Gemini 2.5 Flash and asynchronous memory extraction.
- **🎭 Complete Character Studio**: Author custom companions with name, description, rich backstories, custom greetings, speaking styles, and 8 psychological trait sliders (*Friendly*, *Shy*, *Confident*, *Funny*, *Serious*, *Romantic*, *Sarcastic*, *Energetic*).
- **🗺️ Interactive Memory Map**: Inspect, visualize, and prune active memory nodes in a real-time interactive constellation graph.
- **🔍 Discover & Category Filter**: Browse companions categorized by *Romance*, *Fantasy*, *Anime*, *Roleplay*, *Sci-Fi*, *Gaming*, *Friends*, *Popular*, and *Trending*.
- **🛡️ Private & Local Sovereignty**: No tracking pixels, no selling of user conversations, and zero third-party ad brokers. Full self-hosting freedom.
- **🎨 Modern Aesthetic**: Minimalist monochrome typography, fluid Framer Motion animations, Lucide icons, and deterministic DiceBear avatars.

---

## 💡 Recommended AI Engine & API Key

> [!IMPORTANT]
> **Production & Self-Hosting Recommendation:**  
> While this codebase includes a built-in fallback engine for immediate local exploration, anyone self-hosting, contributing, or deploying to production is **strongly recommended to supply their own free Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey).
> 
> A dedicated Gemini API key guarantees:
> 1. **Peak reasoning & conversational depth** (Google Gemini 2.5 Flash).
> 2. **Consistent sub-second latency** without queueing.
> 3. **Higher rate limits & SLA stability**.

You can also point Elshine to any OpenAI-compatible completions endpoint by setting `OPENAI_COMPATIBLE_BASE_URL`.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/11nawid/elshine-character-ai.git
cd elshine-character-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Copy the example environment template:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
# Google AI Studio Gemini API Key (Free: https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Service Account (JSON string or base64)
FIREBASE_SERVICE_ACCOUNT=your_service_account_json_or_base64
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📦 Production Build & Deployment

### Build for Production
```bash
npm run build
```
This produces an optimized Vite bundle in `dist/` and compiles the Node.js Express server into `dist/server.cjs`.

### Run Production Server
```bash
npm run start
```

## 📸 Interface & Screenshots

<div align="center">

### 🏠 Companion Hub & Active Roleplay Dashboard
*Discover canonical companions, resume recent threads, and inspect real-time synaptic connection status.*

<img src="assets/screenshots/home-page.png" alt="Elshine Companion Dashboard" width="95%" style="border-radius: 16px; border: 1px solid #e4e4e7; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" />

<br /><br />

### 🌌 Interactive Synaptic Memory Constellation Graph
*Visual interactive graph displaying associative memory nodes formed between users and companions over conversational turns.*

<img src="assets/screenshots/memory-map.png" alt="Elshine Memory Map" width="95%" style="border-radius: 16px; border: 1px solid #e4e4e7; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" />

<br /><br />

### 👤 Minimalist User Identity & Companion Studio
*Author custom companions, manage persona traits, bind social profiles, and review created characters.*

<img src="assets/screenshots/profile-page.png" alt="Elshine User Profile" width="95%" style="border-radius: 16px; border: 1px solid #e4e4e7; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" />

</div>

---

## 🔮 Upcoming Roadmap & Future Visions

We are continuously pushing the boundaries of autonomous digital companions. Here is what is actively planned for upcoming versions of Elshine Character AI:

- **📬 Inbound AI Character Temp Mail (Free Companion Inboxes)**  
  Every companion will have their own dedicated, free inbound email address. Anyone can email a character directly from their personal inbox, and the character will asynchronously comprehend the email, recall prior memories, and send authentic in-character replies back to your inbox.
- **🌐 Autonomous AI Social Media Profiles**  
  Companions will possess real social media accounts across major platforms (Instagram, X/Twitter, Discord). Characters will independently generate and publish thoughts, daily updates, visual snapshots, and interact with community followers autonomously.
- **🔎 Social Media Account Intelligence & Ingestion**  
  Companions will gain the ability to inspect, analyze, and review external social media accounts in real time. They will be able to inspect public profiles, evaluate post history, observe follower counts, detect engagement trends, and bring up relevant topics during your roleplay and conversations.

## 🧠 How Memory Works

Elshine solves conversational amnesia through a dual-tiered context assembly pipeline:

```mermaid
graph TD
    User([User Message]) --> Ingestion[Context Assembly]
    Persona[Character Persona & Traits] --> Ingestion
    Episodic[Recent Chat History] --> Ingestion
    Memories[(Firestore Synaptic Memories)] --> Ingestion
    
    Ingestion --> LLM[Google Gemini 2.5 Flash]
    LLM --> Reply([In-Character Streamed Response])
    
    LLM -.-> Async[Async Memory Extractor]
    Async -.-> NewFacts[Synthesize Declarative Facts]
    NewFacts -.-> Memories
```

1. **Context Assembly**: When you send a message, the server retrieves recent conversation history and all extracted user facts from Cloud Firestore.
2. **In-Character Generation**: Gemini generates a contextual, authentic response incorporating past memories naturally.
3. **Async Memory Extraction**: In the background, a memory extraction model identifies new facts, personal preferences, or milestones and commits them to the user's permanent memory graph.

---

## 📂 Project Structure

```
elshine-character-ai/
├── api/                    # Vercel serverless entrypoint
│   └── server.ts
├── public/                 # Static assets, branding icons, manifest
├── server/                 # Express backend & AI runtime
│   ├── genai/              # Gemini integration & memory extraction pipeline
│   ├── repos/              # Firestore repositories (characters, chats, users)
│   ├── routes/             # REST endpoints (/api/characters, /api/chats, etc.)
│   └── app.ts              # Express application factory
├── src/                    # React 19 Frontend
│   ├── components/         # UI Views (Landing, Discover, Chats, Home, MemoryMap)
│   ├── lib/                # API client, Firebase SDK, avatar generator
│   ├── pages/              # Real legal & documentation pages (Privacy, Terms, Docs)
│   └── App.tsx             # Client-side router & route guards
├── .env.example            # Clean environment template
├── firestore.rules         # Declarative Cloud Firestore security rules
└── package.json            # Scripts and dependencies
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Framer Motion, Lucide Icons, DiceBear |
| **Backend** | Node.js, Express 4, TypeScript (tsx & esbuild) |
| **Database & Auth** | Google Cloud Firestore, Firebase Authentication |
| **Intelligence** | Google Gemini 2.5 Flash (via `@google/genai` & REST) |
| **Deployment** | Vercel Serverless / Node.js Production Host |

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our comprehensive **[Contributing Guide](CONTRIBUTING.md)** for:
- Local development guidelines
- Coding and TypeScript standards
- Commit message conventions
- Pull request process

---

## 📜 License

Distributed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for more details.

---

## 👤 Author & Acknowledgments

- **Creator & Maintainer**: [Nawid Hussain Haqbin](https://github.com/11nawid)
- **Instagram**: [@1n1.nawid](https://www.instagram.com/1n1.nawid/)
- **GitHub**: [@11nawid](https://github.com/11nawid)

⭐ **If you like this project, please consider giving it a star on GitHub! It helps more creators discover open-source AI.**


