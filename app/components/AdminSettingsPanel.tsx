import React, { useState } from 'react';
import { Settings, Save, ToggleLeft, ToggleRight, Sparkles, Check, Globe, Shield, MessageSquare, Key, Database, BookOpen } from 'lucide-react';
import { SystemSettings } from '../types/index.js';

interface AdminSettingsPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({ settings, onUpdateSettings }) => {
  const [siteTitle, setSiteTitle] = useState(settings.site_title || 'BeritaAnda');
  const [siteTagline, setSiteTagline] = useState(settings.site_tagline || '');
  const [defaultTheme, setDefaultTheme] = useState(settings.default_theme || 'dark');
  const [allowRegistration, setAllowRegistration] = useState(settings.allow_member_registration === 'true');
  const [enableComments, setEnableComments] = useState(settings.enable_comments === 'true');
  const [enableMemberSubmissions, setEnableMemberSubmissions] = useState(settings.enable_member_submissions === 'true');
  const [enableApi, setEnableApi] = useState(settings.enable_api === 'true');
  const [enableCache, setEnableCache] = useState(settings.enable_cache === 'true');
  const [readingWpm, setReadingWpm] = useState(settings.reading_wpm || '200');
  const [heroBanner, setHeroBanner] = useState(settings.hero_banner === 'true');

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg('');

    try {
      await onUpdateSettings({
        site_title: siteTitle,
        site_tagline: siteTagline,
        default_theme: defaultTheme,
        allow_member_registration: allowRegistration ? 'true' : 'false',
        enable_comments: enableComments ? 'true' : 'false',
        enable_member_submissions: enableMemberSubmissions ? 'true' : 'false',
        enable_api: enableApi ? 'true' : 'false',
        enable_cache: enableCache ? 'true' : 'false',
        reading_wpm: readingWpm,
        hero_banner: heroBanner ? 'true' : 'false'
      });

      setToastMsg('Konfigurasi aplikasi berhasil diperbarui!');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      setToastMsg('Gagal menyimpan perubahan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl border shadow-sm bg-white border-slate-200 text-slate-900 dark:bg-[#0f1115] dark:border-slate-800 dark:text-slate-200">
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Pengaturan & Modul Aplikasi (Admin Area)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pusat kendali konfigurasi modular, branding, dan modul sistem</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>

        {toastMsg && (
          <div className="p-4 mb-6 rounded-2xl border text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Branding & Identification */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>1. Identitas & Branding Situs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Nama Platform / Judul Aplikasi
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border font-bold bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Tagline / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Tema Default Aplikasi
                </label>
                <select
                  value={defaultTheme}
                  onChange={(e) => setDefaultTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                >
                  <option value="dark">Dark Mode (Mode Gelap)</option>
                  <option value="light">Light Mode (Mode Terang)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Catatan: Pengunjung tetap dapat mengganti tema via toggle di header.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Estimasi Kecepatan Baca (Words Per Minute)
                </label>
                <input
                  type="number"
                  value={readingWpm}
                  onChange={(e) => setReadingWpm(e.target.value)}
                  min={100}
                  max={500}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Modular Feature Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>2. Konfigurasi Modul & Fitur Aplikasi</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Module: Comments */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Modul Komentar Pembaca</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Mengizinkan kolom komentar di halaman detail berita.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableComments(!enableComments)}
                  className="text-2xl transition-colors text-slate-400 hover:text-emerald-500 shrink-0"
                >
                  {enableComments ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Module: Member Submissions */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Pengajuan Draft dari Member</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Izinkan member untuk mengajukan draft berita ke Redaksi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableMemberSubmissions(!enableMemberSubmissions)}
                  className="text-2xl transition-colors shrink-0"
                >
                  {enableMemberSubmissions ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Module: Registration */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Pendaftaran Member Baru</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Izinkan publik mendaftar sebagai akun member baru.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className="text-2xl transition-colors shrink-0"
                >
                  {allowRegistration ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Module: API Integration */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Key className="w-4 h-4 text-purple-500" />
                    <span>Third-Party REST API</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Mengaktifkan endpoint API publik dengan otentikasi header x-api-key.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableApi(!enableApi)}
                  className="text-2xl transition-colors shrink-0"
                >
                  {enableApi ? (
                    <ToggleRight className="w-8 h-8 text-purple-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Module: Edge Cache Simulation */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Simulasi Edge KV Caching</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Gunakan in-memory KV cache untuk mempercepat respon halaman.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableCache(!enableCache)}
                  className="text-2xl transition-colors shrink-0"
                >
                  {enableCache ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Module: Hero Banner */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Hero Article Banner</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Tampilkan artikel unggulan teratas di halaman utama.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroBanner(!heroBanner)}
                  className="text-2xl transition-colors shrink-0"
                >
                  {heroBanner ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
