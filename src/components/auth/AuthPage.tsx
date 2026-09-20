import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
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
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans text-[#161412] relative selection:bg-[#161412] selection:text-[#FAF7F2]"
    >
      {/* Top Thin Coral Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F47C62] via-[#E85D75] to-[#8758A8] sticky top-0 z-[110]" />

      <div className="flex-1 flex overflow-hidden">
        <Auth initialMode={mode} onToggleMode={handleToggleMode} />
      </div>
    </motion.div>
  );
};

export default AuthPage;
