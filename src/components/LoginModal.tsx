import React, { useState } from 'react';
import { Key, X, Shield, Lock, Mail } from 'lucide-react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@beritaanda.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setErrorMsg(data.message || 'Login gagal');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f1115] text-slate-200 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Login Redaksi / Editor</h3>
            <p className="text-xs text-slate-400">Masuk dengan kredensial JWT HS256</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-950/60 text-red-300 border border-red-800/80 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Email Redaksi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#16181d] text-slate-200 border border-slate-800 rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-[#16181d] border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-0.5">
            <span className="font-bold text-emerald-400 block">Default Credential (Akun Demo):</span>
            <div>Email: <code className="font-mono text-white">admin@beritaanda.com</code></div>
            <div>Password: <code className="font-mono text-white">admin123456</code></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
