import React, { useState } from 'react';
import { Upload, X, CheckCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Category, Post } from '../types';

interface Props {
  categories: Category[];
  token: string;
  initialPost?: Post | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminPostForm: React.FC<Props> = ({
  categories,
  token,
  initialPost,
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialPost?.category_id || (categories[0]?.id ?? 1)
  );
  const [status, setStatus] = useState<'published' | 'draft'>(
    initialPost?.status || 'published'
  );
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Image Upload using Backend Upload Service
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setCoverImage(data.data.url);
      } else {
        setErrorMsg(data.message || 'Gagal mengunggah gambar');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke Upload Service');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Judul dan Konten Wajib Diisi');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const endpoint = initialPost
      ? `/api/admin/posts/${initialPost.id}`
      : '/api/admin/posts';

    const method = initialPost ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category_id: categoryId,
          status,
          cover_image: coverImage,
          excerpt,
          content
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan artikel');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0f1115] text-slate-200 rounded-2xl border border-slate-800 shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>{initialPost ? 'Edit Artikel Redaksi' : 'Tulis Artikel Berita Baru'}</span>
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 bg-red-950/60 text-red-300 border border-red-800/80 rounded-xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Judul Utama Artikel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Perkembangan AI 2026 dan Dampak Ekonomi Digital..."
            className="w-full px-4 py-2.5 text-sm bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 transition-all font-semibold placeholder-slate-500"
            required
          />
        </div>

        {/* Category & Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Kategori Berita *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0f1115] text-slate-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Status Publikasi
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              className="w-full px-3.5 py-2.5 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500"
            >
              <option value="published" className="bg-[#0f1115] text-slate-200">Published (Langsung Tayang)</option>
              <option value="draft" className="bg-[#0f1115] text-slate-200">Draft (Simpan Sementara)</option>
            </select>
          </div>
        </div>

        {/* Image Upload Service Integration */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Gambar Sampul (Upload Service / Media URL)
          </label>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-3">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/... atau gunakan tombol Upload"
              className="flex-1 w-full px-3.5 py-2 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 placeholder-slate-500"
            />

            <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs border border-slate-800">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{uploading ? 'Mengunggah...' : 'Upload Gambar'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {coverImage && (
            <div className="relative aspect-21/9 rounded-xl overflow-hidden border border-slate-800 bg-[#16181d] max-h-48">
              <img
                src={coverImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Ringkasan Berita (Excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tulis ringkasan singkat artikel untuk ditampilkan di feed berita..."
            className="w-full px-3.5 py-2 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 placeholder-slate-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Isi Lengkap Artikel *
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan berita secara lengkap dan mendalam..."
            className="w-full px-4 py-3 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 font-mono leading-relaxed placeholder-slate-500"
            required
          />
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : initialPost ? 'Simpan Perubahan' : 'Terbitkan Artikel'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
