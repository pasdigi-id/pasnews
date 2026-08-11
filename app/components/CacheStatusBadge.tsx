import React from 'react';
import { Zap, Database, Server } from 'lucide-react';

interface CacheStatusBadgeProps {
  source?: 'edge-kv' | 'sqlite-db' | string;
  responseTime?: number;
  onClearCache?: () => void;
  enabled?: boolean;
}

export const CacheStatusBadge: React.FC<CacheStatusBadgeProps> = ({
  source = 'sqlite-db',
  responseTime = 12,
  onClearCache,
  enabled = true
}) => {
  if (!enabled) return null;

  const isKV = source === 'edge-kv';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all bg-slate-100 border-slate-200 text-slate-700 dark:bg-[#16181d] dark:border-slate-800 dark:text-slate-300">
      <div className="flex items-center gap-1.5">
        {isKV ? (
          <>
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">EDGE KV HIT</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">SQLITE DB QUERY</span>
          </>
        )}
      </div>

      <span className="text-slate-400 dark:text-slate-600">•</span>
      <span className="text-[11px]">{responseTime}ms</span>

      {onClearCache && (
        <button
          onClick={onClearCache}
          className="ml-1 text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
          title="Invalida Cache KV"
        >
          purge
        </button>
      )}
    </div>
  );
};
