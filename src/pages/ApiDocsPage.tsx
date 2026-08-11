import React, { useState } from 'react';
import { Code, Send, CheckCircle, Copy, Check, Terminal, Key, FileText } from 'lucide-react';
import { Category } from '../types';

interface Props {
  categories: Category[];
}

export const ApiDocsPage: React.FC<Props> = ({ categories }) => {
  const [apiKey, setApiKey] = useState('ba_live_8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c');
  const [postTitle, setPostTitle] = useState('Berita Eksternal dari Aplikasi Pihak Ketiga');
  const [postContent, setPostContent] = useState('Artikel berita ini dikirim secara otomatis via API Key x-api-key tanpa menggunakan dashboard web UI...');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80');

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const curlExample = `curl -X POST "${window.location.origin}/api/v1/posts" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "title": "${postTitle}",
    "content": "${postContent}",
    "category_id": ${categoryId},
    "cover_image": "${coverImage}"
  }'`;

  const handleSendApiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiResponse(null);

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          category_id: categoryId,
          cover_image: coverImage
        })
      });

      setResponseStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message || 'Gagal mengirim request' });
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
          <Code className="w-4 h-4" /> Dokumentasi & Playground Integrasi Pihak Ketiga
        </div>
        <h1 className="text-2xl font-black">Third-Party REST API (x-api-key)</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Sesuai dengan alur plan arsitektur, aplikasi pihak ketiga dapat langsung mengirimkan artikel berita ke database SQLite via endpoint REST API <code className="bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800 text-purple-300 font-mono">POST /api/v1/posts</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Testing Form */}
        <div className="bg-[#0f1115] p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 text-slate-200">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              <span>Simulasi Request Pihak Ketiga</span>
            </h3>
            <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold rounded">
              POST /api/v1/posts
            </span>
          </div>

          <form onSubmit={handleSendApiTest} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">
                Header "x-api-key" *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#16181d] text-purple-300 border border-slate-800 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">
                Judul Berita (title) *
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">
                Kategori (category_id) *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f1115] text-slate-200">
                    {c.name} (ID: {c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">
                Konten Berita (content) *
              </label>
              <textarea
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full px-3 py-2 bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Mengirim Request...' : 'Kirim HTTP POST Request'}</span>
            </button>
          </form>
        </div>

        {/* cURL & JSON Response Console */}
        <div className="space-y-6">
          {/* cURL Command Snippet */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Terminal className="w-4 h-4" /> cURL Command
              </span>
              <button
                onClick={copyCurl}
                className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {curlExample}
            </pre>
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">Response Console</span>
              {responseStatus && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${responseStatus === 201 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  HTTP {responseStatus}
                </span>
              )}
            </div>

            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : '// Klik "Kirim HTTP POST Request" untuk melihat balasan JSON dari Hono Backend...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
