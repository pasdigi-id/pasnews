import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';
import { kvCache } from '../services/cacheService.js';

export const memberRouter = new Hono<HonoEnv>();

// Apply JWT authentication to all member endpoints
memberRouter.use('*', jwtAuthMiddleware);

// GET /api/member/bookmarks - Get bookmarked posts
memberRouter.get('/bookmarks', async (c) => {
  const user = c.get('user');
  const posts = await queryAll(`
    SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.created_at, p.views,
           c.name as category_name, c.color as category_color, b.created_at as bookmarked_at
    FROM bookmarks b
    JOIN posts p ON b.post_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `, [user.id]);

  return c.json({ success: true, data: posts });
});

// POST /api/member/bookmarks/:postId - Toggle bookmark
memberRouter.post('/bookmarks/:postId', async (c) => {
  try {
    const user = c.get('user');
    const postId = parseInt(c.req.param('postId'), 10);

    const existing = await queryOne('SELECT user_id FROM bookmarks WHERE user_id = ? AND post_id = ?', [user.id, postId]);
    if (existing) {
      await execute('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [user.id, postId]);
      return c.json({ success: true, bookmarked: false, message: 'Dihapus dari simpanan' });
    } else {
      await execute('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [user.id, postId]);
      return c.json({ success: true, bookmarked: true, message: 'Berhasil disimpan' });
    }
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET /api/member/history - Get reading history
memberRouter.get('/history', async (c) => {
  const user = c.get('user');
  const history = await queryAll(`
    SELECT h.id, h.read_at, p.id as post_id, p.title, p.slug, p.excerpt, p.cover_image,
           c.name as category_name, c.color as category_color
    FROM reading_history h
    JOIN posts p ON h.post_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE h.user_id = ?
    ORDER BY h.read_at DESC
    LIMIT 30
  `, [user.id]);

  return c.json({ success: true, data: history });
});

// POST /api/member/history/:postId - Record post view in history
memberRouter.post('/history/:postId', async (c) => {
  try {
    const user = c.get('user');
    const postId = parseInt(c.req.param('postId'), 10);

    // Insert reading history entry
    await execute('INSERT INTO reading_history (user_id, post_id) VALUES (?, ?)', [user.id, postId]);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET /api/member/submissions - Member article submissions
memberRouter.get('/submissions', async (c) => {
  const user = c.get('user');
  const posts = await queryAll(`
    SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.status, p.created_at, p.updated_at,
           c.name as category_name
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    WHERE p.author_id = ?
    ORDER BY p.updated_at DESC
  `, [user.id]);

  return c.json({ success: true, data: posts });
});

// POST /api/member/submissions - Submit draft article
memberRouter.post('/submissions', async (c) => {
  try {
    const user = c.get('user');
    const { title, content, excerpt, category_id, cover_image } = await c.req.json();

    if (!title || !content || !category_id) {
      return c.json({ success: false, message: 'Judul, isi artikel, dan kategori wajib diisi' }, 400);
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existingSlug = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const postExcerpt = excerpt || content.substring(0, 150) + '...';
    const postCover = cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80';

    const { lastInsertId } = await execute(
      `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [title, slug, content, postExcerpt, category_id, user.id, postCover]
    );

    kvCache.invalidateTag('posts');

    return c.json({
      success: true,
      message: 'Draft artikel berhasil dikirim untuk ditinjau oleh tim Redaksi',
      id: lastInsertId
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// PUT /api/member/profile - Update profile
memberRouter.put('/profile', async (c) => {
  try {
    const user = c.get('user');
    const { name, avatar } = await c.req.json();

    await execute('UPDATE users SET name = ?, avatar = ? WHERE id = ?', [name || user.name, avatar || user.avatar, user.id]);

    const updatedUser = await queryOne('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [user.id]);
    return c.json({ success: true, message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
