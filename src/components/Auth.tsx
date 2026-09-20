import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { ensureUser } from '../lib/api';
import { friendlyAuthError } from '../lib/firebaseErrors';
import { ArrowRight, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthProps {
  initialMode?: 'login' | 'register';
  onToggleMode?: (mode: 'login' | 'register') => void;
}

const Auth: React.FC<AuthProps> = ({ initialMode = 'login', onToggleMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const toggleMode = () => {
    const newMode = isLogin ? 'register' : 'login';
    setIsLogin(!isLogin);
    setError(null);
    onToggleMode?.(newMode);
  };

  const handleSocialLogin = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await user.reload().catch(() => {});
      await user.getIdToken(true).catch(() => {});
      await ensureUser();
    } catch (err: any) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData.displayName });
        await user.reload().catch(() => {});
        await user.getIdToken(true).catch(() => {});
        await ensureUser();
      }
    } catch (err: any) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAF7F2] text-[#161412] font-sans selection:bg-[#161412] selection:text-[#FAF7F2]">
      
      {/* IMMERSIVE ARTWORK PANEL:
          - In LOGIN: Placed on the RIGHT (lg:order-2), with cobalt blue sketch
          - In REGISTER: Placed on the LEFT (lg:order-1), with terracotta sketch
          - Animates fluidly between sides with smooth spring layout transition
      */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 110, damping: 19, mass: 0.8 }}
        className={`hidden lg:block w-1/2 relative bg-[#F5EFE6] h-full overflow-hidden ${
          isLogin ? 'lg:order-2 border-l border-[#ECE4D8]' : 'lg:order-1 border-r border-[#ECE4D8]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login-art' : 'register-art'}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full h-full relative"
          >
            <img 
              src={isLogin ? '/images/auth_login.jpg' : '/images/auth_register.jpg'}
              alt={isLogin ? 'Companion thoughts sketch' : 'Creative thoughts sketch'}
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle warm paper edge blend */}
            <div className={`absolute inset-0 pointer-events-none ${
              isLogin 
                ? 'bg-gradient-to-l from-transparent via-transparent to-[#FAF7F2]/10' 
                : 'bg-gradient-to-r from-transparent via-transparent to-[#FAF7F2]/10'
            }`} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* MINIMAL AUTH FORM PANEL:
          - In LOGIN: Positioned on the LEFT (lg:order-1)
          - In REGISTER: Positioned on the RIGHT (lg:order-2)
          - Glides gracefully into place when toggling modes
      */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 110, damping: 19, mass: 0.8 }}
        className={`flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 h-full overflow-y-auto ${
          isLogin ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img 
              src="/icon.png" 
              alt="Elshine AI" 
              className="w-7 h-7 rounded-lg object-contain border border-[#ECE4D8]" 
            />
            <span className="text-sm font-black uppercase tracking-tight text-[#161412]">
              Elshine <span className="font-light text-[#8C827A]">AI</span>
            </span>
          </Link>

          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C827A] hover:text-[#161412] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm mx-auto my-auto space-y-5"
        >
          <h1 className="text-3xl font-serif text-[#161412]">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>

          {/* Google Sign-in */}
          <button 
            type="button"
            onClick={() => handleSocialLogin(googleProvider)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-[#E0D7CC] rounded-xl text-xs font-semibold text-[#161412] hover:bg-[#F9F6F0] hover:border-[#D0C5B7] transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Clean Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-[#ECE4D8]"></div>
            <span className="bg-[#FAF7F2] px-2.5 text-[11px] font-semibold text-[#8C827A] absolute">
              or
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#161412] block">
                  Name
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-white border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-sm text-[#161412] placeholder:text-[#A89F95] focus:border-[#163326] focus:ring-2 focus:ring-[#163326]/10 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#161412] block">
                Email
              </label>
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-sm text-[#161412] placeholder:text-[#A89F95] focus:border-[#163326] focus:ring-2 focus:ring-[#163326]/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#161412] block">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border border-[#E0D7CC] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#161412] placeholder:text-[#A89F95] focus:border-[#163326] focus:ring-2 focus:ring-[#163326]/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#161412] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-[#FDF2F0] border border-[#F5C7C1] rounded-xl text-xs text-[#B92A20] font-medium leading-tight"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#163326] text-[#FAF7F2] py-2.5 px-6 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#204936] transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-3 pb-3 mt-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="text-center pt-1">
            <button 
              type="button"
              onClick={toggleMode}
              className="text-xs text-[#5C554E] hover:text-[#161412] font-medium transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>Don't have an account? <span className="font-bold underline text-[#161412]">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-bold underline text-[#161412]">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Empty bottom spacer for symmetrical alignment */}
        <div className="h-6" />

      </motion.div>
    </div>
  );
};

export default Auth;
