import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Edit3, Trash2, CheckCircle, UserCheck } from 'lucide-react';
import { User } from '../types/index.js';
import { R2ImageUploader } from './R2ImageUploader.js';

interface AdminUsersPanelProps {
  currentUser: User;
}

export const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'reporter' | 'member'>('reporter');
  const [avatar, setAvatar] = useState('');
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('ba_jwt_token');
    try {
      const res = await fetch('/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenForm = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setEmail(u.email);
      setPassword('');
      setRole(u.role);
      setAvatar(u.avatar || '');
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setRole('reporter');
      setAvatar('');
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ba_jwt_token');
    const isEdit = !!editingUser;
    const url = isEdit ? `/api/users/admin/${editingUser.id}` : '/api/users/admin/create';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        avatar
      })
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      setMsg(isEdit ? 'Pengguna berhasil diperbarui' : 'Pengguna baru berhasil dibuat');
      setTimeout(() => setMsg(''), 3000);
      fetchUsers();
    } else {
      alert(data.message || 'Gagal menyimpan akun');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) return;
    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch(`/api/users/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      fetchUsers();
    } else {
      alert(data.message || 'Gagal menghapus pengguna');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base">Manajemen Tim Redaksi & Pengguna</h2>
            <p className="text-xs text-slate-400">
              Atur hak akses pengguna: Admin Utama, Editor Senior, Reporter/Wartawan, dan Member Pembaca.
            </p>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota Redaksi</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl border overflow-hidden bg-white border-slate-200 dark:bg-[#0f1115] dark:border-slate-800 text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-[#16181d] border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="p-3.5">Pengguna / Tim Redaksi</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Peran / Role</th>
              <th className="p-3.5">Total Berita</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="p-3.5 flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span>{u.name}</span>
                </td>
                <td className="p-3.5 text-slate-500">{u.email}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : u.role === 'editor'
                        ? 'bg-purple-500/20 text-purple-400'
                        : u.role === 'reporter'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5 text-slate-500 font-bold">{u.post_count || 0} Artikel</td>
                <td className="p-3.5 text-right space-x-1">
                  {currentUser.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleOpenForm(u)}
                        className="p-1.5 rounded-lg border text-slate-400 hover:text-purple-500 border-slate-200 dark:border-slate-800"
                        title="Edit Peran"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg border text-slate-400 hover:text-red-500 border-slate-200 dark:border-slate-800"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {editingUser ? 'Edit Hak Akses Pengguna' : 'Tambah Anggota Redaksi Baru'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Maya Kartika (Reporter)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@beritaanda.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Password Akses
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Peran / Hak Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-[#16181d] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-bold"
                >
                  <option value="admin">Admin Utama (Akses Penuh)</option>
                  <option value="editor">Editor Senior (Kelola Artikel & Kategori)</option>
                  <option value="reporter">Reporter / Wartawan (Tulis Artikel Baru)</option>
                  <option value="member">Member Pembaca (Bookmark & Diskusi)</option>
                </select>
              </div>

              <R2ImageUploader
                value={avatar}
                onChange={(url) => setAvatar(url)}
                label="Foto Profil / Avatar (Cloudflare R2)"
                placeholder="https://... (URL Foto Avatar R2 / CDN)"
                aspectRatio="aspect-square"
                compact
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-black rounded-xl font-bold text-xs"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
