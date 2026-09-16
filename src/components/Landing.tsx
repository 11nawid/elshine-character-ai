import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Github, 
  Instagram, 
  ArrowUpRight, 
  Cpu, 
  Zap, 
  Shield, 
  Globe as GlobeIcon, 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Menu, 
  X, 
  Compass
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { generateAvatar } from '../lib/avatar';
import { FEATURED_CHARACTERS } from './create/presets';
import { listCharacters } from '../lib/api';
import type { Character } from '../types';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicChars, setPublicChars] = useState<Character[]>([]);

  useEffect(() => {
    let active = true;
    listCharacters('public')
      .then((res) => {
        if (active && res.characters?.length) {
          setPublicChars(res.characters);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [0.9, 1]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white relative">
      {/* 1. Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 md:px-12 py-5 flex justify-between items-center z-[100] bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 shadow-xs">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img 
            src="/icon.png" 
            alt="Elshine AI" 
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" 
          />
          <h1 className="text-base font-black tracking-tighter uppercase">
            Elshine <span className="font-light text-zinc-400">AI</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <Link to="/explore" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors">
            Explore
          </Link>
          <Link to="/vision" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors">
            Vision
          </Link>
          <Link to="/architecture" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors">
            Architecture
          </Link>
          <Link to="/docs" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors">
            Docs
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-700 hover:text-black px-4 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-[11px] font-bold uppercase tracking-[0.2em] bg-black text-white px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-700 hover:text-black cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[73px] z-[99] bg-white border-b border-zinc-200 p-8 shadow-2xl flex flex-col gap-5 md:hidden"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
              <img 
                src="/icon.png" 
                alt="Elshine AI" 
                className="w-7 h-7 rounded-lg object-contain shadow-xs" 
              />
              <span className="text-sm font-black tracking-tight uppercase">Elshine AI</span>
            </div>
            <Link 
              to="/explore" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-zinc-800"
            >
              Explore Characters
            </Link>
            <Link 
              to="/vision" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-zinc-800"
            >
              Our Vision
            </Link>
            <Link 
              to="/architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-zinc-800"
            >
              Neural Architecture
            </Link>
            <Link 
              to="/docs" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-zinc-800"
            >
              Documentation
            </Link>
            <div className="h-px bg-zinc-100 my-2" />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full text-center py-3 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-full cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                className="w-full text-center py-3 text-xs font-bold uppercase tracking-widest bg-black text-white rounded-full cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 pt-28 pb-16 relative overflow-hidden">
        <div className="max-w-6xl space-y-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider border border-zinc-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Next-Gen Conversational Intelligence</span>
            </div>
            <h2 className="text-6xl sm:text-7xl md:text-[10vw] font-bold leading-[0.88] tracking-tighter uppercase">
              AI Companions <br /> That Remember <br /> <span className="italic font-serif font-normal lowercase tracking-normal">you.</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
          >
            <p className="text-lg md:text-2xl font-light max-w-xl leading-relaxed tracking-tight text-zinc-600">
              Create unique digital personalities or chat with community favorites. Every companion remembers your conversations, preferences, and shared lore forever.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-4 rounded-full hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Start Chatting Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/explore')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] bg-zinc-100 text-zinc-800 px-6 py-4 rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" /> Explore Gallery
              </button>
            </div>
          </motion.div>

          {/* Interactive Simulated Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8"
          >
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 md:p-8 max-w-3xl shadow-xl shadow-zinc-100/80 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={generateAvatar('luna', 120)} 
                      alt="Luna" 
                      className="w-10 h-10 rounded-xl object-cover" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Luna</h4>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Neural Companion</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-zinc-200 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                  <Brain className="w-3 h-3 text-indigo-500" />
                  <span>Continuous Memory Active</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-medium leading-relaxed">
                <div className="flex gap-3 justify-end">
                  <div className="bg-black text-white px-4 py-3 rounded-2xl rounded-tr-xs max-w-sm">
                    Hey Luna! Remember what I told you about my marathon training?
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <img src={generateAvatar('luna', 60)} alt="Luna" className="w-6 h-6 rounded-lg mt-1" />
                  <div className="bg-white border border-zinc-200/70 text-zinc-800 px-4 py-3 rounded-2xl rounded-tl-xs max-w-md shadow-xs space-y-2">
                    <p>
                      Of course! You were aiming for sub-4 hours this October, right? 🏃 How did your long 18-mile run go this morning?
                    </p>
                    <div className="pt-1.5 border-t border-zinc-100 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                      <Sparkles className="w-3 h-3" /> Memory Linked: "Trains for marathons • Target sub-4h"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. The Pillars (What We Do) */}
      <section className="py-24 px-6 md:px-20 border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-2">Core Engine</span>
              <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Why Elshine is Different.</h3>
            </div>
            <p className="text-base text-zinc-500 font-light leading-relaxed">
              Most chatbots forget what you said ten minutes ago. Elshine extracts facts, preferences, and emotions into a persistent neural constellation that evolves with every turn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Persistent Memory',
                desc: 'Automatic background memory extraction stores user facts, relations, and shared lore seamlessly.'
              },
              {
                icon: Sparkles,
                title: 'Natural Dialogue',
                desc: 'Powered by unlimited modern generative intelligence for ultra-responsive, organic conversation.'
              },
              {
                icon: Shield,
                title: 'Private & Secure',
                desc: 'Your private chats and neural memories are safeguarded with strict credential isolation.'
              },
              {
                icon: Zap,
                title: 'Zero Limits',
                desc: 'No arbitrary turn caps, no cooldowns, and no hidden subscriptions for core conversational play.'
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-black transition-all group space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-black group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-tight">{pillar.title}</h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Characters Gallery */}
      <section className="py-24 px-6 md:px-20 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-2">Manifestations</span>
              <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter">Featured Companions</h2>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 hover:text-white flex items-center gap-2 border-b border-zinc-700 pb-1 hover:border-white transition-all cursor-pointer"
            >
              Browse All Characters <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(publicChars.length > 0 ? publicChars.slice(0, 5) : FEATURED_CHARACTERS).map((char) => (
              <div
                key={char.id}
                onClick={() => navigate(`/chats/${char.id}`)}
                className="group relative bg-zinc-900/90 rounded-3xl overflow-hidden border border-zinc-800/80 hover:border-zinc-500 transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img 
                    src={char.avatarUrl || generateAvatar(char.id, 500)} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    alt={char.name}
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-zinc-200">{char.name}</h4>
                    <p className="text-xs text-zinc-400 font-light line-clamp-2 mt-1">{char.description}</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                    <span>Chat Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Metrics Section */}
      <section className="py-24 px-6 md:px-20 border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {[
              { label: 'Chat Turns & Sessions', val: 'Unlimited', desc: 'No daily interaction limits or artificial caps' },
              { label: 'Long-Term Context', val: 'Persistent', desc: 'Recalls user memories naturally across every conversation' },
              { label: 'Platform Access', val: '100% Free', desc: 'Built for open access with seamless cloud sync' }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                <span className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black block">{stat.val}</span>
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-800">{stat.label}</h4>
                <p className="text-xs text-zinc-500 font-light">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Process Flow */}
      <section className="py-24 bg-zinc-50 px-6 md:px-20 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-2">Workflow</span>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">How It Works.</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Step 01 — 04</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Imagine Your AI', desc: 'Pick a name, avatar style, and creative background backstory.' },
              { step: '02', title: 'Define Personality', desc: 'Tune voice traits, speaking rhythm, and familiar companion nickname.' },
              { step: '03', title: 'Neural Synthesis', desc: 'The engine equips the character with memories and emotional context.' },
              { step: '04', title: 'Chat & Watch Them Grow', desc: 'Engage in fluid conversation as synaptic links form in real-time.' }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-zinc-200/70 space-y-6 flex flex-col justify-between">
                <span className="text-4xl font-black text-zinc-300">{item.step}</span>
                <div className="space-y-2">
                  <h4 className="text-base font-bold uppercase tracking-tight">{item.title}</h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">{item.desc}</p>
                </div>
                <div className="w-8 h-1 bg-black rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Community Testimonials Showcase */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block">Community</span>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Loved by Roleplayers & Creators.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Luna remembered my pet dog's name three weeks after I casually mentioned it in a chat. That long-term memory is unlike anything else.",
                author: "Sarah K.",
                role: "Creative Writer"
              },
              {
                quote: "Creating characters with custom speaking styles and watching them react naturally without robotic repetition is pure magic.",
                author: "Devon M.",
                role: "Game Designer"
              },
              {
                quote: "Completely free, fast responses, and clean typography. The interactive memory map alone makes this my go-to companion app.",
                author: "Elena R.",
                role: "AI Enthusiast"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 space-y-6 flex flex-col justify-between">
                <p className="text-sm font-light leading-relaxed text-zinc-700 italic">
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-zinc-200/60">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-black">{testimonial.author}</h5>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Call to Action */}
      <section className="py-28 px-6 text-center bg-black text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-400 block">Ready to Begin?</span>
          <h2 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
            Create Your <br /> First Character.
          </h2>
          <p className="text-base text-zinc-400 font-light max-w-md mx-auto">
            Join our open platform today and experience authentic conversational roleplay.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate('/register')}
              className="px-12 py-5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-20 px-6 md:px-20 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="/icon.png" 
                alt="Elshine AI" 
                className="w-7 h-7 rounded-lg object-contain shadow-xs" 
              />
              <h3 className="text-base font-black uppercase tracking-tighter">Elshine Character AI</h3>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Open platform for next-generation conversational companions with persistent long-term memory.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://github.com/11nawid" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="GitHub Profile"
                className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-black hover:bg-zinc-200 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/1n1.nawid/" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram Profile"
                className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-black hover:bg-zinc-200 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black mb-6">Company</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Our Mission', path: '/vision' },
                { name: 'Safety & Trust', path: '/safety' },
                { name: 'Manifesto', path: '/manifesto' },
                { name: 'Ethics Framework', path: '/ethics' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-xs font-medium text-zinc-400 hover:text-black transition-colors uppercase tracking-wider block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black mb-6">Resources</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Architecture', path: '/architecture' },
                { name: 'Documentation', path: '/docs' },
                { name: 'Character Library', path: '/archive' },
                { name: 'Explore Gallery', path: '/explore' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-xs font-medium text-zinc-400 hover:text-black transition-colors uppercase tracking-wider block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black mb-6">Legal</h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Cookie Policy', path: '/cookies' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-xs font-medium text-zinc-400 hover:text-black transition-colors uppercase tracking-wider block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 text-center md:text-left">
            © 2026 Elshine Character AI. Built by Nawid Hussain
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Terms</Link>
            <Link to="/cookies" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
