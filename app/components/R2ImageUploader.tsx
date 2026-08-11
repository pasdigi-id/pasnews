import React, { useState, useEffect } from 'react';
import { Upload, Cloud, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw, Link as LinkIcon, Database } from 'lucide-react';

interface R2ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: string;
  compact?: boolean;
}

export const R2ImageUploader: React.FC<R2ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Media Gambar (Cloudflare R2)',
  placeholder = 'https://... (URL R2 / CDN)',
  aspectRatio = 'aspect-16/9',
  compact = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [r2Status, setR2Status] = useState<{ configured: boolean; bucket_name: string; provider: string } | null>(null);

  useEffect(() => {
    // Check R2 status
    const token = localStorage.getItem('ba_jwt_token');
    fetch('/api/admin/r2-status', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setR2Status(data.status);
        }
      })
      .catch(() => {});
  }, []);

  const uploadFileToR2 = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, WEBP, GIF, SVG)');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('ba_jwt_token');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Gagal mengunggah file ke Cloudflare R2');
      }

      onChange(result.data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah gambar ke R2');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileToR2(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFileToR2(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-orange-500" />
          <span>{label}</span>
        </label>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900/60">
          <Cloud className="w-3 h-3 fill-orange-500/20" />
          <span>R2 Storage</span>
        </span>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-4 transition-all text-center ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#12141a]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mengunggah media ke Cloudflare R2...
              </span>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 border border-orange-200 dark:border-orange-800/60">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Drag & Drop gambar ke sini</span>
                <span className="text-slate-500 dark:text-slate-400"> atau </span>
                <label className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  pilih file dari perangkat
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Format: JPG, PNG, WEBP, GIF, SVG (Otomatis terhubung ke Cloudflare R2 bucket: {r2Status?.bucket_name || 'beritaanda-bucket'})
              </p>
            </>
          )}
        </div>
      </div>

      {/* URL Direct Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:border-emerald-500"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-2.5 py-2 rounded-xl border text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border-slate-200 dark:border-slate-800"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Image Preview */}
      {value && !compact && (
        <div className={`relative rounded-xl overflow-hidden border ${aspectRatio} max-h-48 bg-slate-900/5 border-slate-200 dark:border-slate-800`}>
          <img
            src={value}
            alt="R2 Upload Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1 border border-white/20">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Terhubung ke R2 Storage</span>
          </div>
        </div>
      )}
    </div>
  );
};
