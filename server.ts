import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
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

async function startServer() {
  // Initialize Database & Seed default records
  await seedDatabase();

  const expressApp = express();
  const PORT = 3000;

  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  // Serve static uploaded files
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  expressApp.use('/uploads', express.static(uploadDir));

  // Instantiate Hono API Framework
  const honoApp = new Hono();

  // Mount Hono Sub-routers
  honoApp.route('/auth', authRouter);
  honoApp.route('/posts', postsRouter);
  honoApp.route('/categories', categoriesRouter);
  honoApp.route('/admin', adminRouter);
  honoApp.route('/settings', settingsRouter);
  honoApp.route('/member', memberRouter);
  honoApp.route('/pages', pagesRouter);
  honoApp.route('/menus', menusRouter);
  honoApp.route('/widgets', widgetsRouter);
  honoApp.route('/ads', adsRouter);
  honoApp.route('/users', usersRouter);
  honoApp.route('/v1', externalRouter); // Third-Party API Endpoint (x-api-key)
  honoApp.route('/cache', cacheRouter);
  honoApp.route('/feeds', feedsRouter);
  honoApp.route('/', feedsRouter);

  // Health check endpoint
  honoApp.get('/health', (c) => c.json({ status: 'ok', framework: 'HonoJS', database: 'SQLite' }));

  // Direct XML feed and Sitemap handler for root Express routes (/sitemap.xml, /news-sitemap.xml, /rss.xml, /feed, /atom.xml, etc.)
  const feedPaths = ['/sitemap.xml', '/news-sitemap.xml', '/rss.xml', '/feed', '/atom.xml', '/feed/google-news.xml'];
  expressApp.get(feedPaths, async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    });
    const webReq = new Request(fullUrl, { method: 'GET', headers });
    const response = await honoApp.fetch(webReq);
    res.status(response.status);
    response.headers.forEach((val, key) => res.setHeader(key, val));
    const resArrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(resArrayBuffer));
  });

  // Forward /api requests to Hono handler
  expressApp.all('/api/*', async (req, res) => {
    // Construct Web Request object for Hono
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.replace(/^\/api/, '')}`;
    
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else if (value) {
        headers.set(key, value);
      }
    });

    let body: any = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.is('multipart/form-data')) {
        // Handle raw multipart pass-through or express buffer
        body = req;
      } else if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        body = JSON.stringify(req.body);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    const webReq = new Request(fullUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? null : body
    });

    const response = await honoApp.fetch(webReq);

    res.status(response.status);
    response.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const resArrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(resArrayBuffer));
  });

  // Attach Vite Middleware for Development Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BeritaAnda Hono + SQLite Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
