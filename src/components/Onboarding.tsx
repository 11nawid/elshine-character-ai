import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, Shield, User as UserIcon } from 'lucide-react';
import { updateMe, emitProfileUpdated, ensureUser, ApiError } from '../lib/api';
import { friendlyAuthError } from '../lib/firebaseErrors';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: '',
    interests: [] as string[],
    agreedToEthics: false,
  });

  const steps = [
    {
      id: 1,
      title: 'About You',
      subtitle: 'Tell us a bit about yourself',
      icon: <UserIcon className="w-6 h-6" />,
    },
    {
      id: 2,
      title: 'Interests',
      subtitle: 'What kind of characters do you like?',
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 3,
      title: 'Community Rules',
      subtitle: 'Please agree to our guidelines',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  const interests = ['Poetry', 'Philosophy', 'Science', 'Art', 'Coding', 'Music', 'History', 'Futurism'];

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ensureUser();
      await updateMe({
        bio: formData.bio,
        interests: formData.interests,
        onboardingCompleted: true,
      });
      emitProfileUpdated();
      onComplete();
    } catch (err) {
      console.error('Onboarding update failed:', err);
      setError(err instanceof ApiError ? err.message : friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const stepVisuals = [
    {
      image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=2000",
      quote: "TELL US WHO YOU ARE.",
      desc: "Write a short bio to introduce yourself to the community."
    },
    {
      image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=2000",
      quote: "CHOOSE YOUR INTERESTS.",
      desc: "Select the themes and topics you are most interested in."
    },
    {
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000",
      quote: "FOLLOW THE RULES.",
      desc: "We want to keep this community safe and fun for everyone."
    }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-black selection:text-white relative">
      {/* Dock Navigation */}
      <div className="fixed top-8 left-8 z-[200]">
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 px-4 py-3 rounded-full flex items-center gap-6 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 pl-2">Step</span>
          <div className="w-[1px] h-4 bg-zinc-200" />
          <div className="flex gap-1 pr-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-[1px] transition-all duration-500 ${i === step ? 'bg-black' : 'bg-zinc-200'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Left Side: Dynamic Visual Anchor */}
      <motion.div 
        key={`visual-${step}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex w-1/2 bg-zinc-50 relative items-center justify-center p-20 overflow-hidden border-r border-zinc-100 h-full"
      >
        <div className="absolute inset-0 grayscale brightness-50 contrast-125">
          <img 
            src={stepVisuals[step - 1].image} 
            className="w-full h-full object-cover transition-transform duration-[10000ms] hover:scale-110"
            alt="Step Visual"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 max-w-md space-y-8 text-white">
          <div className="w-12 h-[1px] bg-white" />
          <h2 className="text-5xl font-bold uppercase tracking-tighter leading-none">
            {stepVisuals[step - 1].quote}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/60 leading-relaxed">
            {stepVisuals[step - 1].desc}
          </p>
        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-6">
          <span className="text-[9px] font-black uppercase tracking-[1em] text-white/40">Step 0{step}</span>
        </div>
      </motion.div>

      {/* Right Side: High-Visibility Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 relative h-full overflow-hidden">
        <div className="w-full max-w-xl flex flex-col justify-center h-full max-h-[800px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-zinc-500">
                  {steps[step - 1].icon}
                  <div className="h-[1px] w-12 bg-zinc-200" />
                </div>
                <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.8] mb-4">
                  {steps[step - 1].title}
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                  {steps[step - 1].subtitle}
                </p>
              </div>

              <div className="pt-4">
                {step === 1 && (
                  <div className="space-y-8">
                    <textarea 
                      placeholder="YOUR BIO"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-transparent border-b border-zinc-400 py-4 text-xl focus:border-black transition-all outline-none font-light placeholder:text-zinc-200 h-32 resize-none"
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                    <div className="flex flex-wrap gap-3">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all ${
                            formData.interests.includes(interest)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-zinc-500 border-zinc-300 hover:border-black'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10">
                    <div className="space-y-6 p-10 bg-zinc-50 border border-zinc-300">
                      <p className="text-base font-light leading-relaxed text-zinc-600 italic">
                        "I agree to follow the community guidelines and be respectful to others."
                      </p>
                      <label className="flex items-center gap-6 cursor-pointer group pt-6 border-t border-zinc-200">
                        <input
                          type="checkbox"
                          checked={!!formData.agreedToEthics}
                          onChange={() => setFormData({ ...formData, agreedToEthics: !formData.agreedToEthics })}
                          className="sr-only"
                        />
                        <div
                          aria-hidden="true"
                          className={`w-8 h-8 border flex items-center justify-center transition-all pointer-events-none ${
                            formData.agreedToEthics ? 'bg-black border-black text-white' : 'border-zinc-300 group-hover:border-black'
                          }`}
                        >
                          {formData.agreedToEthics && <Check className="w-5 h-5" />}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">I Agree</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center pb-4">
                  {error}
                </p>
              )}

              <div className="pt-12 flex justify-between items-center border-t border-zinc-100">
                <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1 || loading}
                  className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400 hover:text-black transition-colors disabled:opacity-0"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={
                    loading || 
                    (step === 1 && !formData.bio) || 
                    (step === 2 && formData.interests.length === 0) || 
                    (step === 3 && !formData.agreedToEthics)
                  }
                  className="bg-black text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all disabled:opacity-20 flex items-center gap-4 group"
                >
                  {step === 3 ? (loading ? 'Finalizing...' : 'Finalize') : 'Next'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
