import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Auth from '../Auth';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleMode = (newMode: 'login' | 'register') => {
    navigate(newMode === 'login' ? '/login' : '/register', {
      state: location.state,
      replace: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white flex flex-col font-sans text-black relative"
    >
      {/* Dock Navigation */}
      <div className="fixed top-8 left-8 z-[200]">
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 px-4 py-3 rounded-full flex items-center gap-6 shadow-sm">
          <button
            onClick={() => navigate('/')}
            className="p-1 hover:opacity-50 transition-opacity"
            title="Back to Landing"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 pr-2">
            Elshine Character AI
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Auth initialMode={mode} onToggleMode={handleToggleMode} />
      </div>
    </motion.div>
  );
};

export default AuthPage;
