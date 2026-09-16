import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { friendlyAuthError } from '../../lib/firebaseErrors';
import {
  sendEmailVerification,
  updateEmail,
  User as FirebaseUser
} from 'firebase/auth';

interface AccountPanelProps {
  onBack: () => void;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');

  const handleSendEmailVerification = async () => {
    if (!auth.currentUser) return;
    setSendingVerification(true);
    setEmailSuccessMsg('');
    setEmailErrorMsg('');

    try {
      await sendEmailVerification(auth.currentUser);
      setEmailSuccessMsg(`Verification email successfully sent to ${auth.currentUser.email}. Please check your inbox and spam folder.`);
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      if (err?.code === 'auth/too-many-requests') {
        setEmailErrorMsg('Too many requests sent. Please wait a few moments before requesting another verification email.');
      } else {
        setEmailErrorMsg(friendlyAuthError(err));
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRefreshUser = async () => {
    if (!auth.currentUser) return;
    setRefreshingUser(true);
    setEmailSuccessMsg('');
    setEmailErrorMsg('');

    try {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        setEmailSuccessMsg('Status updated: Your email is verified!');
      } else {
        setEmailSuccessMsg('Status refreshed: Email is still awaiting verification.');
      }
      setTimeout(() => setEmailSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error reloading user:', err);
      setEmailErrorMsg('Could not refresh status. Please try again.');
    } finally {
      setRefreshingUser(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const emailToSet = newEmailInput.trim();
    if (!emailToSet) return;

    setUpdatingEmail(true);
    setEmailSuccessMsg('');
    setEmailErrorMsg('');

    try {
      await updateEmail(auth.currentUser, emailToSet);
      setEmailSuccessMsg(`Email successfully updated to ${emailToSet}!`);
      setNewEmailInput('');
      setCurrentUser(auth.currentUser);
    } catch (err: any) {
      console.error('Error updating email:', err);
      if (err?.code === 'auth/requires-recent-login') {
        setEmailErrorMsg('Security measure: Changing your email requires a recent sign-in. Please log out and sign back in to change your email.');
      } else if (err?.code === 'auth/invalid-email') {
        setEmailErrorMsg('Please enter a valid email address.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setEmailErrorMsg('This email address is already linked to another account.');
      } else {
        setEmailErrorMsg(friendlyAuthError(err));
      }
    } finally {
      setUpdatingEmail(false);
    }
  };

  const isGoogleProvider = currentUser?.providerData?.some(p => p.providerId === 'google.com');
  const isEmailVerified = currentUser?.emailVerified;
  const currentEmail = currentUser?.email || 'No email connected';

  return (
    <motion.div
      key="email"
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
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Step: Email Address</span>
        </div>
      </header>

      <main className="px-8 md:px-12 py-12 max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-2">Security & Credentials</span>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Email Address</h1>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-2">
            View and manage your connected email address, verification status, and authentication security.
          </p>
        </div>

        {/* Status Notifications */}
        {emailSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold uppercase tracking-wide">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
        )}

        {emailErrorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{emailErrorMsg}</span>
          </div>
        )}

        {/* 1. Primary Email Card */}
        <div className="p-8 md:p-10 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Connected Primary Email</span>
              <h3 className="text-2xl md:text-3xl font-mono font-bold text-black break-all">{currentEmail}</h3>
            </div>

            {isEmailVerified ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Address</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 w-fit">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Verification Pending</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-200/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Sign-in Provider</span>
              <p className="text-sm font-bold text-black uppercase tracking-wider mt-1">
                {isGoogleProvider ? 'Google Authentication (SSO)' : 'Email & Password'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Account ID (UID)</span>
              <p className="text-xs font-mono text-zinc-600 mt-1 truncate">{currentUser?.uid || 'Unknown'}</p>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="flex flex-wrap gap-4 pt-2">
            {!isEmailVerified && (
              <button
                type="button"
                disabled={sendingVerification}
                onClick={handleSendEmailVerification}
                className="bg-black text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm"
              >
                {sendingVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Verification Email
              </button>
            )}

            <button
              type="button"
              disabled={refreshingUser}
              onClick={handleRefreshUser}
              className="bg-white border border-zinc-200 text-zinc-800 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", refreshingUser && "animate-spin")} />
              Refresh Verification Status
            </button>
          </div>
        </div>

        {/* 2. Provider Guidance or Change Email */}
        {isGoogleProvider ? (
          <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-black" />
              <h4 className="text-base font-bold uppercase tracking-tight">Managed via Google SSO</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Because your account was created with Google Single Sign-On, your email address is linked directly to your Google identity. To change your primary email, update it within your Google Account settings.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdateEmail} className="p-8 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-6">
            <div className="space-y-1">
              <h4 className="text-lg font-bold uppercase tracking-tight">Update Email Address</h4>
              <p className="text-xs text-zinc-400 font-medium">
                Enter a new email address. A confirmation notice will be sent.
              </p>
            </div>

            <div className="space-y-2 max-w-lg">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block">
                New Email Address
              </label>
              <input
                type="email"
                required
                placeholder="new-email@example.com"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingEmail || !newEmailInput.trim()}
              className="bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {updatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Update Email Address
            </button>
          </form>
        )}

        {/* 3. Account History / Meta */}
        <div className="p-8 bg-white border border-zinc-200 rounded-3xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Timestamps</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 font-mono">Created:</span>{' '}
              <span className="font-bold text-zinc-800">{currentUser?.metadata.creationTime || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-mono">Last Sign In:</span>{' '}
              <span className="font-bold text-zinc-800">{currentUser?.metadata.lastSignInTime || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default AccountPanel;