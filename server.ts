import { Hono } from 'hono';
import { serveStatic } from 'hono/serve-static';

import { seedDatabase } from './src/db/seed.js';
import { authRouter } from './src/routes/auth.js';
import { postsRouter } from './src/routes/posts.js';
import { categoriesRouter } from './src/routes/categories.js';
import { adminRouter } from './src/routes/admin.js';
import { externalRouter } from './src/routes/external.js';
import { cacheRouter } from './src/routes/cache.js';
import { settingsRouter } from './src/routes/settings.js';
import { memberRouter } from './src/routes/member.js';
import { pagesRouter } from './src/routes/pages.js';
import { menusRouter } from './src/routes/menus.js';
import { widgetsRouter } from './src/routes/widgets.js';
import { adsRouter } from './src/routes/ads.js';
import { usersRouter } from './src/routes/users.js';
import { feedsRouter } from './src/routes/feeds.js';

// Inisialisasi Hono API Framework
const app = new Hono();

// Eksekusi seed database di luar request cycle agar siap saat worker menyala
seedDatabase().catch(console.error);

// Grouping semua routes API ke dalam prefix /api agar frontend bisa mengaksesnya
const apiRouter = new Hono();

apiRouter.route('/auth', authRouter);
apiRouter.route('/posts', postsRouter);
apiRouter.route('/categories', categoriesRouter);
apiRouter.route('/admin', adminRouter);
apiRouter.route('/settings', settingsRouter);
apiRouter.route('/member', memberRouter);
apiRouter.route('/pages', pagesRouter);
apiRouter.route('/menus', menusRouter);
apiRouter.route('/widgets', widgetsRouter);
apiRouter.route('/ads', adsRouter);
apiRouter.route('/users', usersRouter);
apiRouter.route('/v1', externalRouter); // Third-Party API Endpoint (x-api-key)
apiRouter.route('/cache', cacheRouter);
apiRouter.route('/feeds', feedsRouter);

// Mount API Router ke path /api
app.route('/api', apiRouter);

// Mount feeds juga di root (menyesuaikan struktur asli Anda)
app.route('/feeds', feedsRouter);
app.route('/', feedsRouter);

// Health check endpoint
app.get('/api/health', (c) => c.json({ status: 'ok', framework: 'HonoJS', database: 'SQLite (via sql.js)' }));

// Penanganan Direct XML feed dan Sitemap
const feedPaths = ['/sitemap.xml', '/news-sitemap.xml', '/rss.xml', '/feed', '/atom.xml', '/feed/google-news.xml'];
feedPaths.forEach((path) => {
  app.get(path, async (c) => {
    // Di Hono murni, logika feed bisa langsung diproses di dalam feedsRouter. 
    // Rute ini sebagai penangkap jika dipanggil di root.
    const response = await feedsRouter.fetch(c.req.raw);
    return response;
  });
});

// WAJIB UNTUK CLOUDFLARE PAGES: 
// Mengekspor app default agar Cloudflare mendeteksi fungsi ini (menjadi _worker.js)
export default app;
