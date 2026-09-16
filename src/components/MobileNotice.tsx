import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MobileNotice: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('elshine_mobile_notice_dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    const checkMobile = () => {
      const isMobileWidth = window.innerWidth < 768;
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileWidth || (isMobileAgent && window.innerWidth < 1024));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('elshine_mobile_notice_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-200 shadow-2xl space-y-6 text-center text-black relative overflow-hidden"
        >
          {/* Dismiss close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo & Device Icon */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 shadow-md p-1.5 flex items-center justify-center">
              <img src="/icon.png" alt="Elshine" className="w-full h-full object-contain" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Monitor className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full inline-block">
              Desktop Viewport Recommended
            </span>
            <h2 className="text-2xl font-bold tracking-tight uppercase">
              Mobile Experience <br />Coming Soon.
            </h2>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-normal">
            <strong>Elshine Character AI</strong> is currently engineered and optimized exclusively for desktop and tablet screens. Our dual-pane conversational roleplay interface, interactive 3D synaptic memory graphs, and character studio tools are not yet built for mobile screens.
          </p>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Mobile Optimization In Progress
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              A fully responsive mobile application and touch-optimized roleplay experience is actively under development and will be available soon. Please switch to a desktop or laptop for the best experience.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleDismiss}
              className="w-full py-3.5 px-6 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              Continue to Desktop View Anyway <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
              Optimized for Chrome, Edge, Safari & Firefox on PC / Mac
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
