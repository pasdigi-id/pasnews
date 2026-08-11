import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';
import { kvCache } from '../services/cacheService.js';

export const pagesRouter = new Hono<HonoEnv>();

// GET /api/pages - List public published pages
pagesRouter.get('/', async (c) => {
  const pages = await queryAll(
    "SELECT id, title, slug, show_in_menu, updated_at FROM pages WHERE status = 'published' ORDER BY title ASC"
  );
  return c.json({ success: true, data: pages });
});

// GET /api/pages/:slug - Get page details
pagesRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const page = await queryOne('SELECT * FROM pages WHERE slug = ? AND status = "published"', [slug]);
  if (!page) {
    return c.json({ success: false, message: 'Halaman tidak ditemukan' }, 404);
  }
  return c.json({ success: true, data: page });
});

// ADMIN ROUTES (Protected by JWT Auth)
pagesRouter.get('/admin/all', jwtAuthMiddleware, async (c) => {
  const pages = await queryAll('SELECT * FROM pages ORDER BY updated_at DESC');
  return c.json({ success: true, data: pages });
});

pagesRouter.post('/admin/create', jwtAuthMiddleware, async (c) => {
  try {
    const { title, content, status, show_in_menu } = await c.req.json();
    if (!title || !content) {
      return c.json({ success: false, message: 'Judul dan konten halaman wajib diisi' }, 400);
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await queryOne('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { lastInsertId } = await execute(
      'INSERT INTO pages (title, slug, content, status, show_in_menu) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, status || 'published', show_in_menu ? 1 : 0]
    );

    const newPage = await queryOne('SELECT * FROM pages WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Halaman berhasil dibuat', data: newPage });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

pagesRouter.put('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { title, content, status, show_in_menu } = await c.req.json();

    await execute(
      'UPDATE pages SET title = ?, content = ?, status = ?, show_in_menu = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, status, show_in_menu ? 1 : 0, id]
    );

    const updated = await queryOne('SELECT * FROM pages WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Halaman berhasil diperbarui', data: updated });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

pagesRouter.delete('/admin/:id', jwtAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    await execute('DELETE FROM pages WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Halaman berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
