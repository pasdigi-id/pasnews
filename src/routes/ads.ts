import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';

export const adsRouter = new Hono<HonoEnv>();

// GET /api/ads - Get active ad banners by placement
adsRouter.get('/', async (c) => {
  const placement = c.req.query('placement');
  let sql = 'SELECT * FROM ad_banners WHERE is_active = 1';
  const params: any[] = [];

  if (placement) {
    sql += ' AND placement = ?';
    params.push(placement);
  }

  sql += ' ORDER BY id DESC';
  const ads = await queryAll(sql, params);

  // Increment impressions
  if (ads.length > 0) {
    for (const ad of ads) {
      execute('UPDATE ad_banners SET impressions = impressions + 1 WHERE id = ?', [ad.id]).catch(() => {});
    }
  }

  return c.json({ success: true, data: ads });
});

// POST /api/ads/:id/click - Track click
adsRouter.post('/:id/click', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await execute('UPDATE ad_banners SET clicks = clicks + 1 WHERE id = ?', [id]);
  return c.json({ success: true, message: 'Click recorded' });
});

// ADMIN ROUTES
adsRouter.get('/admin/all', jwtAuthMiddleware, async (c) => {
  const ads = await queryAll('SELECT * FROM ad_banners ORDER BY created_at DESC');
  return c.json({ success: true, data: ads });
});

adsRouter.post('/admin/create', jwtAuthMiddleware, async (c) => {
  try {
    const { title, placement, image_url, target_url, start_date, end_date } = await c.req.json();
    if (!title || !placement || !image_url || !target_url) {
      return c.json({ success: false, message: 'Judul, Penempatan, URL Gambar, dan URL Target wajib diisi' }, 400);
    }

    const { lastInsertId } = await execute(
      'INSERT INTO ad_banners (title, placement, image_url, target_url, is_active, start_date, end_date) VALUES (?, ?, ?, ?, 1, ?, ?)',
      [title, placement, image_url, target_url, start_date || null, end_date || null]
    );

    const created = await queryOne('SELECT * FROM ad_banners WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Banner iklan berhasil diterbitkan', data: created });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

adsRouter.put('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { title, placement, image_url, target_url, is_active, start_date, end_date } = await c.req.json();

    await execute(
      'UPDATE ad_banners SET title = ?, placement = ?, image_url = ?, target_url = ?, is_active = ?, start_date = ?, end_date = ? WHERE id = ?',
      [title, placement, image_url, target_url, is_active ? 1 : 0, start_date || null, end_date || null, id]
    );

    const updated = await queryOne('SELECT * FROM ad_banners WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Banner iklan berhasil diperbarui', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

adsRouter.delete('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    await execute('DELETE FROM ad_banners WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Banner iklan berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
