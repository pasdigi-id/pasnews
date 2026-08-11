import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, Bookmark, Check, Share2, Sparkles } from 'lucide-react';
import { Post, Comment, SystemSettings, User } from '../types/index.js';
import { calculateReadingTime } from '../utils/readingTime.js';
import { CommentSection } from '../components/CommentSection.js';
import { MetaSEO } from '../components/MetaSEO.js';

interface ArticleDetailProps {
  post: Post;
  onBack: () => void;
  onBookmarkToggle?: (postId: number, e: React.MouseEvent) => void;
  isBookmarked?: boolean;
  settings?: SystemSettings | null;
  user?: User | null;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  post,
  onBack,
  onBookmarkToggle,
  isBookmarked = false,
  settings,
  user
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [viewsCount, setViewsCount] = useState<number>(post.views || 0);
  const [copiedShare, setCopiedShare] = useState(false);

  const readingWpm = Number(settings?.reading_wpm || '200');
  const enableComments = settings?.enable_comments !== 'false';
  const readingTimeMinutes = calculateReadingTime(post.content || '', readingWpm);

  useEffect(() => {
    // Record reading history if logged in as member
    if (user && post.id) {
      const token = localStorage.getItem('ba_jwt_token');
      if (token) {
        fetch(`/api/member/history/${post.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    }

    // Fetch comments and view count for post
    fetch(`/api/posts/${post.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setComments(data.data.comments || []);
          if (data.data.views) setViewsCount(data.data.views);
        }
      })
      .catch((err) => console.error(err));
  }, [post.id, user]);

  const handleAddComment = async (commentData: { author_name: string; author_email: string; comment: string }) => {
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.message);

    // Refresh comments list
    const updatedRes = await fetch(`/api/posts/${post.id}`);
    const updatedData = await updatedRes.json();
    if (updatedData.success && updatedData.data) {
      setComments(updatedData.data.comments || []);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <MetaSEO
        title={post.title}
        description={post.excerpt || post.content?.substring(0, 160)}
        keywords={`${post.category_name || 'Berita'}, ${post.title.split(' ').slice(0, 5).join(', ')}`}
        image={post.cover_image || undefined}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at || post.created_at}
        authorName={post.author_name}
        categoryName={post.category_name}
        siteTitle={settings?.site_title || 'BeritaAnda'}
      />
      
      {/* Top Nav Back & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Berita Utama</span>
        </button>

        <div className="flex items-center gap-2">
          {onBookmarkToggle && (
            <button
              onClick={(e) => onBookmarkToggle(post.id, e)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-xs font-bold border transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
            title="Bagikan Tautan Artikel"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-xs"
            style={{ backgroundColor: post.category_color || '#10b981' }}
          >
            {post.category_name || 'Berita'}
          </span>

          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>Estimasi {readingTimeMinutes} menit baca</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {viewsCount} pembaca
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Oleh: {post.author_name || 'Redaksi BeritaAnda'}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative aspect-21/9 rounded-3xl overflow-hidden border shadow-md bg-slate-100 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Excerpt Box */}
      <div className="p-5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-200 text-sm font-semibold leading-relaxed">
        <Sparkles className="w-4 h-4 text-emerald-500 mb-1 inline-block mr-2" />
        <span>{post.excerpt}</span>
      </div>

      {/* Article Content Paragraphs */}
      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
        {post.content}
      </div>

      {/* Comment Section (Modular) */}
      <CommentSection
        postId={post.id}
        comments={comments}
        onAddComment={handleAddComment}
        enabled={enableComments}
      />

    </article>
  );
};
