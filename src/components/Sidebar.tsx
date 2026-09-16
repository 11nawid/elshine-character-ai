import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Compass, PlusSquare, MessageSquare, Settings, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AppState } from '../types';
import { auth } from '../lib/firebase';
import { userAvatar } from '../lib/avatar';

interface SidebarProps {
  activeView?: AppState['activeView'];
  onViewChange?: (view: AppState['activeView']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentActive = useMemo(() => {
    if (activeView) return activeView;
    const path = location.pathname;
    if (path.startsWith('/explore') || path.startsWith('/discover')) return 'discover';
    if (path.startsWith('/create')) return 'create';
    if (path.startsWith('/chats')) return 'chats';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  }, [activeView, location.pathname]);

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { id: 'discover', label: 'Explore', icon: Compass, path: '/explore' },
    { id: 'create', label: 'Create', icon: PlusSquare, path: '/create' },
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/chats' },
  ] as const;

  const handleNavigate = (id: AppState['activeView'], path: string) => {
    if (onViewChange) onViewChange(id);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="w-28 h-full bg-white border-r border-zinc-200 flex flex-col items-center py-6 z-[100] overflow-y-auto no-scrollbar shrink-0">
      {/* Brand Logo */}
      <div 
        onClick={() => handleNavigate('home', '/home')}
        className="mb-8 shrink-0 w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        title="Elshine Home"
      >
        <img src="/icon.png" alt="Elshine" className="w-full h-full object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 w-full shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id, item.path)}
              className={cn(
                "group relative flex flex-col items-center gap-1 transition-all duration-300 w-full",
                isActive ? "text-black" : "text-zinc-400 hover:text-zinc-800"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-300",
                isActive ? "bg-zinc-100" : "bg-transparent group-hover:bg-zinc-50"
              )}>
                <Icon className={cn("w-6 h-6 transition-transform duration-300", isActive && "scale-105")} strokeWidth={2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-0 w-1 h-10 bg-black rounded-l-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-4 pb-2 w-full items-center shrink-0 pt-6">
        <button 
          onClick={() => handleNavigate('settings', '/settings')}
          className={cn(
            "p-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 w-full",
            currentActive === 'settings' ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50"
          )}
        >
          <Settings className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Settings</span>
        </button>
        
        <div className="flex flex-col items-center gap-4 w-full pt-4 border-t border-zinc-100">
          <button 
            onClick={() => handleNavigate('profile', '/profile')}
            className={cn(
              "w-12 h-12 rounded-2xl border-2 p-0.5 transition-all duration-300",
              currentActive === 'profile' ? "border-black scale-105 shadow-lg" : "border-zinc-200 hover:border-zinc-400"
            )}
            title="Profile"
          >
            <img 
              src={userAvatar(auth.currentUser)} 
              alt="Profile" 
              className="w-full h-full rounded-xl object-cover"
            />
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-zinc-400 hover:text-red-500 transition-colors p-2 flex flex-col items-center gap-1"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
