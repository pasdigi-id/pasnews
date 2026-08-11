import { Hono } from 'hono';
import { apiKeyAuthMiddleware } from '../middleware/apiKeyAuth.js';
import { execute, queryOne, queryAll } from '../db/index.js';
import { kvCache } from '../services/cacheService.js';
import { HonoEnv } from '../middleware/jwtAuth.js';

export const externalRouter = new Hono<HonoEnv>();

// Apply API Key Middleware to external 3rd-party routes
externalRouter.use('*', apiKeyAuthMiddleware);

// GET /api/v1/posts - Fetch published posts via API Key
externalRouter.get('/posts', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const posts = await queryAll(`
    SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.views, p.created_at, c.name as category
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [limit]);

  return c.json({
    success: true,
    message: 'Data posts diproses via Third-Party API Key',
    data: posts
  });
});

// POST /api/v1/posts - Publish new article via Third-Party Application (Aplikasi Pihak Ketiga)
externalRouter.post('/posts', async (c) => {
  try {
    const keyRecord = c.get('apiKeyRecord');
    const { title, content, excerpt, category_id, cover_image } = await c.req.json();

    if (!title || !content || !category_id) {
      return c.json({
        success: false,
        message: 'Validasi Gagal: Param "title", "content", dan "category_id" wajib diisi'
      }, 400);
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existingSlug = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const postExcerpt = excerpt || content.substring(0, 160) + '...';
    const postCover = cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';

    const { lastInsertId } = await execute(
      `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
      [title, slug, content, postExcerpt, category_id, keyRecord.user_id, postCover]
    );

    // Invalidate KV Edge Cache
    kvCache.invalidateTag('posts');

    const createdPost = await queryOne('SELECT * FROM posts WHERE id = ?', [lastInsertId]);

    return c.json({
      success: true,
      message: `Artikel berhasil dipublikasikan via Third-Party Key (${keyRecord.name})`,
      data: createdPost
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
