import React, { useState, useEffect } from 'react';
import { Newspaper, ShieldCheck, Database, Layers, Code, Heart, FileText } from 'lucide-react';
import { SystemSettings, Page, MenuItem } from '../types/index.js';

interface FooterProps {
  onOpenArchitecture: () => void;
  onNavigate: (view: string, param?: any) => void;
  settings?: SystemSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onOpenArchitecture, onNavigate, settings }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch('/api/pages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPages(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/menus?location=footer')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFooterMenus(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const siteTitle = settings?.site_title || 'BeritaAnda';
  const siteTagline = settings?.site_tagline || 'Portal Berita & Platform Informasi Terpercaya';

  const handleFooterLink = (url: string) => {
    if (url.startsWith('/page/')) {
      const slug = url.replace('/page/', '');
      onNavigate('page', slug);
    } else if (url.startsWith('/category/')) {
      const slug = url.replace('/category/', '');
      onNavigate('category', slug);
    } else if (url === '/') {
      onNavigate('home');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <footer className="mt-20 border-t transition-colors duration-200 bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#0a0a0b] dark:border-slate-800 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500 text-black">
                <Newspaper className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">{siteTitle}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {siteTagline}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Server Side Rendered (SSR)</span>
            </div>
          </div>

          {/* Col 2: Halaman & Dokumen Redaksi */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Informasi & Pedoman
            </h4>
            <ul className="space-y-2 text-xs">
              {pages.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigate('page', p.slug)}
                    className="hover:text-emerald-500 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>{p.title}</span>
                  </button>
                </li>
              ))}
              {footerMenus.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => handleFooterLink(m.url)}
                    className="hover:text-emerald-500 transition-colors"
                  >
                    {m.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Role Navigation */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Akses Multirole Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  🌐 Public Area (Pengunjung)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('member-dashboard')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  👤 Member Area (Simpanan & Bookmark)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  🛡️ Admin Area (CMS & Builder)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('api-docs')}
                  className="hover:text-purple-500 transition-colors flex items-center gap-1.5 pt-1"
                >
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>REST API Key Integration</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Theme & Security Notice */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Keamanan & Privasi
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Mekanisme SSR memastikan API key dan database tidak tersingkap pada elemen inspeksi peramban klien.
            </p>
            <div className="p-3 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Dukungan Light & Dark Mode:</span>
              <span className="text-slate-500 dark:text-slate-400">Dapat disesuaikan di header atau otomatis dari Admin Settings.</span>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-3">
          <div>
            © 2026 {siteTitle}. Portal Berita Berbasis Modular & SSR.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Dibuat dengan presisi tinggi & performa edge</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
