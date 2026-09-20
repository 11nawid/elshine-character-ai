import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleMemoryClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('memory');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#memory');
    }
  };

  return (
    <>
      {/* Top Thin Coral Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F47C62] via-[#E85D75] to-[#8758A8] sticky top-0 z-[110]" />

      {/* Clean Minimalist Header */}
      <header className="sticky top-1.5 left-0 right-0 z-[100] bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#ECE4D8] px-6 md:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <img 
              src="/icon.png" 
              alt="Elshine AI" 
              className="w-8 h-8 rounded-xl object-contain border border-[#ECE4D8] shadow-xs group-hover:scale-105 transition-transform" 
            />
            <span className="text-base font-black tracking-tight uppercase text-[#161412]">
              Elshine <span className="font-light text-[#8C827A]">AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-[#5C554E]">
            <Link to="/explore" className="hover:text-[#161412] transition-colors py-1">
              Explore Characters
            </Link>
            <a 
              href="#memory" 
              onClick={handleMemoryClick}
              className="hover:text-[#161412] transition-colors py-1 cursor-pointer"
            >
              Persistent Memory
            </a>
            <Link to="/create" className="hover:text-[#161412] transition-colors py-1">
              Companion Studio
            </Link>
            <Link to="/architecture" className="hover:text-[#161412] transition-colors py-1">
              Architecture
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-xs font-bold uppercase tracking-wider text-[#4A433D] hover:text-black px-2 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="text-xs font-bold uppercase tracking-wider bg-[#163326] text-[#FAF7F2] px-6 py-2.5 rounded-full hover:bg-[#204936] transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              Start Free
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#4A433D] hover:text-black cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[65px] z-[99] bg-[#FAF7F2] border-b border-[#ECE4D8] p-6 shadow-xl flex flex-col gap-4 md:hidden"
          >
            <Link 
              to="/explore" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#161412] py-2 border-b border-[#ECE4D8]"
            >
              Explore Characters
            </Link>
            <a 
              href="#memory" 
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleMemoryClick(e);
              }}
              className="text-sm font-semibold text-[#161412] py-2 border-b border-[#ECE4D8] cursor-pointer"
            >
              Persistent Memory
            </a>
            <Link 
              to="/create" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#161412] py-2 border-b border-[#ECE4D8]"
            >
              Companion Studio
            </Link>
            <Link 
              to="/architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#161412] py-2"
            >
              Architecture
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider border border-[#D5CBC0] rounded-full text-[#161412] cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#163326] text-[#FAF7F2] rounded-full cursor-pointer"
              >
                Start Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
