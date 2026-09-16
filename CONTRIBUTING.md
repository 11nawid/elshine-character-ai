# Contributing to Elshine Character AI 🌟

First off, thank you for considering contributing to **Elshine Character AI**! It is people like you who make open-source AI companions, persistent conversational memory, and roleplay accessible to everyone.

Please take a moment to review this document to make your contribution process smooth, enjoyable, and impactful.

---

## 🧭 Code of Conduct

We are dedicated to providing a welcoming, inclusive, and harassment-free environment for everyone, regardless of background, identity, or experience level. Be respectful, constructive, and open to feedback.

---

## 🚀 How Can You Contribute?

You can contribute to Elshine in many ways:
- 🐛 **Report Bugs**: Find something broken? Submit a detailed GitHub Issue with reproduction steps and browser logs.
- 💡 **Suggest Features**: Propose new features, memory mechanics, or companion personalities.
- 🎨 **Improve the UI/UX**: Help refine animations, layout spacing, responsive screens, and theme styling.
- 🧠 **Enhance Memory Pipeline**: Improve turn-by-turn declarative fact extraction, vector indexing, or associative memory graphs.
- 📬 **Build Roadmap Features**: Contribute to our planned autonomous social media integrations or companion temp mail inboxes!
- 📖 **Improve Documentation**: Fix typos, add examples, or write guides for self-hosters.

---

## 🛠️ Local Development Setup

### 1. Fork & Clone
Fork the repository on GitHub, then clone your fork locally:
```bash
git clone https://github.com/<your-username>/elshine-character-ai.git
cd elshine-character-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```

Configure your credentials:
- **GEMINI_API_KEY**: Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
- **FIREBASE_SERVICE_ACCOUNT**: Place your Firebase service account JSON in `private-keys/` or supply it via the environment variable.

### 4. Run Development Server
```bash
npm run dev
```
Visit **http://localhost:3000** in your browser.

### 5. Build and Verify
Before pushing your changes, always ensure the project compiles with zero TypeScript or build errors:
```bash
npm run build
```

---

## 📐 Project Architecture

- **`src/components/`**: Core React 19 UI components:
  - `Chats.tsx`: Real-time dual-pane conversational roleplay interface.
  - `MemoryMap.tsx` & `UnifiedMemoryMap.tsx`: 2D/3D physics-based associative memory constellation graphs.
  - `Create.tsx`: Character Studio with 8 psychological trait sliders and custom greetings.
  - `Discover.tsx`: Companion search, tags, and category exploration.
  - `Profile.tsx`: User overview, neural persona blueprint, and creator statistics.
- **`server/`**: Express backend & AI runtime:
  - `server/genai/client.ts`: Gemini 2.5 Flash integration with fallback engine.
  - `server/repos/`: Cloud Firestore data access layers (characters, chats, messages, memories).
  - `server/routes/`: REST API endpoints.

---

## 📝 Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new user-facing feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, white-space)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build process or auxiliary tool changes

---

## 🔍 Pull Request Checklist

Before submitting your PR, please verify:
- [ ] Code compiles cleanly with `npm run build`.
- [ ] No personal API keys, private keys, or `.env` files are tracked in Git.
- [ ] Code follows existing TypeScript conventions and file formatting.
- [ ] PR description clearly explains the motivation, changes made, and steps to test.
- [ ] Commits are clear, atomic, and descriptive.

---

## 🛡️ Security Vulnerabilities

If you discover a security vulnerability, please do **not** open a public issue. Instead, report it directly to the maintainer at **nawid.haqbin4@gmail.com** so it can be addressed promptly.

Thank you for helping make Elshine Character AI the #1 open-source conversational intelligence platform! 🌟
