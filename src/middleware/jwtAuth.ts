import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'beritaanda-jwt-hs256-super-secret-key-2026';

export interface AuthUserPayload {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'member';
  avatar?: string;
}

export type HonoEnv = {
  Variables: {
    user: AuthUserPayload;
    apiKeyRecord: { id: number; name: string; user_id: number; active: number };
  };
};

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export async function jwtAuthMiddleware(c: Context<HonoEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    // Check cookie
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    return c.json({ success: false, message: 'Akses ditolak: Token JWT HS256 tidak ditemukan' }, 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ success: false, message: 'Akses ditolak: Token JWT tidak valid atau kadaluarsa' }, 401);
  }

  c.set('user', payload);
  await next();
}
