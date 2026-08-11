import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Eye, MousePointerClick, ToggleLeft, ToggleRight, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { AdBanner } from '../types/index.js';
import { R2ImageUploader } from './R2ImageUploader.js';

export const AdminAdsPanel: React.FC = () => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);

  const [title, setTitle] = useState('');
  const [placement, setPlacement] = useState<'top_leaderboard' | 'in_article' | 'sidebar_rectangle' | 'sticky_bottom' | 'in_feed'>('top_leaderboard');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    try {
      const res = await fetch('/api/ads/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAds(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenForm = (ad?: AdBanner) => {
    if (ad) {
      setEditingAd(ad);
      setTitle(ad.title);
      setPlacement(ad.placement);
      setImageUrl(ad.image_url);
      setTargetUrl(ad.target_url);
      setIsActive(ad.is_active === 1);
    } else {
      setEditingAd(null);
      setTitle('');
      setPlacement('top_leaderboard');
      setImageUrl('');
      setTargetUrl('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !targetUrl) return;

    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingAd;
    const url = isEdit ? `/api/ads/admin/${editingAd.id}` : '/api/ads/admin/create';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        placement,
        image_url: imageUrl,
        target_url: targetUrl,
        is_active: isActive ? 1 : 0
      })
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setMsg(isEdit ? 'Banner iklan berhasil diperbarui' : 'Banner iklan baru berhasil dipublikasikan');
      setTimeout(() => setMsg(''), 3000);
      fetchAds();
    } else {
      alert(data.message || 'Gagal menyimpan iklan');
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner iklan ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/ads/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAds();
  };

  const handleToggleStatus = async (ad: AdBanner) => {
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/ads/admin/${ad.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...ad,
        is_active: ad.is_active === 1 ? 0 : 1
      })
    });
    fetchAds();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Manajemen Banner Iklan & Sponsor</h2>
            <p className="text-xs text-slate-400">
              Buat banner promo/iklan modular, atur posisi penempatan, serta lacak tayangan (impressions) dan klik real-time.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Banner Iklan Baru</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-500">
                  {ad.placement.replace('_', ' ')}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">{ad.title}</h3>
              </div>

              <button
                onClick={() => handleToggleStatus(ad)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Status Aktif/Matikan"
              >
                {ad.is_active === 1 ? (
                  <ToggleRight className="w-7 h-7 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-500" />
                )}
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-32">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white truncate max-w-[80%]">
                {ad.target_url}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 text-slate-500 font-bold">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>{ad.impressions || 0} Tayangan</span>
                </span>
                <span className="flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{ad.clicks || 0} Klik</span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenForm(ad)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteAd(ad.id)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {editingAd ? 'Edit Banner Iklan' : 'Buat Banner Iklan Baru'}
            </h3>

            <form onSubmit={handleSaveAd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Judul Iklan / Nama Klien
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Sponsor Promo Super Sale 11.11"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Penempatan Slot Iklan
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                >
                  <option value="top_leaderboard">Top Leaderboard (Atas Header - 1200x120)</option>
                  <option value="in_feed">In-Feed Sponsor (Diantara Daftar Berita - 800x200)</option>
                  <option value="sidebar_rectangle">Sidebar Rectangle (Bilah Samping - 300x250)</option>
                  <option value="sticky_bottom">Sticky Bottom Bar (Bawah Layar Mobile & Desktop)</option>
                </select>
              </div>

              <R2ImageUploader
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                label="Gambar Banner Iklan (Cloudflare R2 Storage)"
                placeholder="https://... (URL R2 / CDN)"
                aspectRatio="aspect-16/9"
              />

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  URL Target Saat Diklik
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://sponsor.com/promo"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-mono"
                  required
                />
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
                  className="px-5 py-2 bg-red-500 hover:bg-red-400 text-black rounded-xl font-bold text-xs"
                >
                  Simpan Banner Iklan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
