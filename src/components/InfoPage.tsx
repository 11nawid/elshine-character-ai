import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoPageProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

const InfoPage: React.FC<InfoPageProps> = ({ title, subtitle, content }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-[100] bg-white/85 backdrop-blur-md border-b border-zinc-100">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
          <img src="/icon.png" alt="Elshine AI" className="w-7 h-7 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform" />
          <h1 className="text-base md:text-lg font-black tracking-tighter uppercase">
            Elshine <span className="font-light text-zinc-400">Character AI</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/explore')}
          className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3.5 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
        >
          Explore
        </button>
      </nav>

      <main className="pt-40 pb-20 px-8 md:px-20 max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-[0.6em] text-zinc-400 block">{subtitle || 'Resource'}</span>
          <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
            {title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose prose-zinc max-w-none prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-bold prose-p:text-zinc-500 prose-p:leading-relaxed prose-p:font-light prose-p:text-lg"
        >
          {content}
        </motion.div>
      </main>

      <footer className="py-20 px-8 border-t border-zinc-100 bg-zinc-50 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">
          © 2026 Elshine Character AI. An Open Source Initiative.
        </p>
      </footer>
    </div>
  );
};

export default InfoPage;
