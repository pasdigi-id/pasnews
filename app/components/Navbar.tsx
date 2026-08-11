import React, { useState, useEffect } from 'react';
import { Newspaper, Layers, Code, Shield, User as UserIcon, LogOut, Bookmark, Sun, Moon, Settings, Menu, X, Flame } from 'lucide-react';
import { User, SystemSettings, MenuItem } from '../types/index.js';
import { ThemeToggle } from './ThemeToggle.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenArchitecture: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  settings?: SystemSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenLogin,
  onLogout,
  onOpenArchitecture,
  theme,
  onToggleTheme,
  settings
}) => {
  const [headerMenus, setHeaderMenus] = useState<MenuItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/menus?location=header')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setHeaderMenus(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const siteTitle = settings?.site_title || 'BeritaAnda';

  const handleMenuClick = (url: string) => {
    setIsMobileMenuOpen(false);
    if (url.startsWith('/category/')) {
      const slug = url.replace('/category/', '');
      onNavigate('category', slug);
    } else if (url.startsWith('/page/')) {
      const slug = url.replace('/page/', '');
      onNavigate('page', slug);
    } else if (url === '/') {
      onNavigate('home');
    } else if (url === '/api-docs') {
      onNavigate('api-docs');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md transition-colors border-b duration-200 bg-white/90 border-slate-200 text-slate-900 dark:bg-[#0f1115]/90 dark:border-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block leading-tight text-slate-900 dark:text-white">
                  {siteTitle}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase hidden sm:block">
                  Portal Berita & SSR Engine
                </span>
              </div>
            </button>
          </div>

          {/* Dynamic Navigation Links - Public Area */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Berita Utama
            </button>

            {headerMenus.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.url)}
                className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors whitespace-nowrap"
              >
                {m.title}
              </button>
            ))}

            <button
              onClick={() => onNavigate('api-docs')}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentView === 'api-docs'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-purple-500" />
              <span>API Integrasi</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Arsitektur SSR</span>
            </button>
          </nav>

          {/* Controls: Role Area Buttons, Theme Switcher, Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            {/* Member Area Quick Access */}
            {user?.role === 'member' && (
              <button
                onClick={() => onNavigate('member-dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  currentView === 'member-dashboard'
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Area Member</span>
              </button>
            )}

            {/* Admin Area Quick Access */}
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  currentView === 'admin'
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Area Redaksi/Admin</span>
              </button>
            )}

            {/* User Account or Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] leading-tight line-clamp-1">{user.name}</div>
                    <div className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk Role</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Hamburger Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1115] px-4 py-4 space-y-2 animate-fade-in">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigate('home');
            }}
            className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Berita Utama
          </button>

          {headerMenus.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMenuClick(m.url)}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {m.title}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('api-docs');
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              <span>Dokumentasi API</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenArchitecture();
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Arsitektur SSR Security</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
