import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Edit3, Trash2, CheckCircle, Sparkles, Sliders, Palette, Image as ImageIcon, Eye, Code, Cloud } from 'lucide-react';
import { Widget, Category, WidgetSettings } from '../types/index.js';
import { R2ImageUploader } from './R2ImageUploader.js';

interface AdminWidgetsPanelProps {
  categories: Category[];
}

export const AdminWidgetsPanel: React.FC<AdminWidgetsPanelProps> = ({ categories }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'appearance' | 'media_r2' | 'display'>('general');

  // Form State & Traits
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Widget['type']>('category_posts');
  const [position, setPosition] = useState<Widget['position']>('main_feed');
  const [sortOrder, setSortOrder] = useState(1);

  // Traits State
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [categorySlug, setCategorySlug] = useState('teknologi');
  const [limit, setLimit] = useState(3);
  const [layout, setLayout] = useState<'grid' | 'list' | 'carousel' | 'hero_highlight' | 'compact'>('grid');
  const [adPlacement, setAdPlacement] = useState('in_feed');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [bgStyle, setBgStyle] = useState<'card' | 'bordered' | 'gradient' | 'transparent' | 'dark_luxury'>('card');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [showViews, setShowViews] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showCategoryTag, setShowCategoryTag] = useState(true);

  const [msg, setMsg] = useState('');

  const fetchWidgets = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    try {
      const res = await fetch('/api/widgets/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setWidgets(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const handleOpenForm = (w?: Widget, defaultPos: Widget['position'] = 'main_feed') => {
    setActiveTab('general');
    if (w) {
      setEditingWidget(w);
      setTitle(w.title || '');
      setType(w.type);
      setPosition(w.position);
      setSortOrder(w.sort_order || 1);

      const s = w.settings || {};
      setSubtitle(s.subtitle || '');
      setBadgeText(s.badge_text || '');
      setCategorySlug(s.category_slug || (categories[0]?.slug || 'teknologi'));
      setLimit(s.limit || 3);
      setLayout(s.layout || 'grid');
      setAdPlacement(s.placement || 'in_feed');
      setAccentColor(s.accent_color || '#10b981');
      setBgStyle(s.bg_style || 'card');
      setImageUrl(s.image_url || '');
      setCtaLabel(s.cta_label || '');
      setCtaUrl(s.cta_url || '');
      setCustomHtml(s.custom_html || '');
      setShowViews(s.show_views !== false);
      setShowDate(s.show_date !== false);
      setShowCategoryTag(s.show_category_tag !== false);
    } else {
      setEditingWidget(null);
      setTitle('');
      setType('category_posts');
      setPosition(defaultPos);
      setSortOrder(widgets.filter((item) => item.position === defaultPos).length + 1);

      setSubtitle('');
      setBadgeText('');
      setCategorySlug(categories[0]?.slug || 'teknologi');
      setLimit(3);
      setLayout('grid');
      setAdPlacement('in_feed');
      setAccentColor('#10b981');
      setBgStyle('card');
      setImageUrl('');
      setCtaLabel('');
      setCtaUrl('');
      setCustomHtml('');
      setShowViews(true);
      setShowDate(true);
      setShowCategoryTag(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingWidget;
    const url = isEdit ? `/api/widgets/admin/${editingWidget.id}` : '/api/widgets/admin/create';
    const method = isEdit ? 'PUT' : 'POST';

    const settingsObj: WidgetSettings = {
      subtitle,
      badge_text: badgeText,
      accent_color: accentColor,
      bg_style: bgStyle,
      image_url: imageUrl,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      show_views: showViews,
      show_date: showDate,
      show_category_tag: showCategoryTag
    };

    if (type === 'category_posts') {
      settingsObj.category_slug = categorySlug;
      settingsObj.limit = limit;
      settingsObj.layout = layout;
    } else if (type === 'ad_banner') {
      settingsObj.placement = adPlacement;
    } else if (type === 'custom_html') {
      settingsObj.custom_html = customHtml;
    } else {
      settingsObj.limit = limit;
      settingsObj.layout = layout;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        type,
        position,
        sort_order: Number(sortOrder),
        is_active: editingWidget ? editingWidget.is_active : 1,
        settings: settingsObj
      })
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setMsg(isEdit ? 'Traits & Pengaturan Widget berhasil disimpan' : 'Widget baru berhasil ditambahkan');
      setTimeout(() => setMsg(''), 3000);
      fetchWidgets();
    } else {
      alert(data.message || 'Gagal menyimpan widget');
    }
  };

  const handleDeleteWidget = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus modul widget ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/widgets/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchWidgets();
  };

  const handleToggleWidget = async (w: Widget) => {
    const token = localStorage.getItem('ba_jwt_token');
    await fetch(`/api/widgets/admin/${w.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...w,
        is_active: w.is_active === 1 ? 0 : 1
      })
    });
    fetchWidgets();
  };

  const handleMoveOrder = async (widget: Widget, direction: 'up' | 'down') => {
    const sectionWidgets = widgets.filter((w) => w.position === widget.position).sort((a, b) => a.sort_order - b.sort_order);
    const index = sectionWidgets.findIndex((w) => w.id === widget.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionWidgets.length) return;

    const otherWidget = sectionWidgets[targetIndex];
    const newWidgets = sectionWidgets.map((w) => {
      if (w.id === widget.id) return { ...w, sort_order: otherWidget.sort_order };
      if (w.id === otherWidget.id) return { ...w, sort_order: widget.sort_order };
      return w;
    });

    const token = localStorage.getItem('ba_jwt_token');
    await fetch('/api/widgets/admin/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ widgets: newWidgets })
    });

    fetchWidgets();
  };

  const positions: { key: Widget['position']; label: string; desc: string }[] = [
    { key: 'top_header', label: 'Top Header Ticker Area', desc: 'Sangat cocok untuk Breaking News ticker' },
    { key: 'hero_section', label: 'Hero Highlight Showcase', desc: 'Atas beranda, gambar besar Editor Pick' },
    { key: 'main_feed', label: 'Main Feed Stream (Layar Utama)', desc: 'Blok kategori berita & banner sponsor in-feed' },
    { key: 'sidebar', label: 'Bilah Samping (Sidebar Right)', desc: 'Trending #1..#5, Indeks Pasar/Cuaca, & Ads' },
    { key: 'sticky_bottom', label: 'Floating Bottom Sticky Bar', desc: 'Banner iklan melayang di bawah layar' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <span>Widgets Management & Traits Inspector</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>R2 Storage Powered</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Kelola tata letak & traits widget (warna aksen, style, background R2, layout, CTA link, & kustomisasi visual) secara interaktif.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Widget & Edit Traits</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Sections by Position */}
      <div className="space-y-6">
        {positions.map((pos) => {
          const list = widgets
            .filter((w) => w.position === pos.key)
            .sort((a, b) => a.sort_order - b.sort_order);

          return (
            <div
              key={pos.key}
              className="p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>{pos.label} ({list.length} Modul)</span>
                  </h3>
                  <p className="text-xs text-slate-500">{pos.desc}</p>
                </div>

                <button
                  onClick={() => handleOpenForm(undefined, pos.key)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-black font-bold text-xs rounded-xl transition-colors"
                >
                  + Tambah ke Slot Ini
                </button>
              </div>

              {list.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
                  Belum ada widget pada area {pos.label}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((w, idx) => (
                    <div
                      key={w.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        w.is_active === 1
                          ? 'bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800'
                          : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span
                          className="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 text-white"
                          style={{ backgroundColor: w.settings?.accent_color || '#10b981' }}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{w.title}</span>
                            {w.settings?.badge_text && (
                              <span className="px-1.5 py-0.2 text-[9px] rounded font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                {w.settings.badge_text}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold uppercase">
                              {w.type.replace('_', ' ')}
                            </span>
                            {w.settings?.category_slug && (
                              <span>cat: {w.settings.category_slug}</span>
                            )}
                            {w.settings?.image_url && (
                              <span className="text-orange-500 font-bold flex items-center gap-0.5">
                                <Cloud className="w-3 h-3" /> R2 Media
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleWidget(w)}
                          className="p-1 text-slate-400 hover:text-emerald-500"
                          title="Toggle Status"
                        >
                          {w.is_active === 1 ? (
                            <ToggleRight className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleMoveOrder(w, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border text-slate-400 hover:text-emerald-500 disabled:opacity-30 border-slate-200 dark:border-slate-800"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(w, 'down')}
                          disabled={idx === list.length - 1}
                          className="p-1.5 rounded-lg border text-slate-400 hover:text-emerald-500 disabled:opacity-30 border-slate-200 dark:border-slate-800"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(w, pos.key)}
                          className="p-1.5 rounded-lg border text-slate-800 dark:text-slate-200 hover:text-emerald-500 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1 text-[11px] font-bold"
                          title="Edit Traits & Settings"
                        >
                          <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Traits</span>
                        </button>
                        <button
                          onClick={() => handleDeleteWidget(w.id)}
                          className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Traits Inspector Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl my-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-500" />
                  <span>{editingWidget ? 'Widget Traits Inspector & Settings' : 'Tambah Widget & Configure Traits'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sesuaikan sifat (traits), tampilan visual, warna aksen, dan media R2 untuk widget ini.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/30 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                <span>R2 Storage</span>
              </span>
            </div>

            {/* Traits Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex-1 min-w-max px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'general'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span>General Traits</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('layout')}
                className={`flex-1 min-w-max px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'layout'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                <span>Content & Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={`flex-1 min-w-max px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'appearance'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-500" />
                <span>Style & Color</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media_r2')}
                className={`flex-1 min-w-max px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'media_r2'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-orange-500" />
                <span>R2 Media Traits</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('display')}
                className={`flex-1 min-w-max px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'display'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>Display Traits</span>
              </button>
            </div>

            <form onSubmit={handleSaveWidget} className="space-y-5">
              {/* TAB 1: GENERAL TRAITS */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                      Judul Widget (Widget Heading) *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Berita Teknologi Terkini"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border font-bold bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Sub-judul / Tagline Tambahan
                      </label>
                      <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Contoh: Update tercepat dari redaksi"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Label Badge (Pill Accent)
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="Contoh: HOT, HOTTEST, TRENDING 2026"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Tipe Widget
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                      >
                        <option value="category_posts">Kategori Berita Specific Grid/List</option>
                        <option value="breaking_news">Breaking News Running Text Ticker</option>
                        <option value="trending_list">Daftar Berita Terpopuler (#1 - #5)</option>
                        <option value="editor_pick">Hero Showcase / Editor's Pick Box</option>
                        <option value="ad_banner">Banner Iklan & Sponsor</option>
                        <option value="weather_market">Cuaca & Indeks Pasar Finansial</option>
                        <option value="newsletter">Langganan Buletin Redaksi</option>
                        <option value="custom_html">Custom HTML / Script Widget</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Posisi Slot Penempatan
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                      >
                        <option value="top_header">Top Header (Ticker running text)</option>
                        <option value="hero_section">Hero Section Showcase</option>
                        <option value="main_feed">Main Feed (Konten Utama)</option>
                        <option value="sidebar">Sidebar Right (Bilah Samping)</option>
                        <option value="sticky_bottom">Sticky Bottom Floating Bar</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT & LAYOUT TRAITS */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  {type === 'category_posts' && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Kategori Berita Target
                      </label>
                      <select
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name} ({c.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Jumlah Post Tampil (Limit)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Format Layout Grid / Stream
                      </label>
                      <select
                        value={layout}
                        onChange={(e) => setLayout(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                      >
                        <option value="grid">Grid Card (2-3 Kolom)</option>
                        <option value="list">List Ringkas Vertical</option>
                        <option value="hero_highlight">Hero Card Utama + Sub List</option>
                        <option value="compact">Compact Minimalist Feed</option>
                      </select>
                    </div>
                  </div>

                  {type === 'custom_html' && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-purple-500" />
                        <span>Kode Custom HTML / Embedded Script</span>
                      </label>
                      <textarea
                        rows={5}
                        value={customHtml}
                        onChange={(e) => setCustomHtml(e.target.value)}
                        placeholder="<div>Custom HTML / Widget iFrame</div>"
                        className="w-full p-3 font-mono text-xs rounded-xl border bg-slate-900 text-emerald-400 border-slate-800"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Label Button Call to Action (CTA)
                      </label>
                      <input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="Contoh: Lihat Semua Artikel"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                        Link URL CTA
                      </label>
                      <input
                        type="text"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="Contoh: /category/teknologi"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STYLE & COLOR TRAITS */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-slate-700 dark:text-slate-300">
                      Warna Aksen Khas Widget (Accent Palette)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-800"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#64748b'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setAccentColor(c)}
                            className={`w-7 h-7 rounded-lg border transition-transform ${
                              accentColor === c ? 'scale-110 ring-2 ring-emerald-500 border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                      Gaya Kartu Background (Card Surface Style)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'card', label: 'Standard Card' },
                        { key: 'bordered', label: 'Outline Border' },
                        { key: 'gradient', label: 'Soft Gradient' },
                        { key: 'dark_luxury', label: 'Dark Luxury' },
                        { key: 'transparent', label: 'Transparent Clean' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setBgStyle(item.key as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                            bgStyle === item.key
                              ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-[#16181d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: R2 MEDIA TRAITS */}
              {activeTab === 'media_r2' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <Cloud className="w-5 h-5 shrink-0" />
                    <span>
                      Upload banner khusus, logo sponsor, atau gambar latar belakang widget langsung ke <strong>Cloudflare R2 Object Storage</strong>.
                    </span>
                  </div>

                  <R2ImageUploader
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url)}
                    label="Media Gambar Widget (Cloudflare R2)"
                    placeholder="https://pub-r2.dev/uploads/banner_widget.jpg"
                  />
                </div>
              )}

              {/* TAB 5: DISPLAY TRAITS */}
              {activeTab === 'display' && (
                <div className="space-y-4">
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Tampilkan Tanggal Rilis Artikel
                      </span>
                      <input
                        type="checkbox"
                        checked={showDate}
                        onChange={(e) => setShowDate(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Tampilkan Jumlah Pembaca (Views Count)
                      </span>
                      <input
                        type="checkbox"
                        checked={showViews}
                        onChange={(e) => setShowViews(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Tampilkan Tag Kategori pada Feed Item
                      </span>
                      <input
                        type="checkbox"
                        checked={showCategoryTag}
                        onChange={(e) => setShowCategoryTag(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Traits tersimpan di SQLite & R2 Storage</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Simpan Settings & Traits</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
