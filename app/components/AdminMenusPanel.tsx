import React, { useState, useEffect } from 'react';
import { Navigation, Plus, ArrowUp, ArrowDown, Trash2, Edit3, CheckCircle, ExternalLink } from 'lucide-react';
import { MenuItem } from '../types/index.js';

export const AdminMenusPanel: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [location, setLocation] = useState<'header' | 'footer'>('header');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [icon, setIcon] = useState('Flame');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchMenus = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    try {
      const res = await fetch('/api/menus/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMenus(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenForm = (m?: MenuItem, loc: 'header' | 'footer' = 'header') => {
    if (m) {
      setEditingItem(m);
      setLocation(m.location as any);
      setTitle(m.title);
      setUrl(m.url);
      setTarget((m.target as any) || '_self');
      setIcon(m.icon || 'Link');
      setSortOrder(m.sort_order || 1);
      setIsActive(m.is_active === 1);
    } else {
      setEditingItem(null);
      setLocation(loc);
      setTitle('');
      setUrl('');
      setTarget('_self');
      setIcon('Flame');
      setSortOrder(menus.filter(item => item.location === loc).length + 1);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingItem;
    const reqUrl = isEdit ? `/api/menus/admin/${editingItem.id}` : '/api/menus/admin/create';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(reqUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        location,
        title,
        url,
        target,
        sort_order: Number(sortOrder),
        icon,
        is_active: isActive ? 1 : 0
      })
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setMsg(isEdit ? 'Menu berhasil diperbarui' : 'Menu baru berhasil ditambahkan');
      setTimeout(() => setMsg(''), 3000);
      fetchMenus();
    } else {
      alert(data.message || 'Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/menus/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMenus();
  };

  const handleMoveOrder = async (item: MenuItem, direction: 'up' | 'down') => {
    const sectionItems = menus.filter((m) => m.location === item.location).sort((a, b) => a.sort_order - b.sort_order);
    const index = sectionItems.findIndex((m) => m.id === item.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionItems.length) return;

    const otherItem = sectionItems[targetIndex];
    const newItems = sectionItems.map((m) => {
      if (m.id === item.id) return { ...m, sort_order: otherItem.sort_order };
      if (m.id === otherItem.id) return { ...m, sort_order: item.sort_order };
      return m;
    });

    const token = localStorage.getItem('ba_jwt_token');
    await fetch('/api/menus/admin/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: newItems })
    });

    fetchMenus();
  };

  const headerNav = menus.filter((m) => m.location === 'header').sort((a, b) => a.sort_order - b.sort_order);
  const footerNav = menus.filter((m) => m.location === 'footer').sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Menus Management Builder</h2>
            <p className="text-xs text-slate-400">
              Atur susunan menu navigasi utama (Header Navbar) dan footer tautan situs berita secara dinamis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenForm(undefined, 'header')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Header</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Header Menu Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Header Navigation Bar ({headerNav.length} Item)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {headerNav.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <div className="truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{item.title}</span>
                    {item.target === '_blank' && <ExternalLink className="w-3 h-3 text-slate-400" />}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{item.url}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveOrder(item, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-amber-500 disabled:opacity-30 border-slate-200 dark:border-slate-800"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveOrder(item, 'down')}
                  disabled={idx === headerNav.length - 1}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-amber-500 disabled:opacity-30 border-slate-200 dark:border-slate-800"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenForm(item)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-500 border-slate-200 dark:border-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMenu(item.id)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Menu Items */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Footer Links Menu ({footerNav.length} Item)</span>
          </h3>
          <button
            onClick={() => handleOpenForm(undefined, 'footer')}
            className="px-3 py-1.5 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-xl font-bold text-xs"
          >
            + Tambah Footer Link
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {footerNav.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <div className="truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{item.url}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenForm(item)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-500 border-slate-200 dark:border-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMenu(item.id)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {editingItem ? 'Edit Item Menu' : 'Tambah Item Menu Baru'}
            </h3>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Posisi Menu
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                >
                  <option value="header">Header Navigation Bar</option>
                  <option value="footer">Footer Navigation Links</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Judul Menu
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Teknologi / Pedoman Siber"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Target URL / Path
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Contoh: /category/teknologi atau /page/redaksi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Target Window
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                  >
                    <option value="_self">Tab Sama (_self)</option>
                    <option value="_blank">Tab Baru (_blank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  />
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-xs"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
