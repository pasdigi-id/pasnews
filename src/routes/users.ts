import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';

export const usersRouter = new Hono<HonoEnv>();

// ADMIN ROUTES
usersRouter.use('*', jwtAuthMiddleware);

// GET /api/users/admin/all - List all users with post counts
usersRouter.get('/admin/all', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'editor') {
    return c.json({ success: false, message: 'Akses ditolak' }, 403);
  }

  const users = await queryAll(`
    SELECT u.id, u.name, u.email, u.role, u.avatar,
           (SELECT COUNT(*) FROM posts WHERE author_id = u.id) as post_count
    FROM users u
    ORDER BY u.id DESC
  `);

  return c.json({ success: true, data: users });
});

// POST /api/users/admin/create - Create user (Admin/Editor/Reporter/Member)
usersRouter.post('/admin/create', async (c) => {
  try {
    const loggedIn = c.get('user');
    if (loggedIn.role !== 'admin') {
      return c.json({ success: false, message: 'Hanya Admin Utama yang berhak membuat akun pengguna baru' }, 403);
    }

    const { name, email, password, role, avatar } = await c.req.json();
    if (!name || !email || !password) {
      return c.json({ success: false, message: 'Nama, Email, dan Password wajib diisi' }, 400);
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return c.json({ success: false, message: 'Email sudah terdaftar' }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const userRole = role || 'member';

    const { lastInsertId } = await execute(
      'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, userRole, userAvatar]
    );

    const created = await queryOne('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Pengguna berhasil ditambahkan', data: created });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// PUT /api/users/admin/:id - Update user role / info
usersRouter.put('/admin/:id', async (c) => {
  try {
    const loggedIn = c.get('user');
    if (loggedIn.role !== 'admin') {
      return c.json({ success: false, message: 'Hanya Admin Utama yang berhak mengubah peran akun' }, 403);
    }

    const id = parseInt(c.req.param('id'), 10);
    const { name, email, role, avatar } = await c.req.json();

    await execute(
      'UPDATE users SET name = ?, email = ?, role = ?, avatar = ? WHERE id = ?',
      [name, email, role, avatar, id]
    );

    const updated = await queryOne('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Pengguna berhasil diperbarui', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// DELETE /api/users/admin/:id - Delete user
usersRouter.delete('/admin/:id', async (c) => {
  try {
    const loggedIn = c.get('user');
    if (loggedIn.role !== 'admin') {
      return c.json({ success: false, message: 'Hanya Admin Utama yang berhak menghapus akun' }, 403);
    }

    const id = parseInt(c.req.param('id'), 10);
    if (id === loggedIn.id) {
      return c.json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' }, 400);
    }

    await execute('DELETE FROM users WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
