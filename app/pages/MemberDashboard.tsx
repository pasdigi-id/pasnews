import React, { useState, useEffect } from 'react';
import { User, Bookmark, History, FileText, UserCheck, Check, Clock, Plus, Trash2, Send } from 'lucide-react';
import { User as UserType, Post, SystemSettings } from '../types/index.js';
import { ArticleCard } from '../components/ArticleCard.js';

interface MemberDashboardProps {
  user: UserType;
  onSelectPost: (post: Post) => void;
  settings?: SystemSettings | null;
  onUpdateUser: (updatedUser: UserType) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  onSelectPost,
  settings,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'submissions' | 'profile'>('bookmarks');
  
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Post[]>([]);

  // Submissions form state
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subCategory, setSubCategory] = useState(1);
  const [subContent, setSubContent] = useState('');
  const [subMsg, setSubMsg] = useState('');

  // Profile update state
  const [profileName, setProfileName] = useState(user.name);
  const [profileAvatar, setProfileAvatar] = useState(user.avatar || '');
  const [profileMsg, setProfileMsg] = useState('');

  const [loading, setLoading] = useState(true);

  const enableSubmissions = settings?.enable_member_submissions !== 'false';

  const fetchMemberData = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [bmRes, histRes, subRes] = await Promise.all([
        fetch('/api/member/bookmarks', { headers }).then((r) => r.json()),
        fetch('/api/member/history', { headers }).then((r) => r.json()),
        fetch('/api/member/submissions', { headers }).then((r) => r.json())
      ]);

      if (bmRes.success) setBookmarks(bmRes.data || []);
      if (histRes.success) setHistoryItems(histRes.data || []);
      if (subRes.success) setSubmissions(subRes.data || []);
    } catch (err) {
      console.error('Error loading member data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  const handleRemoveBookmark = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/member/bookmarks/${postId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMemberData();
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subContent.trim()) return;

    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch('/api/member/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: subTitle,
        category_id: subCategory,
        content: subContent
      })
    });

    const data = await res.json();
    if (data.success) {
      setSubTitle('');
      setSubContent('');
      setSubMsg('Draft artikel berhasil dikirim ke Redaksi!');
      setIsSubmitFormOpen(false);
      fetchMemberData();
    } else {
      setSubMsg(data.message || 'Gagal mengirim draft.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch('/api/member/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: profileName,
        avatar: profileAvatar
      })
    });

    const data = await res.json();
    if (data.success && data.user) {
      onUpdateUser(data.user);
      setProfileMsg('Profil berhasil diperbarui!');
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black uppercase">
                Member Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {enableSubmissions && (
          <button
            onClick={() => setIsSubmitFormOpen(!isSubmitFormOpen)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Draft Artikel</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Artikel Disimpan ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Bacaan ({historyItems.length})</span>
        </button>

        {enableSubmissions && (
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Daftar Pengajuan Kontribusi ({submissions.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil & Preferensi Member</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border bg-slate-50 dark:bg-[#0f1115] border-slate-200 dark:border-slate-800 text-slate-500">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="text-sm font-semibold">Belum ada artikel yang Anda simpan.</p>
              <p className="text-xs text-slate-400 mt-1">Klik ikon bookmark pada artikel di Halaman Utama untuk menyimpannya ke sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((p) => (
                <ArticleCard
                  key={p.id}
                  post={p}
                  onClick={() => onSelectPost(p)}
                  onBookmarkToggle={(id, e) => handleRemoveBookmark(id, e)}
                  isBookmarked={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reading History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Belum ada riwayat bacaan artikel.
            </p>
          ) : (
            historyItems.map((h) => (
              <div
                key={h.id}
                onClick={() => onSelectPost({ id: h.post_id, title: h.title, slug: h.slug, content: '', excerpt: h.excerpt, category_id: 1, author_id: 1, status: 'published', views: 0, created_at: '', updated_at: '' })}
                className="p-4 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-between bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800"
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{h.title}</h4>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    Dibaca pada: {new Date(h.read_at).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Member Submissions Form & List */}
      {activeTab === 'submissions' && enableSubmissions && (
        <div className="space-y-6">
          {isSubmitFormOpen && (
            <form onSubmit={handleCreateSubmission} className="p-6 rounded-2xl border space-y-4 bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Form Pengajuan Draft Berita Member</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Judul Artikel
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Tuliskan judul berita..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Isi Artikel Lengkap
                </label>
                <textarea
                  rows={6}
                  value={subContent}
                  onChange={(e) => setSubContent(e.target.value)}
                  placeholder="Tulis opini, fakta, atau laporan Anda..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirimkan untuk Ditinjau Redaksi</span>
              </button>
            </form>
          )}

          <div className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Belum ada draft artikel yang pernah Anda ajukan.
              </p>
            ) : (
              submissions.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{s.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                      Status: {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{s.excerpt}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-xl p-6 rounded-2xl border space-y-4 bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pengaturan Profil Member</h3>
          {profileMsg && <div className="p-2 text-xs font-semibold text-emerald-400">{profileMsg}</div>}

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
              URL Foto Avatar
            </label>
            <input
              type="url"
              value={profileAvatar}
              onChange={(e) => setProfileAvatar(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan Profil</span>
          </button>
        </form>
      )}

    </div>
  );
};
