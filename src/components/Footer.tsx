import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const ForestSkylineLandscape: React.FC = () => (
  <div className="w-full bg-[#FAF7F2] -mb-px leading-none overflow-hidden relative select-none">
    <svg 
      viewBox="0 0 1440 150" 
      preserveAspectRatio="none" 
      className="w-full h-24 sm:h-32 md:h-40 block text-[#1B4031] fill-current"
    >
      <path d="M0,150 L0,78 
        C20,77 35,70 50,72 
        C65,74 75,80 90,78 
        C105,76 120,65 135,67 
        C150,69 160,78 175,76 
        C195,74 210,60 225,62 
        C240,64 250,74 265,72 
        C280,70 295,58 310,60 
        C325,62 335,70 350,68 
        C370,66 385,50 405,52 
        C425,54 435,68 450,66 
        C470,64 485,50 505,48 
        C520,46 530,56 545,55 
        C565,54 580,42 600,44 
        C615,46 625,56 640,54 
        C655,52 665,40 680,42 
        C695,44 705,32 720,30 
        C735,32 745,44 760,42 
        C775,40 785,52 800,54 
        C815,56 825,46 840,44 
        C860,42 875,54 895,52 
        C915,50 925,38 945,40 
        C965,42 980,54 1000,52 
        C1020,50 1035,38 1055,40 
        C1075,42 1085,56 1105,54 
        C1125,52 1140,40 1160,42 
        C1180,44 1195,58 1215,56 
        C1235,54 1250,42 1270,44 
        C1290,46 1305,60 1325,58 
        C1345,56 1360,48 1380,50 
        C1400,52 1420,68 1440,65 
        L1440,150 Z" 
      />

      <circle cx="85" cy="65" r="18" />
      <circle cx="170" cy="62" r="22" />
      <circle cx="250" cy="58" r="20" />
      <circle cx="430" cy="48" r="24" />
      <circle cx="510" cy="40" r="22" />
      <circle cx="590" cy="38" r="26" />
      <circle cx="830" cy="38" r="24" />
      <circle cx="900" cy="42" r="22" />
      <circle cx="1070" cy="36" r="25" />
      <circle cx="1150" cy="38" r="23" />
      <circle cx="1260" cy="42" r="22" />
      <circle cx="1360" cy="50" r="20" />

      {/* DISTINCT STANDALONE TREE ON LEFT */}
      <g>
        <rect x="338" y="42" width="7" height="38" rx="2" />
        <circle cx="341" cy="28" r="24" />
        <circle cx="323" cy="36" r="16" />
        <circle cx="360" cy="36" r="16" />
      </g>

      {/* DISTINCT ICONIC DOME ROCK IN CENTER */}
      <g>
        <path d="M665,95 C670,40 690,14 725,14 C760,14 780,40 785,95 Z" />
        <path d="M698,42 C712,28 738,28 752,42" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.25" fill="none" />
        <path d="M725,14 L725,75" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.2" fill="none" />
      </g>

      {/* DISTINCT STANDALONE TREE ON RIGHT */}
      <g>
        <rect x="948" y="44" width="7" height="36" rx="2" />
        <path d="M950,54 L938,44" stroke="#1B4031" strokeWidth="3" strokeLinecap="round" />
        <circle cx="952" cy="28" r="25" />
        <circle cx="934" cy="35" r="17" />
        <circle cx="970" cy="35" r="17" />
      </g>
    </svg>
  </div>
);

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setNewsletterFirstName('');
      }, 4000);
    }
  };

  return (
    <footer className="relative bg-[#1B4031] text-[#FAF7F2]">
      {/* Intricate Forest Skyline Landscape Header */}
      <ForestSkylineLandscape />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-start">
          
          {/* COLUMN 1: Real Links & Socials (Image 3 Left Column) */}
          <div className="space-y-6">
            <ul className="space-y-3 text-sm text-[#D1E5DC] font-normal">
              <li>
                <Link to="/vision" className="hover:text-white transition-colors">
                  Our Mission & Vision
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Characters
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white transition-colors">
                  Companion Studio
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-white transition-colors">
                  Neural Architecture
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Documentation & API
                </Link>
              </li>
            </ul>

            {/* Social Icon Pills (Image 3 Left Column Bottom) */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com/11nawid" 
                target="_blank" 
                rel="noreferrer"
                aria-label="GitHub Profile"
                className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/1n1.nawid/" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Instagram Profile"
                className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: Get Updates Newsletter (Image 3 Center Column) */}
          <div className="space-y-5 md:border-x md:border-white/15 md:px-8">
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="text-2xl font-serif text-white">Get Updates</h4>
              <p className="text-xs font-serif italic text-[#C5DEC8] leading-relaxed">
                Subscribe to our newsletter to receive updates and special announcements.
              </p>
            </div>

            {newsletterSubscribed ? (
              <div className="bg-[#143327] border border-emerald-400/40 rounded-xl p-4 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mx-auto" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Subscribed!</p>
                <p className="text-[11px] text-[#C5DEC8]">Thank you for signing up.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                <div>
                  <input 
                    type="email" 
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="*Email" 
                    className="w-full bg-[#133024] border border-white/25 rounded-md px-3.5 py-2 text-xs text-white placeholder:text-white/50 focus:outline-hidden focus:border-white/70 transition-colors"
                  />
                </div>
                {/* Row: *First Name field + SIGN UP button side-by-side */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newsletterFirstName}
                    onChange={(e) => setNewsletterFirstName(e.target.value)}
                    placeholder="*First Name" 
                    className="flex-1 bg-[#133024] border border-white/25 rounded-md px-3.5 py-2 text-xs text-white placeholder:text-white/50 focus:outline-hidden focus:border-white/70 transition-colors"
                  />
                  <button 
                    type="submit"
                    className="bg-[#F7F2E7] text-[#1B4031] text-[10px] font-black uppercase tracking-wider px-5 py-2 rounded-md hover:bg-white transition-all cursor-pointer shrink-0"
                  >
                    SIGN UP
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* COLUMN 3: Real Creator & Open-Source Project Info (No Mock Data) */}
          <div className="space-y-6 flex flex-col justify-between md:items-end text-left md:text-right">
            <div className="space-y-3">
              <a 
                href="https://github.com/11nawid/elshine-character-ai" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-serif text-white hover:text-[#C5DEC8] transition-colors"
              >
                <span>Explore Open-Source Repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <div className="text-xs text-[#B5D1C3] space-y-1">
                <p className="text-white font-medium">Created by Nawid Hussain Haqbin</p>
                <p>Open-Source Conversational Intelligence</p>
                <p>Powered by Google Gemini 2.5 Flash</p>
                <p className="text-[11px] text-[#A3C2B3]">Contact: contact@elshine.ai</p>
              </div>
            </div>

            {/* Oval badge stamp (Image 3 Bottom Right) */}
            <div className="pt-2">
              <div className="border border-white/40 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-[9px] font-serif uppercase tracking-widest text-[#D1E5DC]">
                <Sparkles className="w-3 h-3 text-[#E8D4B0]" />
                <span>Elshine Character AI • Est. 2026</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#A3C2B3] uppercase tracking-wider font-semibold">
          <p>© 2026 Elshine Character AI. Open-source under Apache 2.0.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
