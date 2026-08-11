import React from 'react';
import { ArticleCard } from '../components/ArticleCard';
import { Post, Category, SystemStats } from '../types';
import { Flame, Shield, Layers, RefreshCw, Zap, BookOpen } from 'lucide-react';
import { calculateReadingTime } from '../utils/readingTime';

interface Props {
  posts: Post[];
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onSelectPost: (slug: string) => void;
  stats: SystemStats | null;
  loading: boolean;
  onOpenArchModal: () => void;
  onNavigatePage: (page: 'home' | 'admin' | 'api-docs') => void;
}

export const Home: React.FC<Props> = ({
  posts,
  categories,
  activeCategory,
  onSelectCategory,
  onSelectPost,
  stats,
  loading,
  onOpenArchModal,
  onNavigatePage
}) => {
  const heroPost = posts[0];
  const remainingPosts = posts.slice(1);

  const activeCategoryObj = categories.find((c) => c.slug === activeCategory);

  return (
    <div className="space-y-10">
      {/* Category Title / Filter Banner */}
      {activeCategoryObj && (
        <div className="bg-[#0f1115] border border-slate-800 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            Kategori Terpilih
          </div>
          <h1 className="text-2xl font-black">{activeCategoryObj.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{activeCategoryObj.description}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2 font-medium text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Memuat berita terkini dari SQLite Edge DB...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#0f1115] rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">Tidak ada berita ditemukan untuk pencarian atau kategori ini.</p>
          <button
            onClick={() => onSelectCategory(null)}
            className="mt-4 px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Lihat Semua Berita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Featured Article (only when no category or search filter) */}
            {heroPost && !activeCategory && (
              <div
                onClick={() => onSelectPost(heroPost.slug)}
                className="group relative bg-[#0f1115] rounded-3xl overflow-hidden shadow-xl border border-slate-800 cursor-pointer transition-all duration-300 hover:border-slate-700 hover:scale-[1.005]"
              >
                <div className="aspect-16/9 sm:aspect-21/9 overflow-hidden relative bg-slate-900">
                  <img
                    src={heroPost.cover_image}
                    alt={heroPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-500 text-black text-[11px] font-black rounded-lg shadow-sm">
                      {heroPost.category_name || 'Utama'}
                    </span>
                    <span className="text-xs text-amber-400 font-mono">
                      🔥 TERPOPULER ({heroPost.views} views)
                    </span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <BookOpen className="w-3.5 h-3.5" />
                      {calculateReadingTime(heroPost.content || heroPost.excerpt)}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {heroPost.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {heroPost.excerpt}
                  </p>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Daftar Berita Terbaru</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(activeCategory ? posts : remainingPosts).map((post) => (
                  <ArticleCard key={post.id} post={post} onSelectPost={onSelectPost} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6">
            {/* System Performance Card */}
            {stats && (
              <div className="bg-[#0f1115] text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Statistik Performa Web
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    Hono + SQLite
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#16181d] p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Total Artikel</span>
                    <span className="text-base font-bold text-white">{stats.total_posts}</span>
                  </div>
                  <div className="bg-[#16181d] p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Total Pembaca</span>
                    <span className="text-base font-bold text-blue-400">{stats.total_views}</span>
                  </div>
                  <div className="bg-[#16181d] p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Cache Hits</span>
                    <span className="text-base font-bold text-emerald-400">{stats.cache_hits}</span>
                  </div>
                  <div className="bg-[#16181d] p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">API Keys</span>
                    <span className="text-base font-bold text-purple-400">{stats.total_api_keys}</span>
                  </div>
                </div>

                <button
                  onClick={onOpenArchModal}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inspeksi Diagram Plan</span>
                </button>
              </div>
            )}

            {/* Third-Party API Promo Banner */}
            <div className="bg-[#0f1115] text-white p-5 rounded-2xl border border-purple-800/50 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
                <Shield className="w-4 h-4" /> Integrasi Pihak Ketiga
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                Publikasikan Artikel Jarak Jauh via REST API
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kirim artikel baru dari aplikasi eksternal Anda menggunakan autentikasi header <code className="bg-purple-950 px-1.5 py-0.5 rounded text-purple-300 font-mono text-[11px] border border-purple-800/60">x-api-key</code>.
              </p>
              <button
                onClick={() => onNavigatePage('api-docs')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Uji Coba API Playground
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
