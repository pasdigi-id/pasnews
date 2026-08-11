import React from 'react';
import { X, Layers, Database, ShieldCheck, Cpu, Cloud, Globe, Key, FileText, Upload } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f1115] border border-slate-800 text-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analisis Arsitektur BeritaAnda.com</h2>
            <p className="text-xs text-slate-400">HonoJS Framework + HonoX SSR UI + SQLite Relational Database & Edge Caching</p>
          </div>
        </div>

        {/* Workflow Diagram Representation */}
        <div className="space-y-6 text-sm">
          {/* Layer 1: Clients */}
          <div className="bg-[#0a0a0b] p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 1. Klien & Pengguna (Client Layer)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-white block text-xs">Pengunjung / Reader</span>
                <span className="text-[11px] text-slate-400">Membuka beritaanda.com, membaca artikel, filter kategori, memberi komentar.</span>
              </div>
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-emerald-400 block text-xs">Admin / Editor</span>
                <span className="text-[11px] text-slate-400">Login JWT HS256, mengelola artikel, upload gambar, buat API Keys.</span>
              </div>
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-purple-400 block text-xs">Aplikasi Pihak Ketiga</span>
                <span className="text-[11px] text-slate-400">Publikasi artikel jarak jauh via POST /api/v1/posts menggunakan x-api-key header.</span>
              </div>
            </div>
          </div>

          {/* Layer 2: Cloudflare Edge & Caching */}
          <div className="bg-[#0a0a0b] p-4 rounded-xl border border-emerald-900/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> 2. Cloudflare Edge Network & KV Cache
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center bg-[#16181d] p-3.5 rounded-lg border border-slate-800">
              <div className="flex-1 text-xs text-slate-300 space-y-1">
                <p><strong className="text-emerald-400">Cache Hit:</strong> Menyajikan halaman & JSON API langsung dari memori edge tanpa beban query database.</p>
                <p><strong className="text-amber-400">Cache Miss:</strong> Meneruskan request ke Hono backend, memproses data, lalu memperbarui cache otomatis.</p>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md text-xs font-mono">
                TTLB &lt; 30ms
              </div>
            </div>
          </div>

          {/* Layer 3: Frontend & Backend Hono */}
          <div className="bg-[#0a0a0b] p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 3. Modular Hono Backend & Frontend Framework
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white text-xs">Frontend (HonoX UI / SSR)</span>
                </div>
                <p className="text-[11px] text-slate-400">Komponen tampilan cepat, responsive, disajikan secara modular dengan dukungan instant hydration.</p>
              </div>
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white text-xs">Backend (Upload & REST API)</span>
                </div>
                <p className="text-[11px] text-slate-400">Routing HonoJS ultra cepat, pemrosesan multipart/form-data upload gambar, dan validasi data.</p>
              </div>
            </div>

            {/* Middlewares */}
            <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Middleware Autentikasi:</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono rounded border border-emerald-500/20">
                  JWT HS256 Token
                </span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[11px] font-mono rounded border border-purple-500/20 flex items-center gap-1">
                  <Key className="w-3 h-3" /> Header: x-api-key
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Data Layer */}
          <div className="bg-[#0a0a0b] p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" /> 4. Data Layer (SQLite Database & Media Storage)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block text-xs">Cloudflare D1 / SQLite DB</span>
                <span className="text-[11px] text-slate-400">Tabel: users, categories, posts, comments, api_keys, media. Query terindeks dan cepat.</span>
              </div>
              <div className="bg-[#16181d] p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block text-xs">Cloudflare R2 / Media Storage</span>
                <span className="text-[11px] text-slate-400">Penyimpanan aset gambar terkompresi dengan pengiriman URL publik langsung.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors"
          >
            Tutup Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
