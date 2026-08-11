import { Hono } from 'hono';
import { queryAll } from '../db/index.js';
import { kvCache } from '../services/cacheService.js';
import { Category } from '../types/index.js';

export const categoriesRouter = new Hono();

categoriesRouter.get('/', async (c) => {
  const cacheKey = 'categories_list';
  const cached = kvCache.get(cacheKey);

  if (cached) {
    c.header('X-Cache-Status', 'HIT');
    return c.json({ success: true, data: cached, cacheStatus: 'HIT' });
  }

  const categories = await queryAll<Category>(`
    SELECT 
      c.id, c.name, c.slug, c.description, c.color,
      COUNT(p.id) as post_count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  kvCache.set(cacheKey, categories, 600, ['categories']);

  c.header('X-Cache-Status', 'MISS');
  return c.json({ success: true, data: categories, cacheStatus: 'MISS' });
});
