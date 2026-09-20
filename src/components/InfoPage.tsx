import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

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
    <div className="min-h-screen bg-[#FAF7F2] text-[#161412] font-sans selection:bg-[#161412] selection:text-[#FAF7F2] flex flex-col justify-between">
      
      {/* Unified Site-Wide Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="pt-14 pb-24 px-6 md:px-16 max-w-4xl mx-auto w-full space-y-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 border-b border-[#ECE4D8] pb-10"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#8C827A]">
              <Sparkles className="w-3.5 h-3.5 text-[#E89265]" />
              <span>{subtitle || 'Elshine Documentation & Architecture'}</span>
            </div>
            <button 
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C827A] hover:text-[#161412] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal text-[#161412] leading-[1.05] tracking-tight">
            {title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-8"
        >
          {content}
        </motion.div>
      </main>

      {/* Shared Unified Botanical Forest Skyline Footer */}
      <Footer />

    </div>
  );
};

export default InfoPage;
