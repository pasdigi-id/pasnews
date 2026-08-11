import { Hono } from 'hono';

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

// Definisikan Bindings agar TypeScript/Hono mengenali aset bawaan Cloudflare Pages
type Bindings = {
  ASSETS: Fetcher;
};

// Inisialisasi Hono API Framework dengan tipe Bindings
const app = new Hono<{ Bindings: Bindings }>();

// Eksekusi seed database di luar request cycle agar siap saat worker menyala
seedDatabase().catch(console.error);

// Grouping semua routes API ke dalam prefix /api agar frontend bisa mengaksesnya
const apiRouter = new Hono<{ Bindings: Bindings }>();

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
apiRouter.route('/v1', externalRouter); 
apiRouter.route('/cache', cacheRouter);
apiRouter.route('/feeds', feedsRouter);

// Mount API Router ke path /api
app.route('/api', apiRouter);

// Mount feeds (HANYA di /feeds, jangan di root '/')
app.route('/feeds', feedsRouter);

// Health check endpoint
app.get('/api/health', (c) => c.json({ status: 'ok', framework: 'HonoJS', database: 'SQLite (via sql.js in-memory)' }));

// Penanganan Direct XML feed dan Sitemap
const feedPaths = ['/sitemap.xml', '/news-sitemap.xml', '/rss.xml', '/feed', '/atom.xml', '/feed/google-news.xml'];
feedPaths.forEach((path) => {
  app.get(path, async (c) => {
    return await feedsRouter.fetch(c.req.raw);
  });
});

// 🌟 SOLUSI UTAMA (FALLBACK FRONTEND) 🌟
// Menangani semua request yang BUKAN API untuk merender UI React (Frontend)
app.notFound(async (c) => {
  try {
    // Cloudflare Pages otomatis menyuntikkan ASSETS untuk mengambil file dist/ (UI Anda)
    const response = await c.env.ASSETS.fetch(c.req.raw);
    
    // Jika file statis tidak ditemukan (misal: user merefresh halaman /dashboard),
    // kembalikan index.html agar React Router bisa menangani rutenya (SPA behavior).
    if (response.status === 404) {
      const url = new URL(c.req.url);
      url.pathname = '/'; // Arahkan kembali ke root index.html
      const fallbackReq = new Request(url.toString(), c.req.raw);
      return await c.env.ASSETS.fetch(fallbackReq);
    }
    
    return response;
  } catch (e) {
    return c.text('Frontend belum di-build atau ASSETS tidak ditemukan di environment ini.', 500);
  }
});

// Mengekspor app default agar Cloudflare mendeteksi fungsi ini
export default app;
