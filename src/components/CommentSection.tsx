import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCircle } from 'lucide-react';
import { Comment } from '../types';

interface Props {
  postId: number;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
}

export const CommentSection: React.FC<Props> = ({ postId, comments, onCommentAdded }) => {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !commentText.trim()) {
      setErrorMsg('Harap isi semua bidang komentar');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName,
          author_email: authorEmail,
          comment: commentText
        })
      });

      const data = await res.json();
      if (data.success && data.comment) {
        onCommentAdded(data.comment);
        setCommentText('');
        setSuccessMsg('Komentar berhasil dipublikasikan!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.message || 'Gagal menambahkan komentar');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-[#0f1115] p-6 md:p-8 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">
          Komentar Pembaca ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-[#16181d] p-5 rounded-xl border border-slate-800 shadow-sm mb-8">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Tulis Komentar Tanggapan
        </h4>

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-950/60 text-red-300 border border-red-800/80 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nama Lengkap Anda *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-[#0a0a0b] text-slate-200 border border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 placeholder-slate-500"
            required
          />
          <input
            type="email"
            placeholder="Email Anda *"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-[#0a0a0b] text-slate-200 border border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 placeholder-slate-500"
            required
          />
        </div>

        <textarea
          rows={3}
          placeholder="Tuliskan pandangan atau tanggapan Anda mengenai artikel ini... *"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs bg-[#0a0a0b] text-slate-200 border border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 placeholder-slate-500 mb-3"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Belum ada komentar. Jadilah yang pertama memberikan pendapat!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-[#16181d] p-4 rounded-xl border border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  {c.author_name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(c.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-8">
                {c.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
