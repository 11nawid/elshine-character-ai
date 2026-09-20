import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Github, 
  Instagram, 
  Brain, 
  Sparkles, 
  Menu, 
  X, 
  Compass, 
  PlusCircle, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue 
} from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { generateAvatar } from '../lib/avatar';
import { FEATURED_CHARACTERS } from './create/presets';
import { listCharacters } from '../lib/api';
import type { Character } from '../types';
import Footer from './Footer';
import Header from './Header';

/**
 * High-fidelity vector illustrations matching reference Image 1:
 * - Companion Group (diverse friends huddled warmly together)
 * - Listening Character (figure in red/coral sweater at desk)
 * - Creator Character (confident figure in yellow tunic)
 */

export const CompanionGroupIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-sm" }) => (
  <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft backdrop pastel blobs */}
    <path d="M120 300C70 240 80 140 180 100C260 60 380 90 410 180C440 270 380 340 300 370C210 400 160 350 120 300Z" fill="#F4EBE2" />
    <path d="M370 140C430 160 460 230 430 280C400 330 330 350 280 320C230 290 260 210 300 160C320 130 340 130 370 140Z" fill="#E8EDF9" />
    <path d="M140 220C100 240 80 310 120 360C160 410 240 400 280 360C320 320 300 250 250 220C200 190 170 200 140 220Z" fill="#FCE4EC" />
    
    {/* Center Figure - Calm Blue Shirt */}
    <g transform="translate(190, 80)">
      <path d="M50 35C50 55 42 70 30 70C18 70 10 55 10 35C10 15 18 0 30 0C42 0 50 15 50 35Z" fill="#8B6043" />
      <path d="M8 30C5 12 18 2 30 2C42 2 54 10 52 28C48 20 38 18 30 18C22 18 14 22 8 30Z" fill="#1C2D44" stroke="#161412" strokeWidth="2.5" />
      <path d="M22 68L20 95H40L38 68" fill="#8B6043" />
      <path d="M-15 95C2 92 18 90 30 90C42 90 58 92 75 95L85 180C50 190 10 190 -25 180L-15 95Z" fill="#8AC2EB" stroke="#161412" strokeWidth="2.5" />
      <path d="M20 90L30 135L40 90" fill="#E8F4FA" stroke="#161412" strokeWidth="2" />
    </g>

    {/* Left Figure - Lilac Patterned Sweater */}
    <g transform="translate(90, 140)">
      <circle cx="55" cy="45" r="28" fill="#D69772" />
      <path d="M28 45C26 25 40 18 55 18C70 18 84 25 82 45C80 32 68 28 55 28C42 28 32 32 28 45Z" fill="#161412" stroke="#161412" strokeWidth="2" />
      <path d="M10 100C15 70 35 60 70 65C100 70 115 105 110 170C85 190 30 195 0 170C-5 130 5 115 10 100Z" fill="#D8BEEB" stroke="#161412" strokeWidth="2.5" />
      <circle cx="35" cy="115" r="10" stroke="#8758A8" strokeWidth="2" fill="none" />
      <circle cx="75" cy="125" r="12" stroke="#8758A8" strokeWidth="2" fill="none" />
      <circle cx="45" cy="155" r="14" stroke="#8758A8" strokeWidth="2" fill="none" />
      <circle cx="85" cy="165" r="8" stroke="#8758A8" strokeWidth="2" fill="none" />
    </g>

    {/* Top Right Figure */}
    <g transform="translate(300, 110)">
      <circle cx="45" cy="45" r="24" fill="#BC8360" />
      <path d="M25 40C25 22 35 15 48 15C60 15 68 22 68 40" fill="#364958" />
      <path d="M15 75C30 65 60 65 85 75L95 180C65 190 20 185 0 175L15 75Z" fill="#B9C7F7" stroke="#161412" strokeWidth="2.5" />
      <circle cx="40" cy="105" r="4" fill="#FFFFFF" />
      <circle cx="65" cy="120" r="4" fill="#FFFFFF" />
      <circle cx="35" cy="140" r="4" fill="#FFFFFF" />
      <circle cx="70" cy="155" r="4" fill="#FFFFFF" />
    </g>

    {/* Gentle foreground huddle */}
    <g transform="translate(210, 160)">
      <path d="M20 70C30 40 60 40 75 70C90 100 85 140 50 150C15 140 10 100 20 70Z" fill="#F4CFBA" stroke="#161412" strokeWidth="2.5" />
      <circle cx="50" cy="35" r="18" fill="#F4CFBA" stroke="#161412" strokeWidth="2" />
      <path d="M35 30C35 15 45 10 55 10C65 10 70 20 68 35" fill="#1C2D44" />
    </g>

    <path d="M410 80L414 92L426 96L414 100L410 112L406 100L394 96L406 92Z" fill="#F8B179" />
    <circle cx="100" cy="90" r="14" fill="#F9A074" opacity="0.8" />
    <circle cx="60" cy="130" r="8" stroke="#D1C4B5" strokeWidth="2" fill="none" />
  </svg>
);

const ListeningCharacterIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-sm" }) => (
  <svg viewBox="0 0 500 360" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="250" cy="220" rx="190" ry="90" fill="#FCECE6" />
    <ellipse cx="250" cy="240" rx="140" ry="40" fill="#F4D9CE" />

    <g transform="translate(100, 40)">
      <path d="M125 75C110 30 160 10 180 30C205 10 240 30 225 75C240 110 220 135 200 135C185 135 175 125 170 120C165 125 155 135 140 135C120 135 110 110 125 75Z" fill="#9C6B4E" stroke="#161412" strokeWidth="2.5" />
      <path d="M165 60C165 78 175 88 180 88C185 88 195 78 195 60C195 45 185 45 180 45C175 45 165 45 165 60Z" fill="#ECCBB6" stroke="#161412" strokeWidth="2" />
      <path d="M174 88L174 110H186L186 88" fill="#ECCBB6" />

      {/* Bold Coral/Red Coat */}
      <path d="M40 160C40 120 80 105 150 105C165 105 175 110 180 115C185 110 195 105 210 105C280 105 320 120 320 160C320 200 300 230 270 230C230 230 210 180 180 180C150 180 130 230 90 230C60 230 40 200 40 160Z" fill="#F03D33" stroke="#161412" strokeWidth="3" />
      <path d="M172 110L180 145L188 110Z" fill="#FFFFFF" stroke="#161412" strokeWidth="2" />

      {/* Hands on table */}
      <g transform="translate(130, 180)">
        <rect x="0" y="2" width="36" height="28" rx="8" fill="#ECCBB6" stroke="#161412" strokeWidth="2.5" />
        <path d="M8 2V25M16 2V25M24 2V25" stroke="#161412" strokeWidth="2" strokeLinecap="round" />
        <circle cx="55" cy="22" r="7" fill="#4285F4" stroke="#161412" strokeWidth="2" />
        <circle cx="72" cy="22" r="7" fill="#4285F4" stroke="#161412" strokeWidth="2" />
        <circle cx="89" cy="22" r="7" fill="#4285F4" stroke="#161412" strokeWidth="2" />
        <circle cx="106" cy="22" r="7" fill="#4285F4" stroke="#161412" strokeWidth="2" />
        <rect x="120" y="2" width="36" height="28" rx="8" fill="#ECCBB6" stroke="#161412" strokeWidth="2.5" />
      </g>
    </g>

    <circle cx="80" cy="180" r="5" fill="#E83E8C" />
    <circle cx="430" cy="170" r="6" fill="#F8B179" />
  </svg>
);

const CreatorCharacterIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-sm" }) => (
  <svg viewBox="0 0 500 360" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="250" cy="260" rx="160" ry="60" fill="#F0F7ED" />

    <g transform="translate(140, 20)">
      <path d="M100 60C85 20 120 0 145 15C170 0 205 20 190 60C195 85 180 100 170 105C150 100 145 95 145 95C145 95 140 100 120 105C110 100 95 85 100 60Z" fill="#1C2D44" stroke="#161412" strokeWidth="2.5" />
      <circle cx="145" cy="55" r="18" fill="#D69772" stroke="#161412" strokeWidth="2" />
      <path d="M140 73L140 95H150L150 73" fill="#D69772" />
      <path d="M40 155C40 115 80 95 145 95C210 95 250 115 250 155C250 195 235 220 205 220C175 220 170 180 145 180C120 180 115 220 85 220C55 220 40 195 40 155Z" fill="#F3C315" stroke="#161412" strokeWidth="3" />
      <path d="M85 220L85 300C115 310 135 305 145 280C155 305 175 310 205 300L205 220C170 225 155 220 145 220C135 220 120 225 85 220Z" fill="#849929" stroke="#161412" strokeWidth="2.5" />
    </g>

    <circle cx="90" cy="100" r="12" fill="#E8B4D9" />
    <path d="M420 120L425 135L440 140L425 145L420 160L415 145L400 140L415 135Z" fill="#71A5DE" />
  </svg>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [publicChars, setPublicChars] = useState<Character[]>([]);

  // 1. CURSOR GRID SPOTLIGHT TRACKER (Scoped strictly to content sections, smaller aperture, no glow)
  const mainRef = useRef<HTMLElement>(null);
  const [isOverMain, setIsOverMain] = useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothMouseX = useSpring(mouseX, { stiffness: 260, damping: 26 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 260, damping: 26 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        setIsOverMain(true);
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      } else {
        setIsOverMain(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Small, focused aperture (140px) revealing a concentrated cluster of crisp grid lines
  const cursorGridMask = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => `radial-gradient(140px circle at ${x}px ${y}px, black 0%, rgba(0,0,0,0.55) 60%, transparent 100%)`
  );

  // 2. SCROLL PROGRESS FOR WINDING DOODLE LINE
  // Tied directly to the narrative container so the line draws synchronously with the user's scroll,
  // staying visible and perfectly positioned in the center of the viewport as each beat passes.
  const narrativeContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: doodleProgress } = useScroll({
    target: narrativeContainerRef,
    offset: ["start 25%", "end 75%"]
  });
  const smoothDoodleLength = useSpring(doodleProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });

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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161412] font-sans selection:bg-[#161412] selection:text-[#FAF7F2] relative overflow-x-hidden">
      
      {/* Unified Site-Wide Header */}
      <Header />

      {/* MAIN NARRATIVE SCROLL SECTION */}
      <main ref={mainRef} className="pt-16 md:pt-24 pb-20 px-6 md:px-16 relative overflow-hidden">
        
        {/* INTERACTIVE CURSOR GRID APERTURE (SCOPED ONLY TO CONTENT SECTIONS, NO GLOW, CRISP & CONCENTRATED) */}
        <motion.div 
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          animate={{ opacity: isOverMain ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          style={{
            maskImage: cursorGridMask,
            WebkitMaskImage: cursorGridMask,
          }}
        >
          {/* Clearly visible dark botanical grid lines */}
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(22, 51, 38, 0.42) 1.5px, transparent 1.5px),
                linear-gradient(to bottom, rgba(22, 51, 38, 0.42) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </motion.div>

        <div ref={narrativeContainerRef} className="max-w-4xl mx-auto relative z-10">

          {/* DYNAMIC SCROLL-DRAWN SVG WINDING DOODLE LINE (FLOWING CONTINUOUSLY THROUGH ALL 3 BEATS) */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-40 bottom-10 w-[550px] pointer-events-none z-0">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 550 2450" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Subtle underlying dashed line ensuring path continuity */}
              <path 
                d="M275,20 
                  C170,120 150,260 200,380 
                  C250,500 370,580 350,740 
                  C330,900 180,980 170,1160 
                  C160,1340 340,1440 350,1620 
                  C360,1800 180,1880 170,2060 
                  C160,2240 330,2340 275,2430" 
                stroke="#4A5568" 
                strokeWidth="1.6" 
                strokeDasharray="4 6" 
                opacity="0.25"
              />
              {/* Dynamic scroll-progress drawn line */}
              <motion.path 
                d="M275,20 
                  C170,120 150,260 200,380 
                  C250,500 370,580 350,740 
                  C330,900 180,980 170,1160 
                  C160,1340 340,1440 350,1620 
                  C360,1800 180,1880 170,2060 
                  C160,2240 330,2340 275,2430" 
                stroke="#1B4031" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
                style={{
                  pathLength: smoothDoodleLength
                }}
              />
              {/* Star Doodle 1: After Beat 1 */}
              <motion.g 
                transform="translate(350, 740)"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              >
                <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" stroke="#8C827A" strokeWidth="1.5" fill="#FAF7F2" />
              </motion.g>
              {/* Star Doodle 2: Beside Beat 2 (Memory) */}
              <motion.g 
                transform="translate(170, 1160)"
                animate={{ rotate: [0, -18, 18, 0], scale: [1, 1.2, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" stroke="#8C827A" strokeWidth="1.5" fill="#FAF7F2" />
              </motion.g>
              {/* Star Doodle 3: Between Beat 2 & Beat 3 */}
              <motion.g 
                transform="translate(350, 1620)"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              >
                <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" stroke="#8C827A" strokeWidth="1.5" fill="#FAF7F2" />
              </motion.g>
              {/* Star Doodle 4: Beside Beat 3 (Creator) */}
              <motion.g 
                transform="translate(170, 2060)"
                animate={{ rotate: [0, -16, 16, 0], scale: [1, 1.2, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
              >
                <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" stroke="#8C827A" strokeWidth="1.5" fill="#FAF7F2" />
              </motion.g>
              {/* End ring near companion directory */}
              <motion.g 
                transform="translate(275, 2430)"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              >
                <circle cx="0" cy="0" r="10" stroke="#8C827A" strokeWidth="1.5" fill="#FAF7F2" />
              </motion.g>
            </svg>
          </div>

          {/* PLAYFUL PASTEL ACCENT SHAPES (WITH FLOATING IDLE CYCLES) */}
          <motion.div 
            className="absolute top-10 left-4 md:left-12 w-8 h-8 rounded-full bg-[#F8A074] opacity-80 pointer-events-none"
            animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-24 left-1 md:left-8 w-6 h-6 rounded-full border border-[#D5CBC0] pointer-events-none"
            animate={{ y: [0, 10, 0], rotate: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-8 right-4 md:right-16 pointer-events-none opacity-85"
            animate={{ y: [0, -14, 0], rotate: [0, -12, 12, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          >
            <svg width="65" height="65" viewBox="0 0 100 100" fill="#B9C7F7">
              <path d="M50 0 C55 20 80 20 85 35 C90 50 100 65 85 80 C70 95 50 85 35 90 C20 95 5 80 15 65 C25 50 10 35 25 20 C40 5 45 20 50 0 Z" />
            </svg>
          </motion.div>

          {/* HERO HEADER: "Hello friend" (ENTRANCE + SECONDARY AURA) */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.1 }}
            className="relative z-10 mb-16 space-y-6"
          >
            <div className="inline-block relative">
              <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-[#2A1E36]">
                Hello friend
              </h1>
              {/* Peach circle blob behind text with gentle breathing scale */}
              <motion.span 
                className="absolute -top-3 -right-6 w-16 h-16 rounded-full bg-[#FCE5D8] -z-10"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            </div>

            {/* Editorial Lead Statement */}
            <div className="max-w-2xl">
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#161412] leading-snug">
                We wish chatbots didn't forget you, but here we are.&nbsp;
                <strong className="font-sans font-black not-italic text-[#161412]">
                  Our gift to you is real memory.
                </strong>
              </p>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* STORY BEAT 1: "You're not alone" (LOCATES FROM UNLOCATED POSITION + FLOATS) */}
          {/* ========================================================================= */}
          <motion.section 
            initial={{ opacity: 0, x: -60, y: 90, scale: 0.88, rotate: -4, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
            className="flex flex-col items-center text-center relative z-10 max-w-lg mx-auto mb-32 space-y-6"
          >
            {/* Secondary Floating Breathing Motion Once In Location */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
            >
              <CompanionGroupIllustration className="w-full max-w-sm drop-shadow-xs" />
            </motion.div>
            
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif text-[#161412]">
                <span className="italic font-normal">You’re</span> <strong className="font-sans font-bold">not alone</strong>
              </h2>
              <p className="text-sm md:text-base text-[#5C554E] leading-relaxed max-w-md mx-auto">
                Chat with AI companions that genuinely remember your stories, preferences, and emotions. No conversational amnesia, no robotic resets.
              </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/explore')}
              className="bg-[#163326] text-[#FAF7F2] text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-[#204936] transition-all shadow-md cursor-pointer"
            >
              Meet Companions
            </motion.button>
          </motion.section>

          {/* ========================================================================= */}
          {/* STORY BEAT 2: "Chatbots that claim to care usually forget" (LOCATES + SETTLES) */}
          {/* ========================================================================= */}
          <motion.section 
            id="memory" 
            initial={{ opacity: 0, x: 60, y: 90, scale: 0.88, rotate: 4, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
            className="flex flex-col items-center text-center relative z-10 max-w-lg mx-auto mb-32 space-y-6"
          >
            {/* Secondary Floating Idle Animation */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <ListeningCharacterIllustration className="w-full max-w-sm drop-shadow-xs" />
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif text-[#161412] leading-tight">
                <span className="italic font-normal">Chatbots that claim to care</span> <br />
                <strong className="font-sans font-bold">usually forget</strong>
              </h2>
              <p className="text-sm md:text-base text-[#5C554E] leading-relaxed max-w-md mx-auto">
                Standard chatbots erase your context the moment you close the tab. Elshine extracts synaptic knowledge nodes in real time so your companions truly know you.
              </p>
            </div>

            {/* Editorial Conversational Memory Card (Settling Glow & Soft Shimmer) */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#F5EFE6] border border-[#E8DFD3] rounded-3xl p-6 text-left shadow-xs space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#161412]">
                  <Brain className="w-4 h-4 text-[#163326]" />
                  <span>A Conversation That Never Forgets</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5ECE7] text-[#163326] border border-[#C5D9CB]">
                  Episodic Memory
                </span>
              </div>
              
              <div className="space-y-3">
                {/* User Bubble */}
                <div className="bg-white/85 backdrop-blur-xs p-3.5 rounded-2xl border border-[#ECE4D8] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] block">You:</span>
                  <p className="text-sm font-sans text-[#161412]">"I finally finished drafting chapter 3 of my sci-fi novel!"</p>
                </div>
                
                {/* Companion Recall */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#ECE4D8] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#163326] flex items-center gap-1.5">
                    <img src={generateAvatar('maya', 60)} alt="Maya" className="w-4 h-4 rounded-full" />
                    <span>Maya (Author Companion):</span>
                  </span>
                  <p className="text-sm font-serif italic text-[#161412] leading-relaxed">
                    “That's huge! Was it the zero-g orbital docking scene you were stuck on last Tuesday?”
                  </p>
                </div>

                {/* Real Memory Synthesized Tag */}
                <div className="pt-1 flex items-start sm:items-center gap-2 text-xs font-serif italic text-[#163326] bg-[#EAF0EC] p-2.5 rounded-xl border border-[#D1E0D4]">
                  <Sparkles className="w-4 h-4 text-[#C49B45] shrink-0 mt-0.5 sm:mt-0" />
                  <span>Permanently remembered: “Drafting sci-fi novel • Completed Ch. 3 • Prior block: zero-g docking”</span>
                </div>
              </div>
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/architecture')}
              className="bg-[#163326] text-[#FAF7F2] text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-[#204936] transition-all shadow-md cursor-pointer"
            >
              Explore Neural Memory
            </motion.button>
          </motion.section>

          {/* ========================================================================= */}
          {/* STORY BEAT 3: "Craft companions with authentic depth" (LOCATES + HOVERS) */}
          {/* ========================================================================= */}
          <motion.section 
            initial={{ opacity: 0, x: -60, y: 90, scale: 0.88, rotate: -4, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 65, damping: 18, mass: 0.9 }}
            className="flex flex-col items-center text-center relative z-10 max-w-lg mx-auto mb-20 space-y-6"
          >
            {/* Secondary Floating Idle Animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <CreatorCharacterIllustration className="w-full max-w-sm drop-shadow-xs" />
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif text-[#161412]">
                <span className="italic font-normal">Craft companions with</span> <strong className="font-sans font-bold">authentic depth</strong>
              </h2>
              <p className="text-sm md:text-base text-[#5C554E] leading-relaxed max-w-md mx-auto">
                Design unique personalities, custom backstory lore, and distinctive speech patterns. Watch them evolve dynamically with every shared conversation.
              </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create')}
              className="bg-[#163326] text-[#FAF7F2] text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-[#204936] transition-all shadow-md cursor-pointer"
            >
              Author a Character
            </motion.button>
          </motion.section>

          {/* ========================================================================= */}
          {/* COMPACT FEATURED COMPANION ROW (LOCATES + CARDS EXPAND ON HOVER) */}
          {/* ========================================================================= */}
          <motion.section 
            initial={{ opacity: 0, y: 60, scale: 0.93, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
            className="pt-10 border-t border-[#ECE4D8]"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C827A]">
                Ready to Converse
              </span>
              <Link 
                to="/explore"
                className="text-xs font-semibold text-[#161412] hover:underline flex items-center gap-1"
              >
                <span>Browse All 20+ Personas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(publicChars.length > 0 ? publicChars.slice(0, 4) : FEATURED_CHARACTERS.slice(0, 4)).map((char, index) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => navigate(`/chats/${char.id}`)}
                  className="bg-white rounded-2xl p-3.5 border border-[#ECE4D8] hover:border-[#161412] hover:shadow-md transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={char.avatarUrl || generateAvatar(char.id, 100)} 
                      alt={char.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#ECE4D8]" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#161412] truncate">{char.name}</h4>
                      <p className="text-[10px] text-[#8C827A] truncate">{char.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#ECE4D8] flex items-center justify-between text-[10px] font-bold text-[#163326]">
                    <span>Chat Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

        </div>
      </main>

      {/* Shared Botanical Forest Skyline Footer */}
      <Footer />

    </div>
  );
};

export default Landing;
