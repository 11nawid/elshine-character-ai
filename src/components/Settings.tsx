import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  ChevronRight,
  LogOut,
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { getMe, subscribeProfileUpdated } from '../lib/api';
import { userAvatar } from '../lib/avatar';
import { realName, realUsername } from '../lib/userDisplay';
import { User } from '../types';
import { SettingsSubPage } from './settings/constants';
import ProfileEditor from './settings/ProfileEditor';
import AccountPanel from './settings/AccountPanel';
import { useParams, useNavigate } from 'react-router-dom';

export type { SettingsSubPage };

interface SettingsProps {
  initialSubPage?: SettingsSubPage;
  onNavigateSubPage?: (page: SettingsSubPage) => void;
}

const Settings: React.FC<SettingsProps> = ({ initialSubPage = 'main', onNavigateSubPage }) => {
  const { subpage: routeSubpage } = useParams<{ subpage?: string }>();
  const navigate = useNavigate();

  const resolvedSubPage: SettingsSubPage =
    routeSubpage === 'profile' || routeSubpage === 'email'
      ? routeSubpage
      : (initialSubPage || 'main');

  const [subPage, setSubPage] = useState<SettingsSubPage>(resolvedSubPage);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  // Sync subpage from URL parameter or initialSubPage
  useEffect(() => {
    if (routeSubpage === 'profile' || routeSubpage === 'email') {
      setSubPage(routeSubpage);
    } else if (!routeSubpage && initialSubPage) {
      setSubPage(initialSubPage);
    } else if (!routeSubpage) {
      setSubPage('main');
    }
  }, [routeSubpage, initialSubPage]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    let active = true;
    const loadProfile = () => {
      getMe()
        .then((profile) => {
          if (active) setUserProfile(profile);
        })
        .catch((err) => console.warn('Failed to load profile:', err));
    };
    loadProfile();
    const unsubscribeProfile = subscribeProfileUpdated(() => loadProfile());

    return () => {
      active = false;
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const handleSubPageChange = (newPage: SettingsSubPage) => {
    setSubPage(newPage);
    if (onNavigateSubPage) {
      onNavigateSubPage(newPage);
    }
    if (newPage === 'main') {
      navigate('/settings');
    } else {
      navigate(`/settings/${newPage}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const photoURL = userAvatar({
    uid: currentUser?.uid,
    photoURL: userProfile?.photoURL || currentUser?.photoURL,
    email: currentUser?.email,
  });
  const displayName = realName(userProfile?.displayName || currentUser?.displayName, currentUser?.email) || userProfile?.displayName || '';
  const username = realUsername(userProfile?.displayName || currentUser?.displayName, currentUser?.email, userProfile?.nickname);
  const isEmailVerified = currentUser?.emailVerified;
  const currentEmail = currentUser?.email || 'No email connected';

  return (
    <div className="flex-1 h-full bg-white font-sans text-black overflow-y-auto">
      {/* Dynamic Sub-Page Switcher */}
      <AnimatePresence mode="wait">
        {subPage === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="pb-24"
          >
            {/* Header */}
            <header className="px-8 md:px-12 py-16 border-b border-zinc-100 bg-white">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block">System Settings</span>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.85]">
                  Settings & <br /> Preferences.
                </h1>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">
                  Manage your personal identity, online presence, companion memory context, and account authentication.
                </p>
              </div>
            </header>

            {/* Main Settings Navigation List */}
            <main className="px-8 md:px-12 py-12 max-w-4xl mx-auto space-y-12">
              {/* Identity Snapshot Card */}
              <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6">
                <img
                  src={photoURL}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover grayscale shadow-md shrink-0"
                />
                <div className="space-y-1 text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h3 className="text-2xl font-bold uppercase tracking-tight">{displayName}</h3>
                    {userProfile?.nickname && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-200/70 px-2.5 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                        Call name: "{userProfile.nickname}"
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-xs font-mono">@{username} · {currentEmail}</p>
                  {(userProfile?.occupation || userProfile?.location) && (
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider pt-1 flex items-center justify-center md:justify-start gap-3">
                      {userProfile.occupation && <span>💼 {userProfile.occupation}</span>}
                      {userProfile.location && <span>📍 {userProfile.location}</span>}
                    </p>
                  )}
                  <p className="text-zinc-500 text-xs line-clamp-2 pt-1 font-medium">
                    {userProfile?.bio || 'No bio configured yet.'}
                  </p>
                </div>
              </div>

              {/* Primary Settings Pages */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-black rounded-full" />
                  <h2 className="text-xl font-bold tracking-tight uppercase">Account Management</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Profile Info Row */}
                  <button
                    onClick={() => handleSubPageChange('profile')}
                    className="group w-full flex items-center justify-between p-8 bg-zinc-50 border border-zinc-100 rounded-3xl text-left hover:bg-white hover:border-black hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold tracking-tight uppercase flex items-center gap-3">
                          Profile Info
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded-md">
                            {(userProfile?.interests || []).length} Interests
                          </span>
                        </h4>
                        <p className="text-zinc-400 text-xs font-medium">
                          Customize avatar, display name, companion nickname, social links, website, bio, and interests.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors hidden sm:inline-block">
                        Edit Profile
                      </span>
                      <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Email Address Row */}
                  <button
                    onClick={() => handleSubPageChange('email')}
                    className="group w-full flex items-center justify-between p-8 bg-zinc-50 border border-zinc-100 rounded-3xl text-left hover:bg-white hover:border-black hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold tracking-tight uppercase flex items-center gap-3">
                          Email Address
                          {isEmailVerified ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Unverified
                            </span>
                          )}
                        </h4>
                        <p className="text-zinc-400 text-xs font-mono">{currentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors hidden sm:inline-block">
                        Manage Email
                      </span>
                      <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Familiar Companion Intelligence Notice */}
              <section className="bg-zinc-950 p-10 md:p-12 rounded-3xl text-white space-y-6 shadow-xl">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Companion Memory & Familiarity</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">Privacy-Preserving Personalization</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
                    Your profile information, website, social handles, occupation, and notes are strictly protected. Only companions created with <strong className="text-white">"They know me already"</strong> enabled will have knowledge of your profile and social background.
                  </p>
                </div>
              </section>

              {/* Sign Out */}
              <section className="pt-8 border-t border-zinc-100 flex justify-between items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-8 py-4 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all"
                >
                  <LogOut className="w-4 h-4" /> Log Out of Account
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Version 2.6.0</span>
              </section>
            </main>
          </motion.div>
        )}

        {subPage === 'profile' && (
          <ProfileEditor
            profile={userProfile}
            authUser={currentUser}
            onBack={() => handleSubPageChange('main')}
          />
        )}

        {subPage === 'email' && (
          <AccountPanel onBack={() => handleSubPageChange('main')} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;