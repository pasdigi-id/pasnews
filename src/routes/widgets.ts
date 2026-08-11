import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';

export const widgetsRouter = new Hono<HonoEnv>();

// GET /api/widgets - Public active widgets ordered by position and sort_order
widgetsRouter.get('/', async (c) => {
  const position = c.req.query('position');
  let sql = 'SELECT * FROM widgets WHERE is_active = 1';
  const params: any[] = [];

  if (position) {
    sql += ' AND position = ?';
    params.push(position);
  }

  sql += ' ORDER BY position ASC, sort_order ASC, id ASC';
  const rows = await queryAll(sql, params);

  // Parse JSON settings
  const parsed = rows.map((w) => {
    let settings = {};
    try {
      if (w.settings) settings = JSON.parse(w.settings);
    } catch (e) {
      settings = {};
    }
    return { ...w, settings };
  });

  return c.json({ success: true, data: parsed });
});

// ADMIN ROUTES
widgetsRouter.get('/admin/all', jwtAuthMiddleware, async (c) => {
  const rows = await queryAll('SELECT * FROM widgets ORDER BY position ASC, sort_order ASC, id ASC');
  const parsed = rows.map((w) => {
    let settings = {};
    try {
      if (w.settings) settings = JSON.parse(w.settings);
    } catch (e) {
      settings = {};
    }
    return { ...w, settings };
  });
  return c.json({ success: true, data: parsed });
});

widgetsRouter.post('/admin/create', jwtAuthMiddleware, async (c) => {
  try {
    const { title, type, position, sort_order, settings } = await c.req.json();
    if (!title || !type || !position) {
      return c.json({ success: false, message: 'Judul, Tipe, dan Posisi widget wajib diisi' }, 400);
    }

    const settingsStr = typeof settings === 'object' ? JSON.stringify(settings) : (settings || '{}');

    const { lastInsertId } = await execute(
      'INSERT INTO widgets (title, type, position, sort_order, is_active, settings) VALUES (?, ?, ?, ?, 1, ?)',
      [title, type, position, sort_order || 0, settingsStr]
    );

    const created = await queryOne('SELECT * FROM widgets WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Widget berhasil ditambahkan', data: created });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Real-Time Drag & Drop Reorder API
widgetsRouter.put('/admin/reorder', jwtAuthMiddleware, async (c) => {
  try {
    const { widgets } = await c.req.json(); // array of { id, position, sort_order }
    if (Array.isArray(widgets)) {
      for (const w of widgets) {
        await execute(
          'UPDATE widgets SET position = ?, sort_order = ? WHERE id = ?',
          [w.position, w.sort_order, w.id]
        );
      }
    }
    return c.json({ success: true, message: 'Tata letak & urutan widget real-time berhasil disimpan' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

widgetsRouter.put('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { title, type, position, sort_order, is_active, settings } = await c.req.json();

    const settingsStr = typeof settings === 'object' ? JSON.stringify(settings) : (settings || '{}');

    await execute(
      'UPDATE widgets SET title = ?, type = ?, position = ?, sort_order = ?, is_active = ?, settings = ? WHERE id = ?',
      [title, type, position, sort_order, is_active ? 1 : 0, settingsStr, id]
    );

    const updated = await queryOne('SELECT * FROM widgets WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Widget berhasil diperbarui', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

widgetsRouter.delete('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    await execute('DELETE FROM widgets WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Widget berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
