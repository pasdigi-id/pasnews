import React, { useEffect, useState } from 'react';
import { Post, Comment } from '../types';
import { CommentSection } from '../components/CommentSection';
import { Clock, Eye, User, ArrowLeft, RefreshCw, Share2, Check, BookOpen } from 'lucide-react';
import { calculateReadingTime } from '../utils/readingTime';

interface Props {
  slug: string;
  onBack: () => void;
  onSelectCategory: (slug: string) => void;
}

export const ArticleDetail: React.FC<Props> = ({ slug, onBack, onSelectCategory }) => {
  const [post, setPost] = useState<(Post & { comments?: Comment[]; cacheStatus?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/posts/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          setErrorMsg(data.message || 'Artikel tidak ditemukan');
        }
      })
      .catch(() => {
        if (isMounted) setErrorMsg('Gagal memuat detail artikel');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCommentAdded = (newComment: Comment) => {
    if (!post) return;
    setPost({
      ...post,
      comments: [newComment, ...(post.comments || [])]
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
        <span>Memuat konten berita...</span>
      </div>
    );
  }

  if (errorMsg || !post) {
    return (
      <div className="bg-[#0f1115] rounded-2xl border border-slate-800 p-12 text-center text-slate-300 max-w-xl mx-auto space-y-4">
        <p className="font-semibold text-sm">{errorMsg || 'Artikel tidak ditemukan'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="max-w-4xl mx-auto space-y-8 bg-[#0f1115] p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-md text-slate-300">
      {/* Back Button & Category Badge */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {post.category_name && (
          <button
            onClick={() => onSelectCategory(post.category_slug || '')}
            className="px-3 py-1 text-xs font-bold text-white rounded-lg shadow-xs"
            style={{ backgroundColor: post.category_color || '#3b82f6' }}
          >
            {post.category_name}
          </button>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
        {post.title}
      </h1>

      {/* Meta Author & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <img
            src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={post.author_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          <div>
            <span className="font-bold text-white block">{post.author_name || 'Redaksi BeritaAnda'}</span>
            <span className="text-[11px] text-slate-500">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            {readingTime}
          </span>

          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Eye className="w-4 h-4 text-slate-500" />
            {post.views} kali dibaca
          </span>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors font-medium text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
          </button>
        </div>
      </div>

      {/* Excerpt Lead */}
      <div className="p-4 bg-[#16181d] rounded-2xl border-l-4 border-emerald-500 text-sm font-medium text-slate-300 italic leading-relaxed">
        "{post.excerpt}"
      </div>

      {/* Cover Image */}
      <div className="aspect-16/9 rounded-2xl overflow-hidden border border-slate-800 shadow-sm bg-slate-900">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
        {post.content}
      </div>

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        comments={post.comments || []}
        onCommentAdded={handleCommentAdded}
      />
    </article>
  );
};
