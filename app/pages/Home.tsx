import React, { useState } from 'react';
import { Search, Flame, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { Post, Category, SystemSettings } from '../types/index.js';
import { ArticleCard } from '../components/ArticleCard.js';
import { CacheStatusBadge } from '../components/CacheStatusBadge.js';
import { MetaSEO } from '../components/MetaSEO.js';

interface HomeProps {
  posts: Post[];
  categories: Category[];
  onSelectPost: (post: Post) => void;
  onBookmarkToggle?: (postId: number, e: React.MouseEvent) => void;
  bookmarkedIds?: Set<number>;
  cacheSource?: string;
  settings?: SystemSettings | null;
}

export const Home: React.FC<HomeProps> = ({
  posts,
  categories,
  onSelectPost,
  onBookmarkToggle,
  bookmarkedIds = new Set(),
  cacheSource = 'sqlite-db',
  settings
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const readingWpm = Number(settings?.reading_wpm || '200');
  const showHero = settings?.hero_banner !== 'false';
  const enableCache = settings?.enable_cache !== 'false';

  // Filter posts based on category and search query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category_id === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = showHero && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = showHero && featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="space-y-8 animate-fade-in">
      <MetaSEO
        title={settings?.site_title || 'BeritaAnda'}
        description={settings?.site_tagline || 'Portal berita dan media informasi terpercaya menyajikan kabar terkini, terakurat, dan mendalam.'}
        siteTitle={settings?.site_title || 'BeritaAnda'}
        type="website"
      />
      
      {/* Top Banner & Search Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 border overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#0a0a0c] border-slate-800 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings?.site_tagline || 'Portal Berita Terpercaya & SSR Engine'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Informasi Terkini dengan Akses Cepat & Keamanan Server-Side
          </h1>

          {/* Search Box */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita, topik AI, ekonomi digital, gaya hidup..."
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border bg-[#16181d]/90 text-white border-slate-700/80 focus:border-emerald-500 focus:outline-hidden placeholder-slate-400 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Category Pills & Cache Status Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Semua Berita
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: c.color || '#10b981' }}
              />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {enableCache && (
          <CacheStatusBadge source={cacheSource} responseTime={14} enabled={enableCache} />
        )}
      </div>

      {/* Featured Post (Hero Article) */}
      {featuredPost && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Artikel Sorotan Utama</span>
          </div>

          <ArticleCard
            post={featuredPost}
            onClick={() => onSelectPost(featuredPost)}
            featured={true}
            onBookmarkToggle={onBookmarkToggle}
            isBookmarked={bookmarkedIds.has(featuredPost.id)}
            wpm={readingWpm}
          />
        </section>
      )}

      {/* Articles Grid Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span>Katalog Berita & Artikel ({regularPosts.length})</span>
          </h2>
        </div>

        {regularPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border bg-slate-50 dark:bg-[#0f1115] border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada artikel yang cocok dengan pencarian Anda.
            </p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori Semua Berita.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((p) => (
              <ArticleCard
                key={p.id}
                post={p}
                onClick={() => onSelectPost(p)}
                onBookmarkToggle={onBookmarkToggle}
                isBookmarked={bookmarkedIds.has(p.id)}
                wpm={readingWpm}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
