import React, { useState } from 'react';
import { Sparkles, X, CheckCircle, FileText } from 'lucide-react';
import { Category, Post } from '../types/index.js';
import { R2ImageUploader } from './R2ImageUploader.js';
import { RichTextEditor } from './RichTextEditor.js';

interface AdminPostFormProps {
  categories: Category[];
  initialPost?: Post | null;
  onSave: (postData: Partial<Post>) => Promise<void>;
  onCancel: () => void;
}

export const AdminPostForm: React.FC<AdminPostFormProps> = ({
  categories,
  initialPost,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialPost?.category_id || (categories.length > 0 ? categories[0].id : 1)
  );
  const [status, setStatus] = useState<'published' | 'draft'>(initialPost?.status || 'published');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('ba_jwt_token');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Gagal mengunggah gambar');
      }

      setCoverImage(result.data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah file gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Judul dan isi artikel wajib diisi!');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await onSave({
        title,
        category_id: categoryId,
        status,
        cover_image: coverImage,
        excerpt,
        content
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan artikel.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border shadow-md p-6 max-w-4xl mx-auto bg-white border-slate-200 text-slate-900 dark:bg-[#0f1115] dark:border-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span>{initialPost ? 'Edit Artikel Redaksi' : 'Tulis Artikel Berita Baru'}</span>
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl text-xs font-medium border bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
            Judul Utama Artikel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Perkembangan AI 2026 dan Dampak Ekonomi Digital..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border font-semibold bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
            required
          />
        </div>

        {/* Category & Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
              Kategori Berita *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
              Status Publikasi
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
            >
              <option value="published">Published (Langsung Tayang)</option>
              <option value="draft">Draft (Simpan Sementara)</option>
            </select>
          </div>
        </div>

        {/* Image Upload Service Integration via Cloudflare R2 */}
        <R2ImageUploader
          value={coverImage}
          onChange={(url) => setCoverImage(url)}
          label="Gambar Sampul Berita (Cloudflare R2 Storage)"
          placeholder="https://... (URL gambar sampul R2 / CDN)"
          aspectRatio="aspect-21/9"
        />

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
            Ringkasan Berita (Excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tulis ringkasan singkat artikel untuk ditampilkan di feed berita..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
          />
        </div>

        {/* Content Body - Professional Open Source Editor */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Isi Lengkap Artikel (Professional Open Source Editor) *</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">dukungan format html, media r2, & live preview</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={(html) => setContent(html)}
            placeholder="Tuliskan berita secara lengkap, sertakan sub-heading, kutipan, dan gambar R2..."
          />
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t flex items-center justify-end gap-3 border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
