import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { User } from '../../types';

export function hasFilledAnyProfile(u: User): boolean {
  const interests = u.interests?.length ?? 0;
  const customAvatar = u.photoURL && !/^(https:\/\/api\.dicebear\.com|data:)/i.test(u.photoURL);
  return !!(
    (u.bio && u.bio.trim()) ||
    customAvatar ||
    (u.nickname && u.nickname.trim()) ||
    (u.persona && u.persona.trim()) ||
    (u.location && u.location.trim()) ||
    (u.occupation && u.occupation.trim()) ||
    interests > 0 ||
    (u.socials && Object.keys(u.socials).length > 0)
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}

interface RequireAuthProps {
  user: User | null;
  initializing: boolean;
  children?: React.ReactNode;
}

/**
 * Route guard that requires user to be authenticated.
 * If not authenticated, redirects to /login with state preserved.
 * If user has not completed onboarding, redirects to /onboarding.
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ user, initializing, children }) => {
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const onboardingPending = !user.onboardingCompleted && !hasFilledAnyProfile(user);
  if (onboardingPending && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

interface RequireOnboardingProps {
  user: User | null;
  initializing: boolean;
  children: React.ReactNode;
}

/**
 * Route guard specifically for /onboarding.
 * If not logged in, redirects to /login.
 * If already completed onboarding, redirects to /home.
 */
export const RequireOnboarding: React.FC<RequireOnboardingProps> = ({ user, initializing, children }) => {
  if (initializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const completed = user.onboardingCompleted || hasFilledAnyProfile(user);
  if (completed) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  user: User | null;
  initializing: boolean;
  children: React.ReactNode;
}

/**
 * Route guard for public auth pages like /login and /register,
 * redirecting logged-in users to their destination or /home.
 */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ user, initializing, children }) => {
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (user) {
    const onboardingPending = !user.onboardingCompleted && !hasFilledAnyProfile(user);
    if (onboardingPending) {
      return <Navigate to="/onboarding" replace />;
    }
    const from = (location.state as any)?.from?.pathname || '/home';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
