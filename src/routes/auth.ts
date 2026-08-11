import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '../db/index.js';
import { generateToken, jwtAuthMiddleware, HonoEnv, AuthUserPayload } from '../middleware/jwtAuth.js';

export const authRouter = new Hono<HonoEnv>();

authRouter.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ success: false, message: 'Nama, email, dan password wajib diisi' }, 400);
    }

    const regSetting = await queryOne<{ value: string }>('SELECT value FROM system_settings WHERE key = ?', ['allow_member_registration']);
    if (regSetting && regSetting.value === 'false') {
      return c.json({ success: false, message: 'Pendaftaran member baru sedang dinonaktifkan oleh Administrator' }, 403);
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return c.json({ success: false, message: 'Email sudah terdaftar. Silakan login.' }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    // PERBAIKAN: Menggunakan 'full_name' sesuai dengan schema.sql dan menghapus kolom 'avatar' dari kueri INSERT
    const { lastInsertId } = await execute(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'member']
    );

    const tokenPayload: AuthUserPayload = {
      id: lastInsertId,
      name: name,
      email,
      role: 'member'
    };

    const token = generateToken(tokenPayload);

    return c.json({
      success: true,
      message: 'Registrasi member berhasil',
      token,
      user: {
        id: lastInsertId,
        name: name,
        email,
        role: 'member',
        avatar: defaultAvatar // Injeksi avatar default untuk kebutuhan frontend
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Terjadi kesalahan pada server saat registrasi' }, 500);
  }
});

authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, message: 'Email dan password wajib diisi' }, 400);
    }

    const user = await queryOne<any>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return c.json({ success: false, message: 'Email atau password salah' }, 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ success: false, message: 'Email atau password salah' }, 401);
    }
    
    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    const tokenPayload: AuthUserPayload = {
      id: user.id,
      name: user.full_name, // PERBAIKAN: Mapping full_name dari database ke property name di token
      email: user.email,
      role: user.role as 'admin' | 'editor' | 'member'
    };

    const token = generateToken(tokenPayload);

    return c.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.full_name, // PERBAIKAN: Mapping full_name
        email: user.email,
        role: user.role,
        avatar: defaultAvatar // Injeksi avatar default
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Terjadi kesalahan pada server saat login' }, 500);
  }
});

authRouter.get('/me', jwtAuthMiddleware, async (c) => {
  try {
    const user = c.get('user');
    // PERBAIKAN: Menggunakan 'full_name' bukan 'name' dan menghapus 'avatar'
    const userRecord = await queryOne<any>('SELECT id, full_name, email, role FROM users WHERE id = ?', [user.id]);
    
    if (!userRecord) {
      return c.json({ success: false, message: 'User tidak ditemukan' }, 404);
    }

    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    return c.json({ 
      success: true, 
      user: {
        id: userRecord.id,
        name: userRecord.full_name, // PERBAIKAN: Mapping full_name ke name
        email: userRecord.email,
        role: userRecord.role,
        avatar: defaultAvatar // Injeksi avatar default
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Terjadi kesalahan saat mengambil data user' }, 500);
  }
});
