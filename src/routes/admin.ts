import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { jwtAuthMiddleware, HonoEnv } from '../middleware/jwtAuth.js';
import { processImageUpload, getR2ConfigStatus } from '../services/uploadService.js';
import { kvCache } from '../services/cacheService.js';
import { SystemStats } from '../types/index.js';

export const adminRouter = new Hono<HonoEnv>();

// Apply JWT Authentication to all admin routes
adminRouter.use('*', jwtAuthMiddleware);

// GET /api/admin/posts - List all posts (published + draft)
adminRouter.get('/posts', async (c) => {
  const posts = await queryAll(`
    SELECT 
      p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.status, p.views, p.created_at, p.updated_at,
      p.category_id, c.name as category_name, c.slug as category_slug,
      u.name as author_name
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.author_id = u.id
    ORDER BY p.updated_at DESC
  `);
  return c.json({ success: true, data: posts });
});

// POST /api/admin/posts - Create post
adminRouter.post('/posts', async (c) => {
  try {
    const user = c.get('user');
    const { title, content, excerpt, category_id, cover_image, status } = await c.req.json();

    if (!title || !content || !category_id) {
      return c.json({ success: false, message: 'Judul, konten, dan kategori wajib diisi' }, 400);
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existingSlug = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const postExcerpt = excerpt || content.substring(0, 160) + '...';
    const postCover = cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80';
    const postStatus = status || 'published';

    const { lastInsertId } = await execute(
      `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, postExcerpt, category_id, user.id, postCover, postStatus]
    );

    // Invalidate Cache Layer
    kvCache.invalidateTag('posts');

    const createdPost = await queryOne('SELECT * FROM posts WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'Artikel berhasil dibuat', data: createdPost });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// PUT /api/admin/posts/:id - Update post
adminRouter.put('/posts/:id', async (c) => {
  try {
    const postId = parseInt(c.req.param('id'), 10);
    const { title, content, excerpt, category_id, cover_image, status } = await c.req.json();

    const existing = await queryOne('SELECT id, slug FROM posts WHERE id = ?', [postId]);
    if (!existing) {
      return c.json({ success: false, message: 'Artikel tidak ditemukan' }, 404);
    }

    await execute(
      `UPDATE posts 
       SET title = ?, content = ?, excerpt = ?, category_id = ?, cover_image = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, excerpt, category_id, cover_image, status, postId]
    );

    // Invalidate Cache Layer
    kvCache.invalidateTag('posts');
    kvCache.invalidateTag(`post_${postId}`);

    const updatedPost = await queryOne('SELECT * FROM posts WHERE id = ?', [postId]);
    return c.json({ success: true, message: 'Artikel berhasil diperbarui', data: updatedPost });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// DELETE /api/admin/posts/:id - Delete post
adminRouter.delete('/posts/:id', async (c) => {
  try {
    const postId = parseInt(c.req.param('id'), 10);
    await execute('DELETE FROM posts WHERE id = ?', [postId]);

    // Invalidate Cache Layer
    kvCache.invalidateTag('posts');
    kvCache.invalidateTag(`post_${postId}`);

    return c.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET /api/admin/r2-status - Get Cloudflare R2 storage info & status
adminRouter.get('/r2-status', async (c) => {
  return c.json({ success: true, status: getR2ConfigStatus() });
});

// POST /api/admin/upload - Upload Image File to Cloudflare R2
adminRouter.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, message: 'File gambar wajib diunggah' }, 400);
    }

    const result = await processImageUpload(file);
    return c.json({
      success: true,
      message: result.storage_type === 'cloudflare_r2'
        ? 'Gambar berhasil diunggah ke Cloudflare R2 Bucket'
        : 'Gambar berhasil diunggah ke R2 Storage Engine',
      data: result
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// POST /api/admin/categories - Add category
adminRouter.post('/categories', async (c) => {
  try {
    const { name, description, color } = await c.req.json();
    if (!name) return c.json({ success: false, message: 'Nama kategori wajib diisi' }, 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { lastInsertId } = await execute(
      'INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)',
      [name, slug, description || '', color || '#3b82f6']
    );

    kvCache.invalidateTag('categories');

    return c.json({ success: true, message: 'Kategori berhasil ditambahkan', id: lastInsertId });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// GET /api/admin/api-keys - List API Keys
adminRouter.get('/api-keys', async (c) => {
  const keys = await queryAll('SELECT id, name, key_value, active, requests_count, created_at, last_used_at FROM api_keys ORDER BY created_at DESC');
  return c.json({ success: true, data: keys });
});

// POST /api/admin/api-keys - Generate new API Key
adminRouter.post('/api-keys', async (c) => {
  try {
    const user = c.get('user');
    const { name } = await c.req.json();
    if (!name) return c.json({ success: false, message: 'Nama aplikasi/key wajib diisi' }, 400);

    const newKey = `ba_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const { lastInsertId } = await execute(
      'INSERT INTO api_keys (name, key_value, user_id) VALUES (?, ?, ?)',
      [name, newKey, user.id]
    );

    const createdKey = await queryOne('SELECT * FROM api_keys WHERE id = ?', [lastInsertId]);
    return c.json({ success: true, message: 'API Key berhasil dibuat', data: createdKey });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// DELETE /api/admin/api-keys/:id - Revoke API Key
adminRouter.delete('/api-keys/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await execute('DELETE FROM api_keys WHERE id = ?', [id]);
  return c.json({ success: true, message: 'API Key berhasil dicabut' });
});

// GET /api/admin/stats - System performance & metrics
adminRouter.get('/stats', async (c) => {
  const postsCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM posts');
  const viewsCount = await queryOne<{ total: number }>('SELECT SUM(views) as total FROM posts');
  const catCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM categories');
  const commentsCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM comments');
  const keysCount = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM api_keys');

  const cacheStats = kvCache.getStats();

  const stats: SystemStats = {
    total_posts: postsCount?.total || 0,
    total_views: viewsCount?.total || 0,
    total_categories: catCount?.total || 0,
    total_comments: commentsCount?.total || 0,
    total_api_keys: keysCount?.total || 0,
    cache_hits: cacheStats.hits,
    cache_misses: cacheStats.misses,
    cache_size: cacheStats.size
  };

  return c.json({ success: true, stats });
});

// GET /api/admin/settings - Read full system settings
adminRouter.get('/settings', async (c) => {
  const rows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM system_settings');
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return c.json({ success: true, settings });
});

// PUT /api/admin/settings - Update modular application settings
adminRouter.put('/settings', async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin' && user.role !== 'editor') {
      return c.json({ success: false, message: 'Hanya Admin/Editor yang berhak mengubah konfigurasi sistem' }, 403);
    }

    const updates: Record<string, string> = await c.req.json();

    for (const [key, value] of Object.entries(updates)) {
      const existing = await queryOne('SELECT key FROM system_settings WHERE key = ?', [key]);
      if (existing) {
        await execute('UPDATE system_settings SET value = ? WHERE key = ?', [String(value), key]);
      } else {
        await execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    }

    kvCache.delete('system_settings');

    const rows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM system_settings');
    const updatedSettings: Record<string, string> = {};
    for (const r of rows) {
      updatedSettings[r.key] = r.value;
    }

    return c.json({
      success: true,
      message: 'Konfigurasi modular aplikasi berhasil diperbarui',
      settings: updatedSettings
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
