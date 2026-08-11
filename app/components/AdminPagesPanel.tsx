import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit3, Trash2, CheckCircle, Eye, ShieldAlert } from 'lucide-react';
import { Page } from '../types/index.js';

export const AdminPagesPanel: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [showInMenu, setShowInMenu] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchPages = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    try {
      const res = await fetch('/api/pages/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenForm = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setTitle(page.title);
      setContent(page.content);
      setStatus(page.status);
      setShowInMenu(page.show_in_menu === 1);
    } else {
      setEditingPage(null);
      setTitle('');
      setContent('');
      setStatus('published');
      setShowInMenu(true);
    }
    setIsModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingPage;
    const url = isEdit ? `/api/pages/admin/${editingPage.id}` : '/api/pages/admin/create';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        status,
        show_in_menu: showInMenu
      })
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setMsg(isEdit ? 'Halaman berhasil diperbarui' : 'Halaman berhasil dibuat');
      setTimeout(() => setMsg(''), 3000);
      fetchPages();
    } else {
      alert(data.message || 'Gagal menyimpan halaman');
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halaman ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/pages/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPages();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Manajemen Halaman Statis (CMS Pages)</h2>
            <p className="text-xs text-slate-400">
              Buat dan kelola dokumen halaman seperti Susunan Redaksi, Pedoman Media Siber, Kontak, & Privacy.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Halaman Baru</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Pages Table */}
      <div className="rounded-2xl border overflow-hidden bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="p-3.5">Judul Halaman</th>
              <th className="p-3.5">Slug URL</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Di Menu</th>
              <th className="p-3.5">Terakhir Update</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Belum ada halaman. Klik "Buat Halaman Baru" untuk menambahkan.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.title}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">/page/{p.slug}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{p.show_in_menu === 1 ? 'Ya' : 'Tidak'}</td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(p.updated_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => handleOpenForm(p)}
                      className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-500 border-slate-200 dark:border-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(p.id)}
                      className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl space-y-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {editingPage ? 'Edit Halaman' : 'Buat Halaman Baru'}
            </h3>

            <form onSubmit={handleSavePage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Judul Halaman
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Susunan Redaksi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Konten Halaman (Mendukung Teks Lengkap)
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi halaman di sini..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Status Publikasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                  >
                    <option value="published">Published (Aktif)</option>
                    <option value="draft">Draft (Sembunyi)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="showInMenu"
                    checked={showInMenu}
                    onChange={(e) => setShowInMenu(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <label htmlFor="showInMenu" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tampilkan Tautan di Footer/Menu
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-black rounded-xl font-bold text-xs"
                >
                  Simpan Halaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
