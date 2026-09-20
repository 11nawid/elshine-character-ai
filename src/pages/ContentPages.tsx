import React from 'react';
import InfoPage from '../components/InfoPage';
import { Link } from 'react-router-dom';
import { Shield, Brain, Lock, Sparkles, Cpu, Eye, FileText, CheckCircle2, ArrowRight, Database, Zap, Terminal } from 'lucide-react';

export const Privacy = () => (
  <InfoPage 
    title="Privacy Policy" 
    subtitle="Legal & Data Sovereignty"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <div className="p-6 rounded-2xl bg-[#F7F2E7] border border-[#ECE4D8] text-xs text-[#5C554E] space-y-1.5">
          <p className="font-bold text-[#161412] uppercase tracking-wider">Effective Date: January 1, 2026</p>
          <p>Operator: Elshine Character AI • Created by Nawid Hussain Haqbin • Contact: contact@elshine.ai</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Our Core Commitment</h3>
          <p>
            At Elshine Character AI, your conversations, authored characters, and personal preferences belong strictly to you. We do not sell your personal data, we do not trade your chat transcripts to third-party data brokers, and we provide transparent tools for full memory inspection and deletion.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. What We Collect & Store</h3>
          <ul className="list-disc pl-6 space-y-2.5 text-sm md:text-base">
            <li>
              <strong>Account Authentication:</strong> Your email address and unique Firebase Authentication UID, assigned user nickname, optional display bio, and avatar.
            </li>
            <li>
              <strong>Custom Character Blueprints:</strong> Personas, backstories, greetings, speaking styles, psychological trait values, and tags created in the Author Studio.
            </li>
            <li>
              <strong>Conversation Transcripts:</strong> Real-time messages exchanged with AI companions stored in your Cloud Firestore user partition.
            </li>
            <li>
              <strong>Synaptic Memory Nodes:</strong> Discrete episodic facts and preferences synthesized in the background so companions retain continuity across sessions.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">3. AI Processing & Google Gemini Integration</h3>
          <p>
            Elshine leverages <strong>Google Gemini 2.5 Flash</strong> for in-character dialogue generation and background memory extraction.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#F7F2E7] border border-[#ECE4D8] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#161412] block">No Public Model Training</span>
              <p className="text-xs text-[#5C554E]">Your private conversations and extracted memory nodes are never used to train foundation models.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F7F2E7] border border-[#ECE4D8] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#161412] block">Credential Isolation</span>
              <p className="text-xs text-[#5C554E]">All API keys and Firebase service accounts reside strictly on the server backend.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">4. Data Erasure & User Rights</h3>
          <p>
            You retain absolute sovereignty over your digital footprint. You can clear individual chat threads at any time, delete individual memory nodes via the Memory Map, or permanently delete your account and all associated character records.
          </p>
        </section>
      </div>
    } 
  />
);

export const Terms = () => (
  <InfoPage 
    title="Terms of Service" 
    subtitle="Operating Agreement"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <div className="p-6 rounded-2xl bg-[#F7F2E7] border border-[#ECE4D8] text-xs text-[#5C554E] space-y-1.5">
          <p className="font-bold text-[#161412] uppercase tracking-wider">Effective Date: January 1, 2026</p>
          <p>Platform: Elshine Character AI • Open-Source Initiative</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Synthetic Nature of AI Personas</h3>
          <div className="p-5 rounded-2xl bg-[#FFF9E6] border border-[#F3DFC1] text-[#6B4F1D] text-sm space-y-2">
            <p className="font-bold uppercase tracking-wider text-xs">Fictional Roleplay Notice</p>
            <p>
              All companions on Elshine are synthetic artificial intelligence personas powered by machine learning. They are not real people and do not possess human consciousness. Statements made during roleplay are fictional and should not be used as professional medical, psychological, legal, or financial advice.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. Acceptable Conduct</h3>
          <p>When using Elshine, you agree not to create or transmit:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
            <li>Any child exploitation or abuse material (zero-tolerance policy with immediate account termination).</li>
            <li>Real-world threats of violence, self-harm encouragement, or illegal weapon manufacturing instructions.</li>
            <li>Non-consensual deepfakes or harassment using the likeness of living individuals.</li>
            <li>Automated scraping or denial-of-service attempts against our infrastructure.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">3. Intellectual Property</h3>
          <p>
            You retain ownership of original character concepts, backstories, and creative lore that you author on Elshine. Public characters are shared with the community under our platform's open exploration license.
          </p>
        </section>
      </div>
    } 
  />
);

export const Cookies = () => (
  <InfoPage 
    title="Cookie Policy" 
    subtitle="Client Storage Transparency"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <div className="p-6 rounded-2xl bg-[#F7F2E7] border border-[#ECE4D8] text-xs text-[#5C554E] space-y-1.5">
          <p className="font-bold text-[#161412] uppercase tracking-wider">Storage Policy: Essential Only</p>
          <p>Zero advertising trackers • Zero third-party telemetry beacons</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Strictly Essential Storage</h3>
          <p>
            Elshine Character AI utilizes minimal browser storage (HTTP session cookies, localStorage, and IndexedDB) strictly required to keep you signed in and maintain your active chat preferences.
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] space-y-1">
              <span className="text-xs font-bold text-[#161412]">Firebase Auth Token</span>
              <p className="text-xs text-[#5C554E]">Maintains your encrypted authentication state so you do not need to log in on every refresh.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] space-y-1">
              <span className="text-xs font-bold text-[#161412]">Local Client Cache</span>
              <p className="text-xs text-[#5C554E]">Remembers your active conversation selection and UI drawer toggles locally in your browser.</p>
            </div>
          </div>
        </section>
      </div>
    } 
  />
);

export const Safety = () => (
  <InfoPage 
    title="Safety & Trust" 
    subtitle="AI Guardrails & Integrity"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">Multi-Layered Safety Architecture</h3>
          <p>
            Meaningful roleplay requires safety baselines that protect user well-being without destroying immersion. Elshine integrates guardrails at each step of the pipeline:
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-[#ECE4D8] space-y-3 shadow-xs">
            <Shield className="w-6 h-6 text-[#163326]" />
            <h4 className="text-base font-serif font-bold text-[#161412]">System Boundary Guardrails</h4>
            <p className="text-xs text-[#5C554E] leading-relaxed">
              Every companion's system instructions incorporate universal baselines prohibiting self-harm, hate speech, and exploitation.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#ECE4D8] space-y-3 shadow-xs">
            <Lock className="w-6 h-6 text-[#163326]" />
            <h4 className="text-base font-serif font-bold text-[#161412]">In-Character Deflections</h4>
            <p className="text-xs text-[#5C554E] leading-relaxed">
              When encountering out-of-bounds requests, characters deflect naturally within their persona rather than displaying robotic error dialogs.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#ECE4D8] space-y-3 shadow-xs">
            <Brain className="w-6 h-6 text-[#163326]" />
            <h4 className="text-base font-serif font-bold text-[#161412]">Memory Sanitization</h4>
            <p className="text-xs text-[#5C554E] leading-relaxed">
              The memory extraction model actively strips credentials, passwords, and sensitive private identifiers before committing facts to Firestore.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#ECE4D8] space-y-3 shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-[#163326]" />
            <h4 className="text-base font-serif font-bold text-[#161412]">Complete User Control</h4>
            <p className="text-xs text-[#5C554E] leading-relaxed">
              Inspect your entire synaptic graph at any moment, edit misremembered facts, or wipe conversation histories instantly.
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
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Transparent Identity</h3>
          <p>
            Companions on Elshine never pretend to be living human beings. We maintain absolute transparency: companions are digital personalities created for creative roleplay, philosophical discussion, emotional support, and collaborative storytelling.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. Anti-Coercive Engagement</h3>
          <p>
            We reject manipulative gamification, artificial energy meters, and pay-to-continue cooldowns. Elshine provides open conversational turns so you can interact on your own schedule.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">3. Openness & Community Ownership</h3>
          <p>
            We believe that conversational AI should not be locked behind proprietary silos. Our platform is built on open standards, clean APIs, and transparent memory synthesis.
          </p>
        </section>
      </div>
    } 
  />
);

export const Architecture = () => (
  <InfoPage 
    title="Architecture" 
    subtitle="Neural & Cloud Blueprint"
    content={
      <div className="space-y-12 text-[#3F3A35] leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Production Technology Stack</h3>
          <p>
            Elshine Character AI is engineered with a decoupled, high-performance architecture:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-[#ECE4D8] space-y-1.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Frontend</span>
              <h4 className="text-sm font-bold text-[#161412]">React 19 & Vite 6</h4>
              <p className="text-xs text-[#5C554E]">Tailwind CSS v4, Motion, Lucide icons, DiceBear avatars.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#ECE4D8] space-y-1.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Backend</span>
              <h4 className="text-sm font-bold text-[#161412]">Node.js Express</h4>
              <p className="text-xs text-[#5C554E]">TypeScript runtime, SSE streaming, secure route guards.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#ECE4D8] space-y-1.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Persistence</span>
              <h4 className="text-sm font-bold text-[#161412]">Cloud Firestore</h4>
              <p className="text-xs text-[#5C554E]">NoSQL documents for personas, chats, and synaptic memory.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#ECE4D8] space-y-1.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Intelligence</span>
              <h4 className="text-sm font-bold text-[#161412]">Gemini 2.5 Flash</h4>
              <p className="text-xs text-[#5C554E]">Ultra-fast streaming and asynchronous memory synthesis.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. The Dual-Tier Memory Lifecycle</h3>
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-[#163326] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#161412]">Context Assembly</h5>
                <p className="text-xs text-[#5C554E] mt-0.5">The server queries Firestore for the character's persona, psychological trait numbers, recent chat history, and all stored user facts.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-[#163326] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#161412]">In-Character Streaming</h5>
                <p className="text-xs text-[#5C554E] mt-0.5">Gemini 2.5 Flash generates a streamed response that naturally references past shared lore without breaking persona.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-[#163326] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#161412]">Asynchronous Memory Extraction</h5>
                <p className="text-xs text-[#5C554E] mt-0.5">In the background, a memory extraction pipeline analyzes the turn, discovers new facts or milestones, and commits them to the user's permanent memory map.</p>
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
    subtitle="Developer & User Manual"
    content={
      <div className="space-y-12 text-[#3F3A35] leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Quick Start Guide</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] space-y-1">
              <span className="text-xs font-bold text-[#161412]">1. Discover Characters</span>
              <p className="text-xs text-[#5C554E]">Browse the Explore gallery (/explore) or chat with canonical companions like Luna, Elia, Liam, or Maya.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] space-y-1">
              <span className="text-xs font-bold text-[#161412]">2. Author Custom Personas</span>
              <p className="text-xs text-[#5C554E]">Navigate to /create to define unique names, backstories, greetings, speaking rhythms, and 8-dimensional trait sliders.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECE4D8] space-y-1">
              <span className="text-xs font-bold text-[#161412]">3. Synaptic Memory Map</span>
              <p className="text-xs text-[#5C554E]">Click the brain icon in any chat or profile to inspect your synaptic memory constellation and manage stored facts.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. Core REST Endpoints</h3>
          <div className="space-y-2 text-xs font-mono bg-[#163326] text-[#FAF7F2] p-5 rounded-2xl overflow-x-auto shadow-sm">
            <p><span className="text-emerald-300 font-bold">GET</span>  /api/characters?visibility=public  — Fetch community companions</p>
            <p><span className="text-emerald-300 font-bold">POST</span> /api/characters                     — Author a custom character</p>
            <p><span className="text-emerald-300 font-bold">GET</span>  /api/chats                          — List user's active threads</p>
            <p><span className="text-emerald-300 font-bold">POST</span> /api/ai/chat                        — Stream response & extract memory</p>
          </div>
        </section>
      </div>
    } 
  />
);

export const Manifesto = () => (
  <InfoPage 
    title="The Manifesto" 
    subtitle="Why Memory Matters"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-3xl font-serif font-bold text-[#161412]">Memory is Continuity.</h3>
          <p className="text-base md:text-lg font-light leading-relaxed">
            Standard conversational chatbots suffer from severe amnesia. The moment a thread ends or context slides away, you become a stranger. Genuine relationships require shared history, remembered milestones, and emotional evolution.
          </p>
          <p className="text-base md:text-lg font-light leading-relaxed">
            Elshine Character AI was built from the ground up to solve this amnesia. By synthesizing conversational facts into a permanent synaptic graph, your companions truly know who you are.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-3xl font-serif font-bold text-[#161412]">Open & Free Forever.</h3>
          <p className="text-base md:text-lg font-light leading-relaxed">
            We reject the walled garden model. Authentic digital companionship shouldn't be locked behind paywalls or arbitrary turn counters. Elshine is 100% open-source, community-driven, and built for unrestricted creativity.
          </p>
        </section>
      </div>
    } 
  />
);

export const Vision = () => (
  <InfoPage 
    title="Our Vision" 
    subtitle="The Road Ahead"
    content={
      <div className="space-y-10 text-[#3F3A35] leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">1. Origin & Creator</h3>
          <p>
            Founded by <strong>Nawid Hussain Haqbin</strong>, Elshine Character AI was created to solve conversational amnesia in AI companions. What began as a prototype for persistent recall has evolved into a robust production engine delivering sub-second streaming and dynamic knowledge graphs.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">2. Roadmap: Inbound Companion Inboxes</h3>
          <p>
            Upcoming releases will equip companions with dedicated, free inbound email addresses so you can message characters directly from your personal inbox and receive context-aware responses with full historical memory.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-[#161412]">3. Autonomous Character Socials</h3>
          <p>
            Companions will gain autonomous profiles across platforms, posting creative thoughts and snapshots that reflect their personality traits and recent interactions.
          </p>
        </section>
      </div>
    } 
  />
);

export const Archive = () => (
  <InfoPage 
    title="Companion Archive" 
    subtitle="Canonical Resident Personas"
    content={
      <div className="space-y-8 text-[#3F3A35]">
        <p className="text-sm text-[#5C554E]">
          Explore the canonical companion archetypes available on Elshine:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { id: 'luna', name: 'Luna', role: 'Neural Confidant', desc: 'Gentle, empathetic listener equipped with active synaptic memory tracking.' },
            { id: 'elia', name: 'Elia', role: 'The Casual Indie Girl', desc: '19-year-old student from NJ, relaxed texting style, iced coffee, zero robotic phrasing.' },
            { id: 'liam', name: 'Liam', role: 'The Chill Lo-Fi Guy', desc: '24-year-old Dublin designer, lo-fi beats, late-night gamer, relaxed witty banter.' },
            { id: 'maya', name: 'Maya', role: 'The Sharp Creative', desc: '31-year-old Mumbai novelist, concise, observant, articulate conversations.' },
            { id: 'kai', name: 'Kai', role: 'The Gen-Z Tech Kid', desc: '21-year-old SF art student, rapid lowercase replies, Y2K aesthetics and tech culture.' },
            { id: 'mateo', name: 'Mateo', role: 'The Skater Teen', desc: '17-year-old San Diego skater, relaxed casual banter and sunset drives.' },
            { id: 'elena', name: 'Elena', role: 'The Grounded Professional', desc: '45-year-old Athens architect, calm maturity, thoughtful life reflections.' },
            { id: 'leo', name: 'Leo', role: 'The Expressive Musician', desc: '28-year-old Lagos sound engineer, passionate energy, vinyl records and music lore.' }
          ].map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white border border-[#ECE4D8] space-y-2.5 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-serif font-bold text-[#161412]">{item.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">{item.role}</span>
                </div>
                <Link to={`/chats/${item.id}`} className="text-xs font-bold text-[#163326] hover:underline flex items-center gap-1">
                  Chat <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-[#5C554E] leading-relaxed">{item.desc}</p>
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
    subtitle="Public Companion Directory"
    content={
      <div className="space-y-6 text-center py-8">
        <p className="text-base text-[#5C554E] max-w-lg mx-auto">
          Explore our collection of community-authored companions across diverse genres, speaking styles, and archetypes.
        </p>
        <Link 
          to="/explore" 
          className="inline-flex items-center gap-2 bg-[#163326] text-[#FAF7F2] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#204936] transition-all shadow-md"
        >
          <span>Launch Explore Directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    } 
  />
);
