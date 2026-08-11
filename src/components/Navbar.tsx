import React from 'react';
import { Search, Layers, Shield, Key, LogOut, Code } from 'lucide-react';
import { CacheStatusBadge } from './CacheStatusBadge';
import { Category, User } from '../types';

interface Props {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: User | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onNavigatePage: (page: 'home' | 'admin' | 'api-docs') => void;
  currentPage: string;
  cacheStatus: 'HIT' | 'MISS' | null;
  onOpenArchModal: () => void;
  onCachePurged: () => void;
}

export const Navbar: React.FC<Props> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  user,
  onOpenLoginModal,
  onLogout,
  onNavigatePage,
  currentPage,
  cacheStatus,
  onOpenArchModal,
  onCachePurged
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f1115]/95 backdrop-blur-md border-b border-slate-800 shadow-md text-slate-200">
      {/* Top Banner Bar */}
      <div className="bg-[#0a0a0b] text-slate-400 text-xs py-1.5 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-400">BeritaAnda.com</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">Platform Berita High-Performance (HonoJS + HonoX + SQLite)</span>
          </div>

          <div className="flex items-center gap-3">
            <CacheStatusBadge cacheStatus={cacheStatus} onCachePurged={onCachePurged} />
            
            <button
              onClick={onOpenArchModal}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full"
            >
              <Layers className="w-3 h-3" />
              <span>Plan Arsitektur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button
            onClick={() => {
              onSelectCategory(null);
              onNavigatePage('home');
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              BA
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block leading-tight">
                Berita<span className="text-emerald-400">Anda</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                PORTAL BERITA TERKINI & TERPERCAYA
              </span>
            </div>
          </button>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <button
                onClick={() => onNavigatePage('admin')}
                className="px-3 py-1.5 bg-emerald-500 text-black rounded-lg text-xs font-bold"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-emerald-500 text-black rounded-lg text-xs font-bold"
              >
                Login Admin
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentPage !== 'home') onNavigatePage('home');
            }}
            placeholder="Cari artikel berita..."
            className="w-full pl-9 pr-4 py-2 bg-[#16181d] text-slate-200 placeholder-slate-500 text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-hidden transition-all shadow-inner"
          />
        </div>

        {/* Action Buttons & Profile */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigatePage('api-docs')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPage === 'api-docs'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-[#16181d] hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Third-Party API Docs</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigatePage('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 'admin'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-[#16181d] hover:bg-slate-800 text-white border border-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>

              <button
                onClick={onLogout}
                title="Logout Redaksi"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors border border-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Login Editor/Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Bar */}
      <div className="border-t border-slate-800/80 bg-[#0a0a0b] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5 min-w-max text-xs">
          <button
            onClick={() => {
              onSelectCategory(null);
              onNavigatePage('home');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === null && currentPage === 'home'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Semua Berita
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.slug);
                onNavigatePage('home');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === cat.slug && currentPage === 'home'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color || '#10b981' }}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
