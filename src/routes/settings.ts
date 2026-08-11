import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { HonoEnv } from '../middleware/jwtAuth.js';
import { kvCache } from '../services/cacheService.js';

export const settingsRouter = new Hono<HonoEnv>();

// GET /api/settings - Public application settings
settingsRouter.get('/', async (c) => {
  const cached = kvCache.get<Record<string, string>>('system_settings');
  if (cached) {
    return c.json({ success: true, settings: cached, source: 'edge-kv-cache' });
  }

  const rows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM system_settings');
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  kvCache.set('system_settings', settings, 3600);
  return c.json({ success: true, settings, source: 'sqlite-db' });
});
