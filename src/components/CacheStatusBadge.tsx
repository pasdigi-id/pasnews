import React, { useState } from 'react';
import { Zap, RefreshCw, CheckCircle } from 'lucide-react';

interface Props {
  cacheStatus?: 'HIT' | 'MISS' | null;
  onCachePurged?: () => void;
}

export const CacheStatusBadge: React.FC<Props> = ({ cacheStatus, onCachePurged }) => {
  const [purging, setPurging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePurge = async () => {
    setPurging(true);
    try {
      const res = await fetch('/api/cache/purge', { method: 'POST' });
      const data = await res.json();
      setMessage('Cache Purged!');
      setTimeout(() => setMessage(null), 3000);
      if (onCachePurged) onCachePurged();
    } catch (err) {
      console.error(err);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-full text-xs font-mono border border-slate-800 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Zap className={`w-3.5 h-3.5 ${cacheStatus === 'HIT' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
        <span className="text-slate-400">Edge Cache:</span>
        <span className={`font-semibold ${cacheStatus === 'HIT' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {cacheStatus || 'KV ACTIVE'}
        </span>
      </div>

      <button
        onClick={handlePurge}
        disabled={purging}
        title="Purge Cloudflare KV Edge Cache"
        className="ml-1 text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-700"
      >
        <RefreshCw className={`w-3 h-3 ${purging ? 'animate-spin text-blue-400' : ''}`} />
        <span>Clear</span>
      </button>

      {message && (
        <span className="text-emerald-400 text-[10px] font-sans flex items-center gap-1 animate-fade-in">
          <CheckCircle className="w-3 h-3" /> {message}
        </span>
      )}
    </div>
  );
};
