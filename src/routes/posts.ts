import { Hono } from 'hono';
import { queryAll, queryOne, execute } from '../db/index.js';
import { kvCache } from '../services/cacheService.js';
import { Post, Comment } from '../types/index.js';

export const postsRouter = new Hono();

// GET /api/posts - Public posts listing with Edge KV Cache
postsRouter.get('/', async (c) => {
  const category = c.req.query('category');
  const q = c.req.query('q');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const offset = (page - 1) * limit;

  const cacheKey = `posts_cat:${category || 'all'}_q:${q || 'all'}_p:${page}_l:${limit}`;
  const cachedData = kvCache.get(cacheKey);

  if (cachedData) {
    c.header('X-Cache-Status', 'HIT');
    return c.json({ ...cachedData, cacheStatus: 'HIT' });
  }

  let sql = `
    SELECT 
      p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.status, p.views, p.created_at, p.updated_at,
      p.category_id, c.name as category_name, c.slug as category_slug, c.color as category_color,
      u.name as author_name
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published'
  `;

  const params: any[] = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }

  if (q) {
    sql += ' AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)';
    const searchPattern = `%${q}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const posts = await queryAll<Post>(sql, params);

  // Count total for pagination
  let countSql = 'SELECT COUNT(*) as total FROM posts p JOIN categories c ON p.category_id = c.id WHERE p.status = "published"';
  const countParams: any[] = [];
  if (category) {
    countSql += ' AND c.slug = ?';
    countParams.push(category);
  }
  if (q) {
    countSql += ' AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)';
    const searchPattern = `%${q}%`;
    countParams.push(searchPattern, searchPattern, searchPattern);
  }
  const countResult = await queryOne<{ total: number }>(countSql, countParams);
  const total = countResult?.total || 0;

  const responsePayload = {
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  // Cache response for 120 seconds with 'posts' tag
  kvCache.set(cacheKey, responsePayload, 120, ['posts']);

  c.header('X-Cache-Status', 'MISS');
  return c.json({ ...responsePayload, cacheStatus: 'MISS' });
});

// GET /api/posts/:slug - Single post view by slug
postsRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const cacheKey = `post_detail_${slug}`;
  const cachedPost = kvCache.get(cacheKey);

  // Increment views counter asynchronously in SQLite
  execute('UPDATE posts SET views = views + 1 WHERE slug = ?', [slug]).catch(console.error);

  if (cachedPost) {
    c.header('X-Cache-Status', 'HIT');
    return c.json({ success: true, data: cachedPost, cacheStatus: 'HIT' });
  }

  const post = await queryOne<Post>(
    `SELECT 
      p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.status, p.views, p.created_at, p.updated_at,
      p.category_id, c.name as category_name, c.slug as category_slug, c.color as category_color,
      u.name as author_name, u.avatar as author_avatar
     FROM posts p
     JOIN categories c ON p.category_id = c.id
     JOIN users u ON p.author_id = u.id
     WHERE p.slug = ?`,
    [slug]
  );

  if (!post) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan' }, 404);
  }

  // Fetch comments
  const comments = await queryAll<Comment>(
    'SELECT id, post_id, author_name, author_email, comment, created_at FROM comments WHERE post_id = ? ORDER BY created_at DESC',
    [post.id]
  );

  const fullData = { ...post, comments };
  kvCache.set(cacheKey, fullData, 180, ['posts', `post_${post.id}`]);

  c.header('X-Cache-Status', 'MISS');
  return c.json({ success: true, data: fullData, cacheStatus: 'MISS' });
});

// POST /api/posts/:id/comments - Add new comment
postsRouter.post('/:id/comments', async (c) => {
  try {
    const postId = parseInt(c.req.param('id'), 10);
    const { author_name, author_email, comment } = await c.req.json();

    if (!author_name || !author_email || !comment) {
      return c.json({ success: false, message: 'Semua field komentar wajib diisi' }, 400);
    }

    const { lastInsertId } = await execute(
      'INSERT INTO comments (post_id, author_name, author_email, comment) VALUES (?, ?, ?, ?)',
      [postId, author_name, author_email, comment]
    );

    // Invalidate post detail cache
    kvCache.invalidateTag(`post_${postId}`);

    const newComment = await queryOne('SELECT * FROM comments WHERE id = ?', [lastInsertId]);

    return c.json({ success: true, message: 'Komentar berhasil ditambahkan', comment: newComment });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
