import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';

export const menusRouter = new Hono<HonoEnv>();

// GET /api/menus - Public active menus
menusRouter.get('/', async (c) => {
  const location = c.req.query('location');
  let sql = 'SELECT * FROM menus WHERE is_active = 1';
  const params: any[] = [];

  if (location) {
    sql += ' AND location = ?';
    params.push(location);
  }

  sql += ' ORDER BY sort_order ASC, id ASC';
  const menus = await queryAll(sql, params);
  return c.json({ success: true, data: menus });
});

// ADMIN ROUTES
menusRouter.get('/admin/all', jwtAuthMiddleware, async (c) => {
  const menus = await queryAll('SELECT * FROM menus ORDER BY location ASC, sort_order ASC, id ASC');
  return c.json({ success: true, data: menus });
});

menusRouter.post('/admin/create', jwtAuthMiddleware, async (c) => {
  try {
    const { location, title, url, target, sort_order, icon } = await c.req.json();
    if (!title || !url || !location) {
      return c.json({ success: false, message: 'Lokasi, Judul, dan URL wajib diisi' }, 400);
    }

    const { lastInsertId } = await execute(
      'INSERT INTO menus (location, title, url, target, sort_order, icon, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [location, title, url, target || '_self', sort_order || 0, icon || 'Link']
    );

    const created = await queryOne('SELECT * FROM menus WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Item menu berhasil ditambahkan', data: created });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

menusRouter.put('/admin/reorder', jwtAuthMiddleware, async (c) => {
  try {
    const { items } = await c.req.json(); // array of { id, sort_order }
    if (Array.isArray(items)) {
      for (const item of items) {
        await execute('UPDATE menus SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
    }
    return c.json({ success: true, message: 'Urutan menu berhasil disimpan' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

menusRouter.put('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { location, title, url, target, sort_order, icon, is_active } = await c.req.json();

    await execute(
      'UPDATE menus SET location = ?, title = ?, url = ?, target = ?, sort_order = ?, icon = ?, is_active = ? WHERE id = ?',
      [location, title, url, target, sort_order, icon, is_active ? 1 : 0, id]
    );

    const updated = await queryOne('SELECT * FROM menus WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Menu berhasil diperbarui', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

menusRouter.delete('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    await execute('DELETE FROM menus WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Item menu berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
