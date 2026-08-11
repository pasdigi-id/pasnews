import React, { useState } from 'react';
import { X, Key, Mail, Lock, Shield, User, UserPlus } from 'lucide-react';
import { User as UserType } from '../types/index.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType, token: string) => void;
  allowRegistration?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allowRegistration = true
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@beritaanda.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Gagal memproses autentikasi');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const setPresetCredential = (type: 'admin' | 'member') => {
    setIsRegister(false);
    if (type === 'admin') {
      setEmail('admin@beritaanda.com');
      setPassword('admin123456');
    } else {
      setEmail('member@beritaanda.com');
      setPassword('member123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="rounded-3xl border shadow-2xl max-w-md w-full p-6 sm:p-8 relative bg-white border-slate-200 text-slate-900 dark:bg-[#0f1115] dark:border-slate-800 dark:text-slate-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            {isRegister ? <UserPlus className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isRegister ? 'Pendaftaran Member Baru' : 'Akses Role System'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRegister ? 'Buat akun untuk simpanan artikel & riwayat' : 'Masuk dengan kredensial JWT HS256'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl text-xs font-medium border bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quick Credential Demo Presets */}
          {!isRegister && (
            <div className="p-3 rounded-xl border text-[11px] space-y-2 bg-slate-100 dark:bg-[#16181d] border-slate-200 dark:border-slate-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Pilih Akun Demo (Akses Instant):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPresetCredential('admin')}
                  className="p-2 rounded-lg border text-left bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                  <span className="font-bold block text-slate-900 dark:text-white">Role Admin / Editor</span>
                  <span className="text-[10px] text-slate-500">admin@beritaanda.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCredential('member')}
                  className="p-2 rounded-lg border text-left bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                  <span className="font-bold block text-slate-900 dark:text-white">Role Member</span>
                  <span className="text-[10px] text-slate-500">member@beritaanda.com</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi...' : isRegister ? 'Daftar Akun Member' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

        {allowRegistration && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar Member baru'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
