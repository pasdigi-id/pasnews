import { Hono } from 'hono';
import { queryAll, queryOne } from '../db/index.js';

export const feedsRouter = new Hono();

// Utility helper to escape XML entities safely
function escapeXml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Utility to clean HTML tags from excerpt or content for meta descriptions
function stripHtml(html: string = ''): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// GET /sitemap.xml - Standard XML Sitemap for Search Engines
feedsRouter.get('/sitemap.xml', async (c) => {
  const host = c.req.header('host') || 'localhost:3000';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  // Fetch posts, pages, and categories
  const posts = await queryAll<{ slug: string; updated_at: string; created_at: string }>(
    `SELECT slug, updated_at, created_at FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 1000`
  );

  const pages = await queryAll<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at FROM pages WHERE status = 'published'`
  );

  const categories = await queryAll<{ slug: string }>(
    `SELECT slug FROM categories`
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <changefreq>always</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // API Docs
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api-docs</loc>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.5</priority>\n`;
  xml += `  </url>\n`;

  // Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/category/${escapeXml(cat.slug)}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // Pages
  for (const page of pages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/p/${escapeXml(page.slug)}</loc>\n`;
    xml += `    <lastmod>${new Date(page.updated_at || Date.now()).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  // Posts
  for (const post of posts) {
    const lastModDate = new Date(post.updated_at || post.created_at || Date.now()).toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/article/${escapeXml(post.slug)}</loc>\n`;
    xml += `    <lastmod>${lastModDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
});

// GET /news-sitemap.xml & /feed/google-news.xml - Dedicated Google News XML Sitemap
feedsRouter.get('/news-sitemap.xml', async (c) => handleGoogleNewsSitemap(c));
feedsRouter.get('/feed/google-news.xml', async (c) => handleGoogleNewsSitemap(c));

async function handleGoogleNewsSitemap(c: any) {
  const host = c.req.header('host') || 'localhost:3000';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  // Fetch site settings
  const siteTitleRow = await queryOne<{ value: string }>(`SELECT value FROM system_settings WHERE key = 'site_title'`);
  const publicationName = siteTitleRow?.value || 'BeritaAnda';

  // Google News Sitemaps include articles published in the last 2 days (or recent published articles up to 100)
  const posts = await queryAll<{
    title: string;
    slug: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
    category_name: string;
  }>(`
    SELECT p.title, p.slug, p.excerpt, p.created_at, p.updated_at, c.name as category_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT 100
  `);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const post of posts) {
    const pubDate = new Date(post.created_at || Date.now()).toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/article/${escapeXml(post.slug)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>${escapeXml(publicationName)}</news:name>\n`;
    xml += `        <news:language>id</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(post.title)}</news:title>\n`;
    if (post.category_name) {
      xml += `      <news:keywords>${escapeXml(post.category_name)}, Berita, Terkini</news:keywords>\n`;
    }
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=1800'
  });
}

// GET /rss.xml & /feed - Standard RSS 2.0 News Feed
feedsRouter.get('/rss.xml', async (c) => handleRssFeed(c));
feedsRouter.get('/feed', async (c) => handleRssFeed(c));

async function handleRssFeed(c: any) {
  const host = c.req.header('host') || 'localhost:3000';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  const siteTitleRow = await queryOne<{ value: string }>(`SELECT value FROM system_settings WHERE key = 'site_title'`);
  const taglineRow = await queryOne<{ value: string }>(`SELECT value FROM system_settings WHERE key = 'site_tagline'`);

  const title = siteTitleRow?.value || 'BeritaAnda';
  const description = taglineRow?.value || 'Portal Berita & Platform Informasi Terpercaya';

  const posts = await queryAll<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image: string;
    created_at: string;
    category_name: string;
    author_name: string;
  }>(`
    SELECT p.title, p.slug, p.excerpt, p.content, p.cover_image, p.created_at, c.name as category_name, u.name as author_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>${escapeXml(title)}</title>\n`;
  xml += `    <link>${baseUrl}</link>\n`;
  xml += `    <description>${escapeXml(description)}</description>\n`;
  xml += `    <language>id-ID</language>\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const post of posts) {
    const postUrl = `${baseUrl}/article/${escapeXml(post.slug)}`;
    const pubDate = new Date(post.created_at || Date.now()).toUTCString();
    const cleanExcerpt = stripHtml(post.excerpt || post.content.substring(0, 250));

    xml += `    <item>\n`;
    xml += `      <title>${escapeXml(post.title)}</title>\n`;
    xml += `      <link>${postUrl}</link>\n`;
    xml += `      <guid isPermaLink="true">${postUrl}</guid>\n`;
    xml += `      <pubDate>${pubDate}</pubDate>\n`;
    if (post.author_name) {
      xml += `      <dc:creator>${escapeXml(post.author_name)}</dc:creator>\n`;
    }
    if (post.category_name) {
      xml += `      <category>${escapeXml(post.category_name)}</category>\n`;
    }
    xml += `      <description>${escapeXml(cleanExcerpt)}</description>\n`;
    xml += `      <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>\n`;
    if (post.cover_image) {
      xml += `      <media:content url="${escapeXml(post.cover_image)}" medium="image" />\n`;
    }
    xml += `    </item>\n`;
  }

  xml += `  </channel>\n`;
  xml += `</rss>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=1800'
  });
}

// GET /atom.xml - Atom 1.0 News Feed
feedsRouter.get('/atom.xml', async (c) => {
  const host = c.req.header('host') || 'localhost:3000';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  const siteTitleRow = await queryOne<{ value: string }>(`SELECT value FROM system_settings WHERE key = 'site_title'`);
  const title = siteTitleRow?.value || 'BeritaAnda';

  const posts = await queryAll<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    created_at: string;
    updated_at: string;
    author_name: string;
  }>(`
    SELECT p.title, p.slug, p.excerpt, p.content, p.created_at, p.updated_at, u.name as author_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<feed xmlns="http://www.w3.org/2005/Atom">\n`;
  xml += `  <title>${escapeXml(title)}</title>\n`;
  xml += `  <link href="${baseUrl}/atom.xml" rel="self" />\n`;
  xml += `  <link href="${baseUrl}" />\n`;
  xml += `  <updated>${new Date().toISOString()}</updated>\n`;
  xml += `  <id>${baseUrl}/</id>\n`;

  for (const post of posts) {
    const postUrl = `${baseUrl}/article/${escapeXml(post.slug)}`;
    const updated = new Date(post.updated_at || post.created_at || Date.now()).toISOString();
    const published = new Date(post.created_at || Date.now()).toISOString();

    xml += `  <entry>\n`;
    xml += `    <title>${escapeXml(post.title)}</title>\n`;
    xml += `    <link href="${postUrl}" />\n`;
    xml += `    <id>${postUrl}</id>\n`;
    xml += `    <updated>${updated}</updated>\n`;
    xml += `    <published>${published}</published>\n`;
    if (post.author_name) {
      xml += `    <author><name>${escapeXml(post.author_name)}</name></author>\n`;
    }
    xml += `    <summary>${escapeXml(stripHtml(post.excerpt))}</summary>\n`;
    xml += `  </entry>\n`;
  }

  xml += `</feed>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/atom+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=1800'
  });
});
