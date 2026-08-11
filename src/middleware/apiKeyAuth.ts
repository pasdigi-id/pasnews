import { Context, Next } from 'hono';
import { queryOne, execute } from '../db/index.js';
import { HonoEnv } from './jwtAuth.js';

export async function apiKeyAuthMiddleware(c: Context<HonoEnv>, next: Next) {
  const apiKey = c.req.header('x-api-key') || c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ 
      success: false, 
      message: 'Akses Pihak Ketiga Ditolak: Header "x-api-key" tidak ditemukan' 
    }, 401);
  }

  const keyRecord = await queryOne<{ id: number; name: string; user_id: number; active: number }>(
    'SELECT id, name, user_id, active FROM api_keys WHERE key_value = ?',
    [apiKey]
  );

  if (!keyRecord || !keyRecord.active) {
    return c.json({ 
      success: false, 
      message: 'Akses Pihak Ketiga Ditolak: API Key tidak valid atau tidak aktif' 
    }, 403);
  }

  // Update requests_count and last_used_at
  await execute(
    'UPDATE api_keys SET requests_count = requests_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?',
    [keyRecord.id]
  );

  c.set('apiKeyRecord', keyRecord);
  await next();
}
