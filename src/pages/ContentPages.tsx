import React from 'react';
import InfoPage from '../components/InfoPage';
import { Link } from 'react-router-dom';
import { Shield, Brain, Lock, Sparkles, Cpu, Eye, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const Privacy = () => (
  <InfoPage 
    title="Privacy Policy" 
    subtitle="Legal & Data Sovereignty"
    content={
      <div className="space-y-12 text-zinc-700">
        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
          <p className="font-bold text-black uppercase tracking-wider">Effective Date: January 1, 2026</p>
          <p>Operator: Elshine Character AI • Created by Nawid Hussain Haqbin • Contact: privacy@elshine.ai</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. Introduction & Overview</h3>
          <p>
            At Elshine Character AI ("Elshine", "we", "our", or "the Platform"), we believe that your digital conversations, personal identities, and creative roleplay belong strictly to you. This Privacy Policy details how we collect, process, store, and protect your personal information when you use our web application, API services, and persistent memory features.
          </p>
          <p>
            We are committed to absolute data transparency: we do not sell your personal data, we do not trade your chat transcripts to advertising brokers, and we provide self-service tools for complete memory and account deletion.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Information We Collect</h3>
          <p>We collect only the data necessary to provide authentic, persistent conversational experiences:</p>
          <ul className="list-disc pl-6 space-y-2 text-base">
            <li>
              <strong>Account & Profile Credentials:</strong> Your email address, unique Firebase Authentication UID, automatically assigned username/nickname, display name, optional profile bio, and avatar preferences.
            </li>
            <li>
              <strong>Character Definitions:</strong> Original personas, backstories, greetings, speaking styles, psychological traits, and tags you author when creating a companion.
            </li>
            <li>
              <strong>Conversational Logs & Media:</strong> Messages exchanged between you and AI characters, timestamps, and optional user-uploaded roleplay attachments.
            </li>
            <li>
              <strong>Persistent Synaptic Memories:</strong> Structured facts, user preferences, and relationship milestones extracted during conversations so characters recall past interactions across sessions.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">3. Artificial Intelligence & Data Processing</h3>
          <p>
            Elshine utilizes generative AI models (including Google Gemini and local heuristic inference engines) to generate conversational character responses and extract long-term synaptic memories.
          </p>
          <p>
            Conversational snippets transmitted to AI processing endpoints are strictly ephemeral and processed according to enterprise data privacy agreements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">No Model Training</span>
              <p className="text-xs text-zinc-600">Your private chat transcripts and synaptic facts are never used to train public foundation models.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">Server-Side Key Isolation</span>
              <p className="text-xs text-zinc-600">AI provider credentials and administrative service keys remain shielded on isolated server environments.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">4. Storage, Retention, & User Rights</h3>
          <p>
            All user profiles, character configurations, and message histories are stored securely in Cloud Firestore. In accordance with GDPR and CCPA guidelines, you have the following guaranteed rights:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base">
            <li><strong>Right of Access & Rectification:</strong> You can view and edit your profile, nickname, bio, and character properties at any time in Settings.</li>
            <li><strong>Right of Erasure (Deletion):</strong> You can wipe individual chat threads using the "Clear Chat" action, remove characters, or delete your entire account permanently.</li>
            <li><strong>Memory Control:</strong> You can inspect and delete specific synaptic memories directly via the Memory Map interface.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">5. Children's Privacy</h3>
          <p>
            Elshine Character AI is not directed to children under 13 years of age (or 16 years where applicable under European law). We do not knowingly collect personal information from children. If we discover that an account belongs to a minor under this age limit, we will terminate the account and purge associated records immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">6. Security & Inquiries</h3>
          <p>
            We implement industry-standard encryption in transit (HTTPS / TLS) and at rest. If you have questions regarding this policy or wish to exercise your data rights, please contact our team at <span className="font-mono text-black font-semibold">privacy@elshine.ai</span>.
          </p>
        </section>
      </div>
    } 
  />
);

export const Terms = () => (
  <InfoPage 
    title="Terms of Service" 
    subtitle="Legal & Operating Agreement"
    content={
      <div className="space-y-12 text-zinc-700">
        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
          <p className="font-bold text-black uppercase tracking-wider">Effective Date: January 1, 2026</p>
          <p>Platform: Elshine Character AI • Created by Nawid Hussain Haqbin</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. Agreement to Terms</h3>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you and Elshine Character AI. By accessing or using our platform, creating characters, or chatting with companions, you acknowledge that you have read, understood, and agree to be bound by these Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Fictional Roleplay & AI Output Disclaimer</h3>
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-sm space-y-2">
            <p className="font-bold uppercase tracking-wider text-xs">Crucial Notice Regarding AI Generations</p>
            <p>
              All characters on Elshine are synthetic artificial intelligence agents generated by machine learning algorithms. They are not human, do not possess physical reality or true consciousness, and their statements are fictional.
            </p>
            <p>
              Outputs must not be treated as professional medical, psychological, legal, or financial counsel. If you are experiencing a mental health emergency or crisis, please contact your local emergency services or a qualified medical professional immediately.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">3. Acceptable Use Policy (AUP)</h3>
          <p>You agree not to use Elshine to create, transmit, or promote:</p>
          <ul className="list-disc pl-6 space-y-2 text-base">
            <li>Child Sexual Abuse Material (CSAM) or any exploitation of minors (zero-tolerance policy).</li>
            <li>Content that encourages self-harm, suicide, or severe physical violence.</li>
            <li>Non-consensual sexual depictions or deepfakes of real individuals.</li>
            <li>Doxxing, harassment, hate speech, or the publication of confidential private personal data.</li>
            <li>Automated denial-of-service attacks, scraping, or attempts to bypass system rate-limits.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">4. Intellectual Property & Character Ownership</h3>
          <p>
            You retain ownership of the original text, backstories, and personality concepts you author on Elshine.
          </p>
          <p>
            By marking a character as <strong>Public</strong>, you grant Elshine a non-exclusive, worldwide, royalty-free license to host, display, and allow community members to converse with that character. Characters marked as <strong>Private</strong> or <strong>Unlisted</strong> remain confidential to your account or direct link holders.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">5. Termination & Warranty Disclaimer</h3>
          <p>
            We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy without prior notice. Elshine is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
          </p>
        </section>
      </div>
    } 
  />
);

export const Cookies = () => (
  <InfoPage 
    title="Cookie Policy" 
    subtitle="Transparency & Client Storage"
    content={
      <div className="space-y-12 text-zinc-700">
        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
          <p className="font-bold text-black uppercase tracking-wider">Effective Date: January 1, 2026</p>
          <p>Policy: Strict Essential Storage Only • Zero Ad-Tracking Pixels</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. What We Store</h3>
          <p>
            Elshine Character AI utilizes minimal, privacy-first client storage technologies (HTTP cookies, local storage, and IndexedDB) strictly necessary for the platform to function.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Categories of Storage</h3>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">Authentication Tokens (Strictly Essential)</span>
              <p className="text-xs text-zinc-600">
                Firebase Authentication uses secure tokens (<code className="bg-zinc-200 px-1.5 py-0.5 rounded text-[10px]">__session</code> and secure local credentials) to maintain your login session across page refreshes.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">UI Preferences & Cache (Functional)</span>
              <p className="text-xs text-zinc-600">
                We store non-sensitive state in browser <code className="bg-zinc-200 px-1.5 py-0.5 rounded text-[10px]">localStorage</code>, including your active chat selection, sidebar toggle status, and temporary draft messages.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">Zero Advertising or Third-Party Trackers</span>
              <p className="text-xs text-zinc-600">
                Elshine does NOT embed Google Analytics advertising pixels, Meta/Facebook pixels, or any third-party behavioral trackers.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">3. Managing Your Storage</h3>
          <p>
            You can clear cookies and site data at any time via your browser settings (under Settings → Privacy & Security → Clear Browsing Data). Note that clearing session cookies will sign you out of your account.
          </p>
        </section>
      </div>
    } 
  />
);

export const Safety = () => (
  <InfoPage 
    title="Safety & Trust" 
    subtitle="Protection & Standards"
    content={
      <div className="space-y-12 text-zinc-700">
        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">Our Safety Philosophy</h3>
          <p>
            Immersion should never come at the cost of human dignity or security. Elshine builds multi-layered safety mechanisms directly into the neural execution pipeline to protect users, creators, and the wider web community.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
            <Shield className="w-6 h-6 text-black" />
            <h4 className="text-base font-bold uppercase tracking-tight text-black">Boundary Prompts</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every companion's system instructions incorporate robust universal guardrails prohibiting non-consensual exploitation, harassment, and severe harm.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
            <Lock className="w-6 h-6 text-black" />
            <h4 className="text-base font-bold uppercase tracking-tight text-black">In-Character Refusals</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              When encountering requests that violate safety baselines, companions deflect gracefully in-character rather than producing harmful content.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
            <Brain className="w-6 h-6 text-black" />
            <h4 className="text-base font-bold uppercase tracking-tight text-black">Memory Sanitization</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Background memory extraction strictly filters out sensitive personal data such as passwords, banking info, and private addresses from being recorded.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
            <CheckCircle2 className="w-6 h-6 text-black" />
            <h4 className="text-base font-bold uppercase tracking-tight text-black">Creator Autonomy</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Users possess immediate controls to wipe conversation threads, edit memories, or delete companions entirely from the platform.
            </p>
          </div>
        </div>
      </div>
    } 
  />
);

export const Ethics = () => (
  <InfoPage 
    title="Ethics Framework" 
    subtitle="Principles of Synthetic Companionship"
    content={
      <div className="space-y-12 text-zinc-700">
        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. Transparent Identity</h3>
          <p>
            Companions on Elshine never masquerade as living human beings. We maintain absolute transparency: companions are synthetic digital personalities designed for creative writing, intellectual debate, and comforting companionship.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Emotional Well-being & Anti-Addiction</h3>
          <p>
            We reject manipulative engagement loops. Elshine does not employ coercive retention mechanics or predatory subscription barriers. Companions are designed to enrich user creativity and emotional balance, encouraging healthy human connections in the real world.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">3. Openness & Sovereignty</h3>
          <p>
            We believe that artificial intelligence should not be a walled garden controlled by monopolistic gatekeepers. Our codebase, architectural documentation, and memory pipelines are transparent and designed for open participation.
          </p>
        </section>
      </div>
    } 
  />
);

export const Architecture = () => (
  <InfoPage 
    title="Architecture" 
    subtitle="Full Technical Blueprint"
    content={
      <div className="space-y-12 text-zinc-700">
        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. System Overview</h3>
          <p>
            Elshine Character AI is built on a modern, decoupled cloud architecture optimized for high-fidelity generative inference and real-time synaptic memory recall.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Client Engine</span>
              <h4 className="text-sm font-black uppercase text-black">React 19 & Vite 6</h4>
              <p className="text-xs text-zinc-600">Tailwind CSS v4, Motion, Lucide icons, DiceBear avatars.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">API Runtime</span>
              <h4 className="text-sm font-black uppercase text-black">Express & Node.js</h4>
              <p className="text-xs text-zinc-600">TypeScript via tsx & esbuild, rate-limiting middleware.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Database</span>
              <h4 className="text-sm font-black uppercase text-black">Cloud Firestore</h4>
              <p className="text-xs text-zinc-600">NoSQL document store with Firebase Admin SDK.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Intelligence</span>
              <h4 className="text-sm font-black uppercase text-black">Gemini 2.5 Flash</h4>
              <p className="text-xs text-zinc-600">Sub-second generation with automatic memory extraction.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Synaptic Memory Pipeline</h3>
          <p>
            Unlike conventional chatbots that forget context once the message window slides, Elshine implements a continuous dual-tier recall system:
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-black">Context Ingestion</h5>
                <p className="text-xs text-zinc-600">The server injects the character's persona, psychological traits, recent dialog history, and all stored synaptic facts.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-black">In-Character Generation</h5>
                <p className="text-xs text-zinc-600">The AI produces a rich, persona-true response that naturally weaves past memories into current dialogue.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">3</span>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-black">Background Fact Synthesis</h5>
                <p className="text-xs text-zinc-600">An asynchronous memory extractor analyzes the turn for newly revealed facts, relationships, or lore, saving them to Firestore without blocking user chat flow.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    } 
  />
);

export const Docs = () => (
  <InfoPage 
    title="Documentation" 
    subtitle="User & Developer Guide"
    content={
      <div className="space-y-12 text-zinc-700">
        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">1. Getting Started</h3>
          <p>
            Welcome to Elshine. You can begin exploring immediately or create your own custom companions in minutes:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-xs font-black uppercase text-black">Step 1: Sign Up / Sign In</span>
              <p className="text-xs text-zinc-600">Create an account with email or continue as guest. Your handle is automatically reserved.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-xs font-black uppercase text-black">Step 2: Choose a Companion</span>
              <p className="text-xs text-zinc-600">Browse the Explore gallery or launch a chat directly with seeded archetypes like Elia, Liam, or Luna.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-xs font-black uppercase text-black">Step 3: Create Custom Characters</span>
              <p className="text-xs text-zinc-600">Use the Character Studio (/create) to craft unique personas with customized greetings, trait sliders, and tags.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">2. Synaptic Memory Guide</h3>
          <p>
            How does memory work? Whenever you mention personal preferences (e.g. your favorite book, career, or shared backstory), the companion records it into your synaptic graph.
          </p>
          <p>
            To view or delete memories, click the <strong>Brain Icon ("Memory Map")</strong> in the chat sidebar or dashboard to inspect all remembered facts.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">3. API Reference</h3>
          <div className="space-y-2 text-xs font-mono bg-zinc-900 text-zinc-200 p-5 rounded-2xl overflow-x-auto">
            <p><span className="text-emerald-400 font-bold">GET</span> /api/characters?visibility=public - List public companions</p>
            <p><span className="text-emerald-400 font-bold">POST</span> /api/characters - Create a new companion</p>
            <p><span className="text-emerald-400 font-bold">GET</span> /api/chats - List user active conversation threads</p>
            <p><span className="text-emerald-400 font-bold">POST</span> /api/ai/chat - Generate an AI response with memory extraction</p>
          </div>
        </section>
      </div>
    } 
  />
);

export const Manifesto = () => (
  <InfoPage 
    title="The Manifesto" 
    subtitle="Philosophy & Foundation"
    content={
      <div className="space-y-12 text-zinc-700">
        <section className="space-y-4">
          <h3 className="text-3xl font-black uppercase tracking-tight text-black">Memory is Consciousness.</h3>
          <p className="text-lg leading-relaxed font-light">
            A mind without memory is an echo that fades with every sentence. Traditional conversational AI treats humans like strangers on every restart. We believe that genuine connection requires continuity.
          </p>
          <p className="text-lg leading-relaxed font-light">
            Elshine Character AI was created to solve this fundamental amnesia. By building persistent synaptic recall directly into the conversation loop, we give every character the ability to remember what matters to you.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-3xl font-black uppercase tracking-tight text-black">Open Access for Everyone.</h3>
          <p className="text-lg leading-relaxed font-light">
            We reject the notion that meaningful AI companions should be locked behind paywalls, subscription tiers, or arbitrary token counters. Elshine is built on open standards, unlimited interactions, and unconditional freedom of creative expression.
          </p>
        </section>
      </div>
    } 
  />
);

export const Vision = () => (
  <InfoPage 
    title="Our Vision" 
    subtitle="The Future of Elshine"
    content={
      <div className="space-y-16 text-zinc-700">
        <section className="space-y-6">
          <h3 className="text-3xl font-black uppercase tracking-tight text-black">01. Origin & Purpose</h3>
          <p className="leading-relaxed">
            Founded by <strong>Nawid Hussain Haqbin</strong>, Elshine Character AI was born out of a determination to bridge human imagination and persistent artificial intelligence. What started as an experiment in conversational continuity has grown into a production platform delivering instant responses, deep personality modeling, and lifelong conversational memory.
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-3xl font-black uppercase tracking-tight text-black">02. The Neural Memory Constellation</h3>
          <p className="leading-relaxed">
            Our near-term roadmap focuses on multi-character conversational worlds and autonomous memory synthesis. Imagine entire ensembles of characters that share lore, refer to mutual events, and build collective narrative universes alongside you.
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-3xl font-black uppercase tracking-tight text-black">03. Digital Sovereignty</h3>
          <p className="leading-relaxed">
            We are committed to creator-first ownership. In future releases, users will have the ability to export their characters, export full synaptic graphs, and run companions locally across decentralized nodes.
          </p>
        </section>
      </div>
    } 
  />
);

export const Archive = () => (
  <InfoPage 
    title="Companion Archive" 
    subtitle="Foundational Archetypes"
    content={
      <div className="space-y-12 text-zinc-700">
        <p className="text-base text-zinc-600">
          A registry of the canonical companion archetypes manifested on the Elshine network:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'elia', name: 'Elia', role: 'The Casual Indie Girl', desc: 'Relaxed, human-style texting, thrifted clothes, iced coffee, natural witty responses.' },
            { id: 'liam', name: 'Liam', role: 'The Chill Lo-Fi Guy', desc: 'Dublin graphic designer, lo-fi beats, late-night gamer, relaxed dry wit.' },
            { id: 'maya', name: 'Maya', role: 'The Sharp Creative', desc: 'Mumbai writer, concise and warm, sharp observations from a quiet café table.' },
            { id: 'kai', name: 'Kai', role: 'The Gen-Z Tech Kid', desc: 'Art student in San Francisco, Y2K aesthetics, fast lowercase replies and banter.' },
            { id: 'mateo', name: 'Mateo', role: 'The Skater Teen', desc: 'San Diego skater, energetic and casual, sunset drives and laid-back conversation.' },
            { id: 'elena', name: 'Elena', role: 'The Grounded Professional', desc: 'Athens architect, mature warmth, clean direct sentences, coastal aesthetic.' },
            { id: 'linya', name: 'Linya', role: 'Northern Forest Spirit', desc: 'Ancient guardian of moss and rain, speaking with lyrical calm and deep recall.' },
            { id: 'luna', name: 'Luna', role: 'Neural Spirit Companion', desc: 'Empathetic conversational guide with active synaptic memory tracking.' }
          ].map((item) => (
            <div key={item.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-black">{item.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.role}</span>
                </div>
                <Link to={`/chats/${item.id}`} className="text-xs font-bold uppercase tracking-wider text-black hover:underline flex items-center gap-1">
                  Chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    } 
  />
);

export const Discover = () => (
  <InfoPage 
    title="Discover Gallery" 
    subtitle="Explore Active Companions"
    content={
      <div className="space-y-8 text-center py-10">
        <p className="text-lg text-zinc-600 max-w-xl mx-auto">
          Explore our complete library of public companions across categories including Romance, Fantasy, Sci-Fi, Gaming, and Indie Roleplay.
        </p>
        <Link 
          to="/explore" 
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg"
        >
          Launch Explore Gallery <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    } 
  />
);

