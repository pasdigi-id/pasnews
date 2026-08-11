import React, { useState } from 'react';
import { Key, Copy, Check, Plus, Trash2, Shield, Code, Send } from 'lucide-react';
import { ApiKey } from '../types';

interface Props {
  apiKeys: ApiKey[];
  token: string;
  onKeyCreated: () => void;
  onKeyDeleted: () => void;
}

export const ApiKeyManager: React.FC<Props> = ({
  apiKeys,
  token,
  onKeyCreated,
  onKeyDeleted
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newKeyName })
      });

      const data = await res.json();
      if (data.success) {
        setNewKeyName('');
        onKeyCreated();
      } else {
        setErrorMsg(data.message || 'Gagal membuat API Key');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke API Server');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin mencabut API Key ini? Aplikasi terkait tidak akan dapat mengakses API.')) return;

    try {
      await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onKeyDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0f1115] text-slate-200 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            <span>Manajemen API Key Integrasi Pihak Ketiga</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gunakan API Key dengan header <code className="bg-[#16181d] px-1.5 py-0.5 rounded text-purple-300 border border-slate-800 font-mono">x-api-key</code> untuk publikasi berita dari sistem eksternal.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 text-red-300 border border-red-800/80 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Generate New API Key Form */}
      <form onSubmit={handleCreateKey} className="flex gap-2">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Nama Aplikasi / Klien (misal: Aplikasi Mobile Berita, Bot Telegram, CMS Eksternal)"
          className="flex-1 px-3.5 py-2 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-500 placeholder-slate-500"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{creating ? 'Proses...' : 'Buat API Key'}</span>
        </button>
      </form>

      {/* API Keys Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#16181d]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0a0a0b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold">
            <tr>
              <th className="p-3">Nama Aplikasi</th>
              <th className="p-3">Secret Key Value</th>
              <th className="p-3">Total Requests</th>
              <th className="p-3">Terakhir Digunakan</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                  Belum ada API Key aktif. Buat satu di atas untuk integrasi aplikasi pihak ketiga.
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-white">{key.name}</td>
                  <td className="p-3 font-mono text-purple-300">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-950/60 border border-purple-800/80 px-2 py-1 rounded text-[11px]">
                        {key.key_value}
                      </span>
                      <button
                        onClick={() => copyToClipboard(key.key_value, key.id)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                        title="Salin Key"
                      >
                        {copiedId === key.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{key.requests_count} req</td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {key.last_used_at
                      ? new Date(key.last_used_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Belum pernah'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-1.5 text-red-400 hover:bg-red-950/60 rounded-lg transition-colors border border-red-900/40"
                      title="Cabut Access Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
