import React from 'react';
import { Clock, Eye, Bookmark, Check, Calendar } from 'lucide-react';
import { Post } from '../types/index.js';
import { calculateReadingTime } from '../utils/readingTime.js';

interface ArticleCardProps {
  post: Post;
  onClick: () => void;
  featured?: boolean;
  onBookmarkToggle?: (postId: number, e: React.MouseEvent) => void;
  isBookmarked?: boolean;
  wpm?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  onClick,
  featured = false,
  onBookmarkToggle,
  isBookmarked = false,
  wpm = 200
}) => {
  const readingTimeMinutes = calculateReadingTime(post.content || post.excerpt || '', wpm);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  if (featured) {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-md hover:shadow-xl bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Cover Image */}
          <div className="lg:col-span-7 relative aspect-16/9 lg:aspect-auto overflow-hidden bg-slate-200 dark:bg-slate-900 min-h-[260px]">
            <img
              src={post.cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:hidden" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-sm"
                style={{ backgroundColor: post.category_color || '#10b981' }}
              >
                {post.category_name || 'Berita Utama'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-md border border-amber-500/30">
                ⭐ Utama
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTimeMinutes} mnt baca
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-3">
                {post.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{post.views} pembaca</span>
              </div>

              {onBookmarkToggle && (
                <button
                  onClick={(e) => onBookmarkToggle(post.id, e)}
                  className={`p-2 rounded-xl transition-all border flex items-center gap-1 text-xs font-semibold ${
                    isBookmarked
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                  title={isBookmarked ? 'Artikel Disimpan' : 'Simpan Artikel'}
                >
                  {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800"
    >
      <div>
        {/* Thumbnail */}
        <div className="relative aspect-16/9 overflow-hidden bg-slate-200 dark:bg-slate-900">
          <img
            src={post.cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-xs"
              style={{ backgroundColor: post.category_color || '#10b981' }}
            >
              {post.category_name || 'Berita'}
            </span>
          </div>
          
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-200 text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{readingTimeMinutes} mnt</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <span>{formattedDate}</span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <Eye className="w-3.5 h-3.5" />
          <span>{post.views} views</span>
        </div>

        {onBookmarkToggle && (
          <button
            onClick={(e) => onBookmarkToggle(post.id, e)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-emerald-500 text-black'
                : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Tersimpan' : 'Simpan'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
