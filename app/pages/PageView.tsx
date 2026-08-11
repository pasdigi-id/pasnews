import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Shield, FileText } from 'lucide-react';
import { Page } from '../types/index.js';
import { MetaSEO } from '../components/MetaSEO.js';

interface PageViewProps {
  pageSlug: string;
  onBack: () => void;
}

export const PageView: React.FC<PageViewProps> = ({ pageSlug, onBack }) => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages/${pageSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPage(data.data);
        } else {
          setError(data.message || 'Halaman tidak ditemukan');
        }
      })
      .catch(() => setError('Gagal memuat halaman'))
      .finally(() => setLoading(false));
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500 inline-block">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">{error || 'Maaf, halaman yang Anda cari tidak tersedia.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      <MetaSEO
        title={page.title}
        description={page.content.replace(/<[^>]*>?/gm, '').substring(0, 160)}
        type="website"
      />
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-slate-200 dark:bg-[#16181d] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Dokumen Resmi BeritaAnda</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {page.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Terakhir Diperbarui: {new Date(page.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 whitespace-pre-line text-sm sm:text-base">
        {page.content}
      </div>

      {/* Footer Share / Info */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span className="font-bold text-slate-900 dark:text-white">BeritaAnda Media Digital</span> - Hak Cipta Dilindungi Undang-Undang.
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Tautan halaman berhasil disalin!');
          }}
          className="px-3.5 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Bagikan Halaman</span>
        </button>
      </div>

    </div>
  );
};
