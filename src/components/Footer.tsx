import React from 'react';
import { Layers } from 'lucide-react';

interface Props {
  onOpenArchModal: () => void;
}

export const Footer: React.FC<Props> = ({ onOpenArchModal }) => {
  return (
    <footer className="mt-20 bg-[#0f1115] text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black font-black flex items-center justify-center text-base">
              BA
            </div>
            <span className="text-lg font-black text-white">Berita<span className="text-emerald-400">Anda</span>.com</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Platform portal berita dan manajemen konten modern berbasis arsitektur modular Hono, HonoX SSR UI, SQLite Relational DB, dan Cloudflare KV Edge Cache.
          </p>
          <button
            onClick={onOpenArchModal}
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lihat Diagram Alur Arsitektur</span>
          </button>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
            Teknologi Stack
          </h4>
          <ul className="space-y-2 text-slate-400 text-xs font-mono">
            <li>• HonoJS HTTP Framework</li>
            <li>• HonoX SSR & Client UI</li>
            <li>• SQLite / D1 Relational Database</li>
            <li>• JWT HS256 & x-api-key Auth</li>
            <li>• Edge Memory KV Cache</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
            Akses Cepat
          </h4>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li>Redaksi & Publisher System</li>
            <li>Third-Party Integration API</li>
            <li>Media Storage Upload Service</li>
            <li>Edge KV Cache Control</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 bg-[#0a0a0b] py-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 BeritaAnda.com. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with Hono + HonoX + SQLite
          </span>
        </div>
      </div>
    </footer>
  );
};
