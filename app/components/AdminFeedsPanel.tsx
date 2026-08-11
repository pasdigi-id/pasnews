import React, { useState } from 'react';
import { Rss, Globe, ExternalLink, Copy, Check, Eye, Search, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../types/index.js';

interface AdminFeedsPanelProps {
  settings?: SystemSettings | null;
}

export const AdminFeedsPanel: React.FC<AdminFeedsPanelProps> = ({ settings }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const siteTitle = settings?.site_title || 'BeritaAnda';
  const siteTagline = settings?.site_tagline || 'Portal Berita & Platform Informasi Terpercaya';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const feedLinks = [
    {
      id: 'google-news',
      name: 'Google News Sitemap XML',
      badge: 'Khusus Google Berita',
      url: `${baseUrl}/news-sitemap.xml`,
      desc: 'Sitemap XML standar resmi Google News dengan tag publication name, publication date, title & keywords.',
      color: 'bg-emerald-500'
    },
    {
      id: 'google-news-alt',
      name: 'Google News Alternative Feed',
      badge: 'RSS Feed URL',
      url: `${baseUrl}/feed/google-news.xml`,
      desc: 'Format URL alternatif khusus untuk pendaftaran di Google News Producer / Publisher Center.',
      color: 'bg-teal-500'
    },
    {
      id: 'sitemap',
      name: 'XML Sitemap Utama (Search Engine)',
      badge: 'Google & Bing Search',
      url: `${baseUrl}/sitemap.xml`,
      desc: 'Indeks seluruh URL artikel berita, kategori, dan halaman CMS untuk Google Search Console.',
      color: 'bg-blue-500'
    },
    {
      id: 'rss',
      name: 'RSS 2.0 Syndication Feed',
      badge: 'RSS Reader',
      url: `${baseUrl}/rss.xml`,
      desc: 'Feed RSS standar dengan CDATA content, media thumbnail, dan metadata lengkap untuk agregator.',
      color: 'bg-orange-500'
    },
    {
      id: 'atom',
      name: 'Atom 1.0 News Feed',
      badge: 'Atom Feed',
      url: `${baseUrl}/atom.xml`,
      desc: 'Feed Atom 1.0 terstruktur untuk pembaca berita otomatis.',
      color: 'bg-purple-500'
    }
  ];

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="p-6 rounded-3xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-800 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Rss className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Google News Feeds & SEO Sitemap Engine</h2>
            <p className="text-xs text-slate-400">
              Umpan berita (feed) dan sitemap XML otomatis yang memenuhi kriteria resmi Google News & Google Search Console.
            </p>
          </div>
        </div>
      </div>

      {/* Feed Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedLinks.map((feed) => (
          <div
            key={feed.id}
            className="p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${feed.color}`} />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{feed.name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {feed.badge}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{feed.desc}</p>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/80 font-mono text-xs flex items-center justify-between gap-2 text-slate-700 dark:text-slate-300 truncate">
              <span className="truncate">{feed.url}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopy(feed.id, feed.url)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Salin URL"
                >
                  {copiedKey === feed.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={feed.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Buka XML di Tab Baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live SEO Snippet Preview Card */}
      <div className="p-6 rounded-3xl border bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-500" />
          <span>Simulasi Tampilan Google Search & Open Graph Card</span>
        </h3>

        {/* Google SERP Card */}
        <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-black font-extrabold">B</span>
            <span className="truncate">{baseUrl} › berita</span>
          </div>
          <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            {siteTitle} | {siteTagline}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Portal berita dan media informasi terpercaya menyajikan berita terkini, terakurat, dan mendalam. Dilengkapi dengan Google News feeds, sitemap XML, serta analisis cepat.
          </p>
        </div>
      </div>
    </div>
  );
};
