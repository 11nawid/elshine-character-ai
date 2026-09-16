/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { User } from './types';
import { auth } from './lib/firebase';
import { ensureUser, getMe, subscribeProfileUpdated } from './lib/api';
import { realName } from './lib/userDisplay';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Discover from './components/Discover';
import Create from './components/Create';
import Chats from './components/Chats';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import AuthPage from './components/auth/AuthPage';
import { RequireAuth, RequireOnboarding, PublicOnlyRoute, LoadingScreen, hasFilledAnyProfile } from './components/auth/RouteGuards';
import * as Pages from './pages/ContentPages';
import { MobileNotice } from './components/MobileNotice';

/**
 * Main authenticated application layout:
 * Left-side navigation dock + main content viewport.
 */
function AppLayout() {
  return (
    <div className="flex bg-white h-[100dvh] overflow-hidden font-sans selection:bg-black selection:text-white w-full">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative bg-white h-[100dvh] max-h-[100dvh]">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      setInitializing(false);
      return;
    }
    try {
      await ensureUser();
    } catch (error) {
      console.warn('ensureUser failed:', error);
    }
    try {
      const profile = await getMe();
      setUser({
        uid: firebaseUser.uid,
        displayName: profile?.displayName || firebaseUser.displayName || realName(firebaseUser.displayName, firebaseUser.email),
        email: firebaseUser.email || profile?.email || '',
        photoURL: profile?.photoURL || firebaseUser.photoURL || undefined,
        bio: profile?.bio || '',
        createdAt: profile?.createdAt || Date.now(),
        ...(profile || {}),
      });
    } catch (error) {
      console.warn('getMe failed:', error);
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || realName(firebaseUser.displayName, firebaseUser.email),
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: Date.now(),
        onboardingCompleted: false,
      });
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        refreshUser();
      } else {
        setUser(null);
        setInitializing(false);
      }
    });
    const unsubscribeProfile = subscribeProfileUpdated(refreshUser);

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, [refreshUser]);

  return (
    <BrowserRouter>
      <MobileNotice />
      <Routes>
        {/* Root Route: Landing for guests, Home for authenticated users */}
        <Route
          path="/"
          element={
            initializing ? (
              <LoadingScreen />
            ) : !user ? (
              <Landing />
            ) : !user.onboardingCompleted && !hasFilledAnyProfile(user) ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Dedicated Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute user={user} initializing={initializing}>
              <AuthPage mode="login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute user={user} initializing={initializing}>
              <AuthPage mode="register" />
            </PublicOnlyRoute>
          }
        />

        {/* Onboarding Flow */}
        <Route
          path="/onboarding"
          element={
            <RequireOnboarding user={user} initializing={initializing}>
              {user && <Onboarding userId={user.uid} onComplete={refreshUser} />}
            </RequireOnboarding>
          }
        />

        {/* Authenticated Protected App Routes */}
        <Route element={<RequireAuth user={user} initializing={initializing}><AppLayout /></RequireAuth>}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Discover />} />
          <Route path="/discover" element={<Navigate to="/explore" replace />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:characterId" element={<Chats />} />
          <Route path="/create" element={<Create />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/:subpage" element={<Settings />} />
        </Route>

        {/* Informational Pages */}
        <Route path="/manifesto" element={<Pages.Manifesto />} />
        <Route path="/ethics" element={<Pages.Ethics />} />
        <Route path="/safety" element={<Pages.Safety />} />
        <Route path="/architecture" element={<Pages.Architecture />} />
        <Route path="/docs" element={<Pages.Docs />} />
        <Route path="/privacy" element={<Pages.Privacy />} />
        <Route path="/terms" element={<Pages.Terms />} />
        <Route path="/cookies" element={<Pages.Cookies />} />
        <Route path="/vision" element={<Pages.Vision />} />
        <Route path="/archive" element={<Pages.Archive />} />
        <Route path="/discover-more" element={<Pages.Discover />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}