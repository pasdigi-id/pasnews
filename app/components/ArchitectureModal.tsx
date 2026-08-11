import React from 'react';
import { X, Layers, Cpu, Globe, Database, ShieldCheck, Cloud, RefreshCw } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 dark:bg-[#0f1115] dark:border-slate-800 dark:text-slate-200 border">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg border transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Arsitektur Server Side Rendering (SSR) & Keamanan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Skema Pengamanan API, HonoJS HTTP, Edge KV Cache & SQLite Database</p>
          </div>
        </div>

        {/* Security Concept Notice */}
        <div className="p-4 mb-6 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
          <span className="font-bold block mb-1">🛡️ Keamanan Jalur SSR (Anti-Inspect & Anti-Jebol API):</span>
          <p>
            Seluruh data frontend disajikan secara server-side. Ketika pengguna membuka peramban dan melakukan "Inspect Element" atau memeriksa Tab Network/Sources, kueri database dan kunci rahasia backend tidak terekspos langsung. Jalur frontend berada di folder <code className="font-mono bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-900 dark:text-emerald-200">app/</code> sementara eksekusi bisnis/database berada terisolasi di folder <code className="font-mono bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-900 dark:text-emerald-200">src/</code>.
          </p>
        </div>

        {/* Workflow Diagram Representation */}
        <div className="space-y-6 text-sm">
          {/* Layer 1: Clients */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#0a0a0b] border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 1. Klien & 3 Area Tampilan (Public, Member, Admin)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">🌐 Public Area (Pengunjung)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Membaca berita, pencarian, komentar, estimasi waktu baca, switch mode terang/gelap.</span>
              </div>
              <div className="p-3 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block text-xs">👤 Member Area</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Simpanan artikel (bookmarks), riwayat bacaan, ajukan draft berita, ubah profil.</span>
              </div>
              <div className="p-3 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-purple-600 dark:text-purple-400 block text-xs">🛡️ Admin Area & Settings</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Kelola artikel, kategori, API keys, cache, dan menu konfigurasi modular aplikasi.</span>
              </div>
            </div>
          </div>

          {/* Layer 2: Cloudflare Edge & Caching */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#0a0a0b] border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> 2. Edge Network & Cache Layer
            </h3>
            <div className="p-3.5 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <strong className="text-emerald-600 dark:text-emerald-400">Cache Hit:</strong> Menyajikan respon halaman langsung dalam waktu &lt; 5ms dari memori edge.
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                <strong className="text-amber-600 dark:text-amber-400">Cache Miss:</strong> Memproses data via Hono server lalu memperbarui KV cache secara otomatis.
              </p>
            </div>
          </div>

          {/* Layer 3: Backend & Database */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#0a0a0b] border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" /> 3. Modular Backend (HonoJS + SQLite DB in <code className="lowercase">src/</code>)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Tabel System Settings</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Menyimpan konfigurasi judul situs, pendaftaran, modul komentar, dan tema default.</span>
              </div>
              <div className="p-3 rounded-lg border bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Tabel Posts, Users, Bookmarks</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Penyimpanan relasional artikel, otentikasi JWT HS256, dan riwayat bacaan member.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors"
          >
            Tutup Penjelasan Arsitektur
          </button>
        </div>

      </div>
    </div>
  );
};
