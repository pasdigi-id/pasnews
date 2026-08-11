import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { Comment } from '../types/index.js';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onAddComment: (commentData: { author_name: string; author_email: string; comment: string }) => Promise<void>;
  enabled?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  enabled = true
}) => {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  if (!enabled) {
    return (
      <div className="p-4 rounded-2xl border text-center text-xs bg-slate-100 dark:bg-[#0a0a0b] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        <MessageSquare className="w-5 h-5 mx-auto mb-1 opacity-50" />
        <span>Fitur komentar sedang dinonaktifkan oleh Administrator di Settings.</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !commentText.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment({
        author_name: authorName,
        author_email: authorEmail,
        comment: commentText
      });
      setCommentText('');
      setMsg('Komentar berhasil ditambahkan!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg('Gagal menambahkan komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base flex items-center gap-2 text-slate-900 dark:text-white">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          <span>Komentar Pembaca ({comments.length})</span>
        </h3>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl border space-y-4 bg-slate-50 dark:bg-[#0f1115] border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Misal: Ahmad Zaky"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Email *
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="ahmad@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Isi Komentar *
          </label>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Tulis tanggapan atau opini Anda secara santun..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
        </button>
      </form>

      {/* List of comments */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
            Belum ada komentar pada artikel ini. Jadilah yang pertama memberikan pendapat!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border space-y-1.5 bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>{c.author_name}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(c.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                {c.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
