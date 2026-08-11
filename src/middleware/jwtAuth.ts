import { Context, Next } from 'hono';
import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'beritaanda-jwt-hs256-super-secret-key-2026';

export interface AuthUserPayload {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'member';
  avatar?: string;
  exp?: number;
}

export type HonoEnv = {
  Variables: {
    user: AuthUserPayload;
    apiKeyRecord: { id: number; name: string; user_id: number; active: number };
  };
};

export async function generateToken(payload: AuthUserPayload): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 Hari
  return await sign({ ...payload, exp }, JWT_SECRET, 'HS256');
}

export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    return await verify(token, JWT_SECRET, 'HS256') as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export async function jwtAuthMiddleware(c: Context<HonoEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    return c.json({ success: false, message: 'Akses ditolak: Token JWT HS256 tidak ditemukan' }, 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ success: false, message: 'Akses ditolak: Token JWT tidak valid atau kadaluarsa' }, 401);
  }

  c.set('user', payload);
  await next();
}
