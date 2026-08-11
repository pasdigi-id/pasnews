import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Plus,
  Shield,
  Key,
  Settings,
  Trash2,
  Edit3,
  Database,
  Eye,
  BarChart2,
  FileText,
  Users,
  Navigation,
  LayoutGrid,
  Megaphone,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  Rss
} from 'lucide-react';
import { Post, Category, ApiKey, SystemStats, SystemSettings, User } from '../types/index.js';
import { AdminPostForm } from '../components/AdminPostForm.js';
import { ApiKeyModal } from '../components/ApiKeyModal.js';
import { AdminSettingsPanel } from '../components/AdminSettingsPanel.js';
import { AdminPagesPanel } from '../components/AdminPagesPanel.js';
import { AdminUsersPanel } from '../components/AdminUsersPanel.js';
import { AdminMenusPanel } from '../components/AdminMenusPanel.js';
import { AdminWidgetsPanel } from '../components/AdminWidgetsPanel.js';
import { AdminAdsPanel } from '../components/AdminAdsPanel.js';
import { AdminFeedsPanel } from '../components/AdminFeedsPanel.js';

interface AdminDashboardProps {
  user: User;
  onNavigate: (view: string) => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onNavigate,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<
    'posts' | 'categories' | 'pages' | 'users' | 'menus' | 'widgets' | 'ads' | 'api-keys' | 'feeds' | 'settings'
  >('posts');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [catMsg, setCatMsg] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [postsRes, catRes, keysRes, statsRes] = await Promise.all([
        fetch('/api/admin/posts', { headers }).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/admin/api-keys', { headers }).then((r) => r.json()),
        fetch('/api/admin/stats', { headers }).then((r) => r.json())
      ]);

      if (postsRes.success) setPosts(postsRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (keysRes.success) setApiKeys(keysRes.data || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSavePost = async (postData: Partial<Post>) => {
    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingPost;
    const url = isEdit ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    setIsFormOpen(false);
    setEditingPost(null);
    fetchAdminData();
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');

    await fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchAdminData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: newCatName,
        description: newCatDesc,
        color: newCatColor
      })
    });

    const data = await res.json();
    if (data.success) {
      setNewCatName('');
      setNewCatDesc('');
      setCatMsg('Kategori berhasil ditambahkan!');
      setTimeout(() => setCatMsg(''), 3000);
      fetchAdminData();
    } else {
      setCatMsg(data.message || 'Gagal membuat kategori.');
    }
  };

  const handleCreateApiKey = async (name: string) => {
    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) fetchAdminData();
  };

  const handleRevokeApiKey = async (id: number) => {
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/admin/api-keys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdminData();
  };

  const sidebarMenuItems = [
    {
      group: 'KONTEN & BERITA',
      items: [
        { id: 'posts', label: 'Artikel Berita', icon: Newspaper, badge: posts.length },
        { id: 'categories', label: 'Kategori Berita', icon: BarChart2, badge: categories.length },
        { id: 'pages', label: 'Halaman CMS', icon: FileText }
      ]
    },
    {
      group: 'TAMPILAN & SITE BUILDER',
      items: [
        { id: 'widgets', label: 'Page Builder / Widgets', icon: LayoutGrid },
        { id: 'menus', label: 'Navigation Menus', icon: Navigation },
        { id: 'ads', label: 'Banner Iklan', icon: Megaphone }
      ]
    },
    {
      group: 'PENGATURAN & SISTEM',
      items: [
        { id: 'users', label: 'Tim Redaksi & Users', icon: Users },
        { id: 'feeds', label: 'Google News & Feeds', icon: Rss },
        { id: 'api-keys', label: 'REST API Keys', icon: Key, badge: apiKeys.length },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in min-h-[calc(100vh-120px)]">
      {/* Mobile Top Navigation Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Admin Dashboard</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 shrink-0 space-y-6 ${
          mobileSidebarOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="p-5 rounded-3xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          {/* Admin User Profile Card */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</h3>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                {user.role}
              </span>
            </div>
          </div>

          {/* New Article Action */}
          <button
            onClick={() => {
              setEditingPost(null);
              setIsFormOpen(true);
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </button>

          {/* Grouped Sidebar Nav Links */}
          <nav className="space-y-5">
            {sidebarMenuItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {group.group}
                </span>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-emerald-500 text-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Quick Exit Link */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('home')}
              className="w-full px-3 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Portal Berita</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Header Summary Banner */}
        <div className="p-6 rounded-3xl border bg-slate-900 border-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-extrabold capitalize">
                Panel {activeTab.replace('-', ' ')}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sistem manajemen berita, modular page builder, media R2, dan administrasi portal.
            </p>
          </div>

          {stats && (
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                <span>{stats.total_posts} Artikel</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>{stats.total_views} Views</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form Editor / Create Post */}
        {isFormOpen && (
          <AdminPostForm
            categories={categories}
            initialPost={editingPost}
            onSave={handleSavePost}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPost(null);
            }}
          />
        )}

        {/* Dynamic Tab Panels */}
        <div className="space-y-6">
          {/* Tab 1: Posts Management */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="rounded-2xl border overflow-hidden bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <th className="p-3.5">Judul Artikel</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Views</th>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          Belum ada artikel. Klik "Tulis Artikel Baru" di sidebar.
                        </td>
                      </tr>
                    ) : (
                      posts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                            {p.title}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-emerald-600">
                              {p.category_name}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{p.views}</td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(p.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingPost(p);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg border text-slate-400 hover:text-emerald-500 border-slate-200 dark:border-slate-800"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(p.id)}
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
            </div>
          )}

          {/* Tab 2: Categories Management */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-5 rounded-2xl border space-y-4 bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tambah Kategori Baru</h3>
                {catMsg && <div className="p-2 text-xs font-semibold text-emerald-400">{catMsg}</div>}

                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                      Nama Kategori
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Contoh: Olahraga"
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                      Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Deskripsi kategori..."
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                      Warna Label Badge
                    </label>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs"
                  >
                    Simpan Kategori
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Kategori Aktif</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</span>
                      </div>
                      <p className="text-xs text-slate-500">{c.description || 'Tidak ada deskripsi'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Page Builder & Widgets */}
          {activeTab === 'widgets' && <AdminWidgetsPanel categories={categories} />}

          {/* Tab 4: Pages Management */}
          {activeTab === 'pages' && <AdminPagesPanel />}

          {/* Tab 5: Menus Builder */}
          {activeTab === 'menus' && <AdminMenusPanel />}

          {/* Tab 6: Tim Redaksi & Users */}
          {activeTab === 'users' && <AdminUsersPanel currentUser={user} />}

          {/* Tab 7: Banner Iklan */}
          {activeTab === 'ads' && <AdminAdsPanel />}

          {/* Tab 8: Google News & Feeds */}
          {activeTab === 'feeds' && <AdminFeedsPanel settings={settings} />}

          {/* Tab 9: API Keys */}
          {activeTab === 'api-keys' && (
            <div className="space-y-4">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Buka Panel API Keys</span>
              </button>

              <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                apiKeys={apiKeys}
                onCreateKey={handleCreateApiKey}
                onRevokeKey={handleRevokeApiKey}
              />
            </div>
          )}

          {/* Tab 9: System Settings */}
          {activeTab === 'settings' && (
            <AdminSettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />
          )}
        </div>
      </main>
    </div>
  );
};
