import { Hono } from 'hono';
import { kvCache } from '../services/cacheService.js';

export const cacheRouter = new Hono();

cacheRouter.get('/stats', (c) => {
  return c.json({
    success: true,
    stats: kvCache.getStats()
  });
});

cacheRouter.post('/purge', (c) => {
  kvCache.clear();
  return c.json({
    success: true,
    message: 'Cloudflare KV / In-Memory Cache berhasil dibersihkan (Cache Purged)'
  });
});
