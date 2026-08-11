import React, { useState } from 'react';
import { Code, Key, Copy, Check, Terminal, Globe, Send } from 'lucide-react';
import { SystemSettings } from '../types/index.js';
import { MetaSEO } from '../components/MetaSEO.js';

interface ApiDocsPageProps {
  settings?: SystemSettings | null;
}

export const ApiDocsPage: React.FC<ApiDocsPageProps> = ({ settings }) => {
  const [testApiKey, setTestApiKey] = useState('ba_live_8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c');
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const enableApi = settings?.enable_api !== 'false';

  const handleTestApi = async () => {
    setLoading(true);
    setResponseJson(null);
    try {
      const res = await fetch('/api/v1/posts?limit=3', {
        headers: {
          'x-api-key': testApiKey
        }
      });
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const curlExample = `curl -X GET "https://${window.location.host}/api/v1/posts?limit=5" \\
  -H "x-api-key: ${testApiKey}"`;

  const copyCode = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <MetaSEO
        title="Dokumentasi REST API & Google News Feeds"
        description="Layanan integrasi REST API, RSS 2.0, Atom Feed, dan Google News XML Sitemap terenkripsi."
        type="website"
      />
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#0a0a0c] border-purple-900/50 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Dokumentasi REST API Integration</h1>
            <p className="text-xs text-purple-200">Akses Data Berita Pihak Ketiga dengan Header x-api-key</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Platform menyediakan REST API publik terenkripsi untuk integrasi dengan aplikasi mobile, widget, dan partner berita. Otentikasi dilakukan via header <code className="font-mono bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200">x-api-key</code>.
        </p>
      </div>

      {!enableApi ? (
        <div className="p-6 rounded-2xl border text-center text-xs bg-red-950/20 border-red-800 text-red-300">
          Modul REST API sedang dinonaktifkan oleh Administrator melalui Admin Area Settings.
        </div>
      ) : (
        <>
          {/* Endpoints Table */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span>Daftar Endpoint API v1</span>
            </h2>

            <div className="rounded-2xl border overflow-hidden bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Endpoint</th>
                    <th className="p-3.5">Header Wajib</th>
                    <th className="p-3.5">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-800 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 font-bold text-emerald-500">GET</td>
                    <td className="p-3.5 font-bold">/api/v1/posts</td>
                    <td className="p-3.5 text-purple-400">x-api-key</td>
                    <td className="p-3.5 font-sans text-slate-500 dark:text-slate-400">Mengambil daftar berita publik terbitan terbaru</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-emerald-500">GET</td>
                    <td className="p-3.5 font-bold">/api/v1/categories</td>
                    <td className="p-3.5 text-purple-400">x-api-key</td>
                    <td className="p-3.5 font-sans text-slate-500 dark:text-slate-400">Mengambil daftar seluruh kategori berita</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Playground Code Example */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-500" />
              <span>Uji Coba API Key & Response Playground</span>
            </h2>

            <div className="p-5 rounded-2xl border space-y-4 bg-slate-900 border-slate-800 text-slate-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Masukkan API Key Pengujian:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testApiKey}
                    onChange={(e) => setTestApiKey(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border bg-slate-950 text-purple-300 border-slate-700 focus:outline-hidden"
                  />
                  <button
                    onClick={handleTestApi}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Mengirim...' : 'Eksekusi API'}</span>
                  </button>
                </div>
              </div>

              {/* cURL Snippet */}
              <div className="relative">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase mb-1">
                  <span>Sintaks cURL:</span>
                  <button
                    onClick={copyCode}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Tersalin' : 'Salin Code'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre">
                  {curlExample}
                </pre>
              </div>

              {/* API Response JSON */}
              {responseJson && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Hasil Response Server (JSON):
                  </span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72">
                    {responseJson}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
