import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Camera,
  X,
  Briefcase,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { updateMe, emitProfileUpdated, ApiError } from '../../lib/api';
import { User, UserSocials } from '../../types';
import SocialLinksManager from '../SocialLinksManager';
import { PRESET_AVATARS, AVAILABLE_INTERESTS } from './constants';
import { userAvatar } from '../../lib/avatar';
import { realName } from '../../lib/userDisplay';

interface ProfileEditorProps {
  profile: User | null;
  authUser: FirebaseUser | null;
  onBack: () => void;
}

interface ProfileForm {
  displayName: string;
  nickname: string;
  photoURL: string;
  bio: string;
  occupation: string;
  location: string;
  interests: string[];
  persona: string;
  socials: UserSocials;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, authUser, onBack }) => {
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: '',
    nickname: '',
    photoURL: '',
    bio: '',
    occupation: '',
    location: '',
    interests: [],
    persona: '',
    socials: {}
  });
  const [customInterest, setCustomInterest] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    const fallbackPhoto = userAvatar({
      uid: authUser?.uid,
      photoURL: authUser?.photoURL,
      email: authUser?.email,
    });
    setProfileForm({
      displayName: profile?.displayName || authUser?.displayName || realName(authUser?.displayName, authUser?.email),
      nickname: profile?.nickname || '',
      photoURL: profile?.photoURL || fallbackPhoto,
      bio: profile?.bio || '',
      occupation: profile?.occupation || '',
      location: profile?.location || '',
      interests: profile?.interests || [],
      persona: profile?.persona || '',
      socials: profile?.socials || {}
    });
  }, [profile, authUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      await updateProfile(auth.currentUser, {
        displayName: profileForm.displayName,
        photoURL: profileForm.photoURL
      });

      await updateMe({
        displayName: profileForm.displayName.trim(),
        photoURL: profileForm.photoURL,
        bio: profileForm.bio,
        occupation: profileForm.occupation,
        location: profileForm.location,
        interests: profileForm.interests,
        persona: profileForm.persona,
        socials: profileForm.socials
      });
      emitProfileUpdated();

      setProfileSuccessMsg('Profile and companion context updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setProfileErrorMsg(err instanceof ApiError ? err.message : 'Failed to save changes. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfileForm(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleAddCustomInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customInterest.trim();
    if (trimmed && !profileForm.interests.includes(trimmed)) {
      setProfileForm(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
      setCustomInterest('');
    }
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="pb-24"
    >
      {/* Sub-header Navigation */}
      <header className="px-8 md:px-12 py-10 border-b border-zinc-100 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Step: Profile Info</span>
        </div>
      </header>

      <main className="px-8 md:px-12 py-12 max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-2">Account Customization</span>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Profile Information</h1>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-2">
            Update your public identity, avatar, companion call name, socials, website, and persona context for familiar AI characters.
          </p>
        </div>

        {/* Status Notifications */}
        {profileSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold uppercase tracking-wide">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {profileErrorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{profileErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-10">
          {/* 1. Avatar Customization */}
          <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-6">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
              Profile Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <img
                  src={profileForm.photoURL || PRESET_AVATARS[0]}
                  alt="Preview"
                  className="w-28 h-28 rounded-3xl object-cover shadow-lg border-2 border-white"
                />
                <label className="absolute inset-0 bg-black/50 text-white rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <p className="text-xs text-zinc-500 font-medium">Choose a preset avatar or upload your own custom photo.</p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, photoURL: url }))}
                      className={cn(
                        "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all",
                        profileForm.photoURL === url ? "border-black scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                    Or Image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileForm.photoURL.startsWith('http') ? profileForm.photoURL : ''}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, photoURL: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-mono outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Names & Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                required
                placeholder="e.g. Alex Mercer"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
              />
              <p className="text-[10px] text-zinc-400 font-medium">Your primary public name across the app.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
                  Username (Nickname)
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                  Permanent
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm select-none">@</span>
                <input
                  type="text"
                  value={profileForm.nickname ? profileForm.nickname.replace(/^@/, '') : ''}
                  readOnly
                  disabled
                  placeholder="user_handle"
                  className="w-full bg-zinc-100/80 text-zinc-500 cursor-not-allowed border border-zinc-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-medium outline-none select-none"
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Auto-generated unique username. Permanent and cannot be changed.</p>
            </div>
          </div>

          {/* 3. Occupation & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Occupation / Role
              </label>
              <input
                type="text"
                value={profileForm.occupation}
                onChange={(e) => setProfileForm(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="e.g. Architect, Astrophysicist, Software Engineer"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
              />
              <p className="text-[10px] text-zinc-400 font-medium">Familiar companions will understand your work and career context.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Location / City
              </label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Tokyo, Japan / London, UK"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
              />
              <p className="text-[10px] text-zinc-400 font-medium">Where you are located in the world.</p>
            </div>
          </div>

          {/* 4. Bio / About You */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
                About You / Bio
              </label>
              <span className="text-[10px] font-mono text-zinc-400">{profileForm.bio.length}/500</span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              placeholder="Tell your story, your background, or what you enjoy discussing..."
              value={profileForm.bio}
              onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          {/* 5. Website & Social Media Links (Extended + Custom links) */}
          <SocialLinksManager
            socials={profileForm.socials}
            onChange={(newSocials) => setProfileForm(prev => ({ ...prev, socials: newSocials }))}
          />

          {/* 6. Interests & Passions */}
          <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
                Interests & Passions
              </label>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                Characters with familiarity enabled can reference your interests in conversation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    profileForm.interests.includes(interest)
                      ? "bg-black text-white shadow-sm"
                      : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  {interest} {profileForm.interests.includes(interest) && '✓'}
                </button>
              ))}
              {profileForm.interests.filter(i => !AVAILABLE_INTERESTS.includes(i)).map(custom => (
                <button
                  key={custom}
                  type="button"
                  onClick={() => toggleInterest(custom)}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white shadow-sm flex items-center gap-1.5"
                >
                  {custom} <X className="w-3 h-3" />
                </button>
              ))}
            </div>

            {/* Add Custom Tag */}
            <div className="flex gap-2 max-w-sm pt-2">
              <input
                type="text"
                placeholder="Add custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={handleAddCustomInterest}
                className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:border-black flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* 7. Personal Quirks / Known Facts */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
              Personal Quirks & AI Context (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Night owl, drinks black coffee, has a Siberian husky named Luna, working on a novel..."
              value={profileForm.persona}
              onChange={(e) => setProfileForm(prev => ({ ...prev, persona: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none resize-none"
            />
            <p className="text-[10px] text-zinc-400 font-medium">
              Familiar companions can naturally remember and bring up these details.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full sm:w-auto bg-black text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </main>
    </motion.div>
  );
};

export default ProfileEditor;