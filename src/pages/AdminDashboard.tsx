import React, { useState, useEffect } from 'react';
import { Post, Category, ApiKey, SystemStats, User } from '../types';
import { AdminPostForm } from '../components/AdminPostForm';
import { ApiKeyManager } from '../components/ApiKeyModal';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Key,
  FolderPlus,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  CheckCircle,
  Database,
  Layers
} from 'lucide-react';

interface Props {
  user: User;
  token: string;
  categories: Category[];
  onRefreshData: () => void;
  onOpenArchModal: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  user,
  token,
  categories,
  onRefreshData,
  onOpenArchModal
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'api-keys' | 'stats'>('posts');

  const [posts, setPosts] = useState<Post[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Post form state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // New category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('#3b82f6');
  const [catSaving, setCatSaving] = useState(false);
  const [catMsg, setCatMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, keysRes, statsRes] = await Promise.all([
        fetch('/api/admin/posts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/api-keys', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const postsData = await postsRes.json();
      const keysData = await keysRes.json();
      const statsData = await statsRes.json();

      if (postsData.success) setPosts(postsData.data || []);
      if (keysData.success) setApiKeys(keysData.data || []);
      if (statsData.success) setStats(statsData.stats || null);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDeletePost = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini secara permanen dari SQLite?')) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCatSaving(true);
    setCatMsg(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName, description: catDesc, color: catColor })
      });

      const data = await res.json();
      if (data.success) {
        setCatName('');
        setCatDesc('');
        setCatMsg('Kategori berhasil ditambahkan!');
        setTimeout(() => setCatMsg(null), 3000);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCatSaving(false);
    }
  };

  if (isCreatingPost || editingPost) {
    return (
      <AdminPostForm
        categories={categories}
        token={token}
        initialPost={editingPost}
        onSuccess={() => {
          setIsCreatingPost(false);
          setEditingPost(null);
          fetchData();
          onRefreshData();
        }}
        onCancel={() => {
          setIsCreatingPost(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Database className="w-4 h-4" /> Panel Kontrol Redaksi BeritaAnda
          </div>
          <h1 className="text-2xl font-black">Selamat datang, {user.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola konten berita, kategori, API Key integrasi pihak ketiga, dan performa KV Edge Cache.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Plan Arsitektur</span>
          </button>

          <button
            onClick={() => setIsCreatingPost(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'posts'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'bg-[#16181d] hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kelola Artikel ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'categories'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'bg-[#16181d] hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Kategori ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'api-keys'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'bg-[#16181d] hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-purple-400" />
          <span>API Keys Integrasi ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'bg-[#16181d] hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Metrik Performa & Cache</span>
        </button>
      </div>

      {/* Tab 1: Posts Management */}
      {activeTab === 'posts' && (
        <div className="bg-[#0f1115] text-slate-200 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Daftar Semua Artikel berita di SQLite DB</h3>
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#16181d]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0a0a0b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3">Judul Artikel</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Tanggal Dibuat</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-white max-w-md">
                      <div className="line-clamp-1">{p.title}</div>
                      <span className="text-[10px] text-slate-500 font-normal font-mono">{p.slug}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-blue-600">
                        {p.category_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'published'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-300 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.views}</span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingPost(p)}
                          className="p-1.5 text-blue-400 hover:bg-blue-950/60 rounded-lg transition-colors border border-blue-900/40"
                          title="Edit Artikel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="p-1.5 text-red-400 hover:bg-red-950/60 rounded-lg transition-colors border border-red-900/40"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-[#0f1115] text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Tambah Kategori Baru</span>
            </h3>

            {catMsg && (
              <div className="p-3 bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{catMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Misal: Otomotif, Sains"
                  className="w-full px-3 py-2 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Warna Aksesori
                </label>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-full h-9 p-1 bg-[#16181d] border border-slate-800 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Deskripsi singkat topik kategori..."
                  className="w-full px-3 py-2 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:border-emerald-500 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={catSaving}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                {catSaving ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-[#0f1115] text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-xs">
            <h3 className="font-bold text-white text-sm mb-4">Daftar Kategori Berita Aktif</h3>
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-[#16181d] rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color || '#10b981' }} />
                    <div>
                      <span className="font-bold text-xs text-white">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block">{c.description}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[#0a0a0b] text-slate-300 border border-slate-800 rounded-md text-[11px] font-mono">
                    {c.post_count || 0} artikel
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Keys Management */}
      {activeTab === 'api-keys' && (
        <ApiKeyManager
          apiKeys={apiKeys}
          token={token}
          onKeyCreated={fetchData}
          onKeyDeleted={fetchData}
        />
      )}

      {/* Tab 4: System Stats & Metrics */}
      {activeTab === 'stats' && stats && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>Metrik Performa Hono & Cloudflare KV Cache</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Views Pembaca</span>
              <span className="text-2xl font-black text-blue-400">{stats.total_views}</span>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Cache Hits (Edge Response)</span>
              <span className="text-2xl font-black text-emerald-400">{stats.cache_hits}</span>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Cache Misses</span>
              <span className="text-2xl font-black text-amber-400">{stats.cache_misses}</span>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Keys Pihak Ketiga</span>
              <span className="text-2xl font-black text-purple-400">{stats.total_api_keys}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
