import React from 'react';
import { Eye, Clock, User, ArrowRight, BookOpen } from 'lucide-react';
import { Post } from '../types';
import { calculateReadingTime } from '../utils/readingTime';

interface Props {
  post: Post;
  onSelectPost: (slug: string) => void;
}

export const ArticleCard: React.FC<Props> = ({ post, onSelectPost }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const readingTime = calculateReadingTime(post.content || post.excerpt);

  return (
    <div
      onClick={() => onSelectPost(post.slug)}
      className="group bg-[#16181d] rounded-2xl border border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90"
          loading="lazy"
        />

        {/* Category Badge */}
        {post.category_name && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded-lg shadow-sm backdrop-blur-md"
              style={{ backgroundColor: post.category_color || '#3b82f6' }}
            >
              {post.category_name}
            </span>
          </div>
        )}
      </div>

      {/* Post Meta & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 mb-2.5 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {post.author_name || 'Redaksi'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
              <BookOpen className="w-3 h-3" />
              {readingTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {post.views}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {post.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
          <span>Baca Selengkapnya</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
