import React, { useState } from 'react';
import { X, Key, Plus, Copy, Check, Trash2, ShieldCheck } from 'lucide-react';
import { ApiKey } from '../types/index.js';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKey[];
  onCreateKey: (name: string) => Promise<void>;
  onRevokeKey: (id: number) => Promise<void>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onCreateKey,
  onRevokeKey
}) => {
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setLoading(true);
    try {
      await onCreateKey(keyName);
      setKeyName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(value);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="rounded-3xl border shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative bg-white border-slate-200 text-slate-900 dark:bg-[#0f1115] dark:border-slate-800 dark:text-slate-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Kelola Third-Party API Keys</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan header <code className="font-mono bg-purple-500/10 px-1 py-0.5 rounded text-purple-700 dark:text-purple-300">x-api-key</code> untuk autentikasi API eksternal</p>
          </div>
        </div>

        {/* Create new key form */}
        <form onSubmit={handleCreate} className="p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Nama Aplikasi / Service Eksternal (mis. App Mobile)"
            className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl border bg-white dark:bg-[#0f1115] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-purple-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Membuat...' : 'Buat API Key'}</span>
          </button>
        </form>

        {/* Keys List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daftar API Key Aktif ({apiKeys.length})
          </h4>

          {apiKeys.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Belum ada API Key eksternal yang dibuat.
            </p>
          ) : (
            apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl border space-y-2 bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{k.name}</span>
                  </div>
                  <button
                    onClick={() => onRevokeKey(k.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Revoke / Hapus API Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border overflow-x-auto bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {k.key_value}
                  </code>
                  <button
                    onClick={() => handleCopy(k.key_value)}
                    className="p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-500"
                  >
                    {copiedKey === k.key_value ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Permintaan: {k.requests_count}x</span>
                  <span>Dibuat: {new Date(k.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
