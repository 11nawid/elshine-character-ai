import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { ensureUser } from '../lib/api';
import { friendlyAuthError } from '../lib/firebaseErrors';
import { ArrowRight, Loader2, Globe, Eye, EyeOff } from 'lucide-react';
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
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side: Cinematic Visual (Hidden on mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex w-1/2 bg-zinc-50 relative items-center justify-center p-20 overflow-hidden border-r border-zinc-100 h-full"
      >
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover grayscale"
            alt="Neural Background"
          />
        </div>
        <div className="relative z-10 max-w-md space-y-6">
          <div className="w-12 h-[1px] bg-black" />
          <h2 className="text-4xl font-bold uppercase tracking-tighter leading-tight">
            {isLogin ? 'Welcome back!' : 'Join our community today.'}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 leading-relaxed">
            {isLogin 
              ? 'Sign in to continue chatting with your characters.' 
              : 'Create an account to start building your own AI characters.'}
          </p>
        </div>
        
        {/* Bottom Label */}
        <div className="absolute bottom-10 left-10">
          <span className="text-[9px] font-black uppercase tracking-[1em] text-zinc-300">Elshine Character AI v2.6</span>
        </div>
      </motion.div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 h-full overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] flex flex-col justify-center h-full max-h-[800px]"
        >
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-8 w-fit">
            <img 
              src="/icon.png" 
              alt="Elshine AI" 
              className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" 
            />
            <span className="text-sm font-black uppercase tracking-tight text-zinc-900">
              Elshine <span className="font-light text-zinc-400">AI</span>
            </span>
          </Link>

          <div className="space-y-4 mb-10">
            <h1 className="text-6xl font-bold uppercase tracking-tighter leading-none">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h1>
            <div className="w-8 h-[1px] bg-black/10" />
          </div>

          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="relative group">
                  <input 
                    type="text"
                    required
                    placeholder=" "
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-transparent border-b border-zinc-300 py-3 text-xs focus:border-black transition-all outline-none font-sans placeholder:text-zinc-400 peer tracking-widest font-bold"
                  />
                  <label className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-black">
                    Name
                  </label>
                </div>
              )}

              <div className="relative group">
                <input 
                  type="email"
                  required
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-zinc-300 py-3 text-xs focus:border-black transition-all outline-none font-sans placeholder:text-zinc-400 peer tracking-widest font-bold"
                />
                <label className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-black">
                  Email
                </label>
              </div>

              <div className="relative group">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder=" "
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border-b border-zinc-300 py-3 text-xs focus:border-black transition-all outline-none font-sans placeholder:text-zinc-400 peer tracking-widest font-bold pr-10"
                />
                <label className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-black">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center"
                >
                  Error: {error}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
                <span className="bg-white px-4 text-zinc-400">Social Login</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => handleSocialLogin(googleProvider)}
                className="flex items-center justify-center gap-3 py-4 border border-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all group"
              >
                <Globe className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                Google
              </button>
            </div>

            <div className="text-center pt-6">
              <button 
                onClick={toggleMode}
                className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] hover:text-black transition-colors"
              >
                {isLogin ? "Create an account" : "Already have an account?"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
