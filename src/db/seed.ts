import bcrypt from 'bcryptjs';
import { execute, queryOne, getDb } from './index.js';

export async function seedDatabase() {
  await getDb();

  // Seed system default settings if empty
  const defaultSettings = [
    ['site_title', 'BeritaAnda'],
    ['site_tagline', 'Portal Berita & Platform Informasi Terpercaya'],
    ['default_theme', 'dark'],
    ['allow_member_registration', 'true'],
    ['enable_comments', 'true'],
    ['enable_member_submissions', 'true'],
    ['enable_api', 'true'],
    ['enable_cache', 'true'],
    ['reading_wpm', '200'],
    ['hero_banner', 'true']
  ];

  for (const [key, val] of defaultSettings) {
    const existing = await queryOne('SELECT key FROM system_settings WHERE key = ?', [key]);
    if (!existing) {
      await execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, val]);
    }
  }

  // Check if member user exists
  const existingMember = await queryOne('SELECT id FROM users WHERE email = ?', ['member@beritaanda.com']);
  if (!existingMember) {
    const memberPassHash = await bcrypt.hash('member123456', 10);
    await execute(
      `INSERT INTO users (name, email, password_hash, role, avatar) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Siti Rahma (Member)',
        'member@beritaanda.com',
        memberPassHash,
        'member',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      ]
    );
  }

  // Check if admin user exists
  const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', ['admin@beritaanda.com']);
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    const { lastInsertId: adminId } = await execute(
      `INSERT INTO users (name, email, password_hash, role, avatar) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Redaksi BeritaAnda',
        'admin@beritaanda.com',
        passwordHash,
        'admin',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      ]
    );

    // Seed categories
    const categories = [
      { name: 'Teknologi', slug: 'teknologi', description: 'Inovasi, AI, Gadget, dan Perkembangan Teknologi Terkini', color: '#3b82f6' },
      { name: 'Bisnis & Ekonomi', slug: 'bisnis-ekonomi', description: 'Pasar Modal, Startup, Keuangan, dan Trend Bisnis Global', color: '#10b981' },
      { name: 'Politik & Nasional', slug: 'politik-nasional', description: 'Isu Publik, Kebijakan Pemerintah, dan Hukum', color: '#ef4444' },
      { name: 'Gaya Hidup', slug: 'gaya-hidup', description: 'Kesehatan, Kuliner, Travel, dan Tren Masa Kini', color: '#8b5cf6' },
      { name: 'Olahraga', slug: 'olahraga', description: 'Sepak Bola, Basket, Badminton, dan Kompetisi Dunia', color: '#f59e0b' }
    ];

    const categoryIds: Record<string, number> = {};
    for (const cat of categories) {
      const { lastInsertId } = await execute(
        'INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)',
        [cat.name, cat.slug, cat.description, cat.color]
      );
      categoryIds[cat.slug] = lastInsertId;
    }

    // Seed posts
    const samplePosts = [
      {
        title: 'Revolusi AI 2026: Perkembangan Model Lanjutan dan Dampaknya pada Industri Global',
        slug: 'revolusi-ai-2026-perkembangan-model-lanjutan',
        excerpt: 'Teknologi kecerdasan buatan mengalami lompatan eksponensial di tahun 2026 dengan efisiensi tinggi dan kapabilitas reasoning super presisi.',
        content: `Tahun 2026 menjadi titik balik besar bagi adopsi kecerdasan buatan (Artificial Intelligence). Industri global kini mengintegrasikan AI langsung ke dalam infrastruktur edge computing dengan arsitektur modular yang cepat dan efisien.

Para peneliti menekankan pentingnya latensi rendah dan pemrosesan lokal untuk menjaga privasi data. Sistem berbasis mikro-service dan runtime ultra-ringan seperti Hono dan SQLite edge database terbukti memberikan performa tinggi dengan konsumsi energi yang jauh lebih hemat.

"Kita tidak lagi hanya bicara tentang model berukuran raksasa, tetapi tentang model presisi tinggi yang dapat berjalan sangat cepat di edge node," ungkap dr. Pratama, pakar AI Indonesia.`,
        category_id: categoryIds['teknologi'],
        cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        views: 1420
      },
      {
        title: 'Pertumbuhan Ekonomi Digital Indonesia Tembus Rekor Baru di Kuartal III',
        slug: 'pertumbuhan-ekonomi-digital-indonesia-tembus-rekor',
        excerpt: 'Sektor e-commerce, finansial berbasis teknologi, dan SaaS lokal mendorong penguatan laju ekonomi di tengah dinamika pasar global.',
        content: `Ekonomi digital Indonesia kembali menunjukkan taringnya di kancah internasional. Laporan terbaru Kementerian Keuangan mencatat transaksi berbasis platform digital tumbuh hingga 18,4% dibandingkan periode yang sama tahun lalu.

Inovasi dari pengembang lokal yang memanfaatkan arsitektur cloud serverless, D1 relational DB, dan edge caching seperti Cloudflare KV membuat biaya operasional platform turun signifikan. Hal ini memberi ruang bagi pelaku UMKM untuk berekspansi secara masif tanpa memikul biaya server yang membebankan.`,
        category_id: categoryIds['bisnis-ekonomi'],
        cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
        views: 980
      },
      {
        title: 'Tips Membangun Aplikasi Web Ultra-Cepat dengan Hono, HonoX, dan SQLite',
        slug: 'tips-membangun-aplikasi-web-ultra-cepat-hono-sqlite',
        excerpt: 'Panduan arsitektur modern berbasis edge computing untuk mencapai Time-To-First-Byte (TTFB) di bawah 30 milidetik.',
        content: `Kecepatan akses adalah kunci utama kesuksesan platform berita modern. Dengan kombinasi HonoJS sebagai framework HTTP ultra-ringan dan SQLite sebagai engine database relasional, pengembang dapat menyajikan konten dalam hitungan milidetik.

Langkah Kunci Optimasi:
1. **Edge Cache Layer**: Implementasi caching KV pada Cloudflare Edge untuk artikel yang sering diakses.
2. **JWT HS256 & API Key Validation**: Pengamanan endpoint menggunakan middleware berkecepatan tinggi.
3. **Optimized Media Upload**: Kompresi gambar otomatis dan penyimpanan R2 Object Storage.
4. **Minimal Javascript Overhead**: Menggunakan Server-Side Rendering (SSR) HonoX untuk mempercepat pencetakan halaman pertama.`,
        category_id: categoryIds['teknologi'],
        cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        views: 2300
      },
      {
        title: 'Tren Gaya Hidup Minimalis dan Pentingnya Menjaga Kesehatan Mental Digital',
        slug: 'tren-gaya-hidup-minimalis-kesehatan-mental-digital',
        excerpt: 'Di era arus informasi yang begitu deras, masyarakat mulai menerapkan detoks digital dan pemilahan konsumsi berita harian.',
        content: `Konsumsi berita berlebihan tanpa jeda dapat memicu keletihan mental atau 'headline fatigue'. Menanggapi hal tersebut, platform berita terkini mulai merancang UI yang bersih, jujur, bebas dari iklan pop-up mengganggu, serta mengutamakan keterbacaan tinggi.

Pendekatan gaya hidup minimalis tidak hanya berlaku pada hunian, melainkan juga pada cara kita memilih aplikasi berita yang responsif dan nyaman di mata.`,
        category_id: categoryIds['gaya-hidup'],
        cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
        views: 750
      }
    ];

    for (const post of samplePosts) {
      const { lastInsertId: postId } = await execute(
        `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, cover_image, status, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
        [post.title, post.slug, post.content, post.excerpt, post.category_id, adminId, post.cover_image, post.views]
      );

      // Add sample comment for each post
      await execute(
        `INSERT INTO comments (post_id, author_name, author_email, comment)
         VALUES (?, ?, ?, ?)`,
        [postId, 'Budi Santoso', 'budi@example.com', 'Artikel yang sangat informatif dan mendalam! Ditunggu ulasan selanjutnya.']
      );
    }

    // Seed sample API key for 3rd party integration
    await execute(
      `INSERT INTO api_keys (name, key_value, user_id, active, requests_count)
       VALUES (?, ?, ?, 1, 12)`,
      ['Aplikasi Berita Pihak Ketiga A', 'ba_live_8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c', adminId]
    );

    // Seed CMS Pages
    const pages = [
      {
        title: 'Susunan Redaksi',
        slug: 'redaksi',
        content: `### Susunan Redaksi BeritaAnda\n\n**Pemimpin Redaksi / Penanggung Jawab:**\nDr. Hendra Wijaya, M.Si.\n\n**Redaktur Pelaksana:**\nBudi Rahardjo\n\n**Editor Senior:**\nAnisa Putri, S.I.Kom.\nRizal Ramadhan, S.T.\n\n**Tim Reporter:**\n- Ahmad Fauzi (Politik & Hukum)\n- Maya Kartika (Teknologi & Bisnis)\n- Doni Pratama (Olahraga & Gaya Hidup)\n\n**Alamat Redaksi:**\nMenara Cyber Indonesia, Lantai 18\nJl. H.R. Rasuna Said, Jakarta Selatan 12940\nEmail: redaksi@beritaanda.com | Telp: (021) 555-0192`,
        show_in_menu: 1
      },
      {
        title: 'Pedoman Media Siber',
        slug: 'pedoman-siber',
        content: `### Pedoman Pemberitaan Media Siber\n\nKemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB.\n\n**1. Ruang Lingkup**\nMedia Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik.\n\n**2. Verifikasi dan Keseimbangan Berita**\n- Setiap berita harus melalui verifikasi faktual secara ketat.\n- Berita yang dapat merugikan pihak lain membutuhkan konfirmasi/keseimbangan (cover both sides).\n\n**3. Isu SARA dan Kekerasan**\nMedia siber wajib tidak merendahkan suku, agama, ras, dan antar-golongan (SARA) serta menghormati hak privasi korban kejahatan asusila.\n\n**4. Hak Jawab dan Hak Koreksi**\nPengguna berhak mengajukan hak jawab dan hak koreksi atas informasi yang tidak akurat. Redaksi wajib segera memperbarui atau meralat berita terkait.`,
        show_in_menu: 1
      },
      {
        title: 'Tentang Kami',
        slug: 'tentang-kami',
        content: `### Tentang BeritaAnda\n\nBeritaAnda adalah portal berita dan media digital independen yang menyajikan informasi terkini, akurat, dan terpercaya di Indonesia. Kami berdedikasi memberikan jurnalisme berkualitas dengan mengedepankan kecepatan, kedalaman analisis, serta independensi redaksi.`,
        show_in_menu: 1
      },
      {
        title: 'Kebijakan Privasi',
        slug: 'kebijakan-privasi',
        content: `### Kebijakan Privasi\n\nBeritaAnda berkomitmen melindungi privasi data pribadi pembaca. Informasi yang kami kumpulkan saat pendaftaran keanggotaan atau berlangganan newsletter digunakan semata-mata untuk meningkatkan kualitas layanan dan tidak akan diperjualbelikan kepada pihak ketiga.`,
        show_in_menu: 1
      },
      {
        title: 'Kontak & Iklan',
        slug: 'kontak-kami',
        content: `### Hubungi Kami & Kerjasama Iklan\n\nIngin memasang banner iklan, advertorial, atau kerjasama media partner dengan BeritaAnda?\n\n**Tim Business & Advertising:**\nEmail: iklan@beritaanda.com\nWhatsApp Marketing: +62 812-3456-7890\nHotline Redaksi: (021) 555-0192`,
        show_in_menu: 1
      }
    ];

    for (const page of pages) {
      const existingPage = await queryOne('SELECT id FROM pages WHERE slug = ?', [page.slug]);
      if (!existingPage) {
        await execute(
          'INSERT INTO pages (title, slug, content, show_in_menu) VALUES (?, ?, ?, ?)',
          [page.title, page.slug, page.content, page.show_in_menu]
        );
      }
    }

    // Seed Header & Footer Navigation Menus
    const headerMenus = [
      { title: 'Berita Utama', url: '/category/politik-nasional', sort: 1, icon: 'Flame' },
      { title: 'Teknologi', url: '/category/teknologi', sort: 2, icon: 'Cpu' },
      { title: 'Bisnis & Ekonomi', url: '/category/bisnis-ekonomi', sort: 3, icon: 'TrendingUp' },
      { title: 'Gaya Hidup', url: '/category/gaya-hidup', sort: 4, icon: 'Smile' },
      { title: 'Olahraga', url: '/category/olahraga', sort: 5, icon: 'Trophy' },
      { title: 'Redaksi', url: '/page/redaksi', sort: 6, icon: 'Users' },
      { title: 'Pedoman Siber', url: '/page/pedoman-siber', sort: 7, icon: 'FileText' }
    ];

    for (const m of headerMenus) {
      await execute(
        'INSERT INTO menus (location, title, url, sort_order, icon, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        ['header', m.title, m.url, m.sort, m.icon]
      );
    }

    const footerMenus = [
      { title: 'Tentang Kami', url: '/page/tentang-kami', sort: 1 },
      { title: 'Susunan Redaksi', url: '/page/redaksi', sort: 2 },
      { title: 'Pedoman Siber', url: '/page/pedoman-siber', sort: 3 },
      { title: 'Kebijakan Privasi', url: '/page/kebijakan-privasi', sort: 4 },
      { title: 'Kontak & Iklan', url: '/page/kontak-kami', sort: 5 }
    ];

    for (const m of footerMenus) {
      await execute(
        'INSERT INTO menus (location, title, url, sort_order, is_active) VALUES (?, ?, ?, ?, 1)',
        ['footer', m.title, m.url, m.sort]
      );
    }

    // Seed Ad Banners
    const adBanners = [
      {
        title: 'Leaderboard Banner Super Sale 11.11',
        placement: 'top_leaderboard',
        image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
        target_url: 'https://example.com/promo-1111'
      },
      {
        title: 'In-Feed Sponsor Cloud Server High Speed',
        placement: 'in_feed',
        image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80',
        target_url: 'https://example.com/cloud-server'
      },
      {
        title: 'Sidebar Banner Investasi & Finance',
        placement: 'sidebar_rectangle',
        image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80',
        target_url: 'https://example.com/investasi'
      },
      {
        title: 'Sticky Bottom Mobile Banner App Download',
        placement: 'sticky_bottom',
        image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80',
        target_url: 'https://example.com/app-download'
      }
    ];

    for (const ad of adBanners) {
      await execute(
        'INSERT INTO ad_banners (title, placement, image_url, target_url, is_active, impressions, clicks) VALUES (?, ?, ?, ?, 1, 1420, 185)',
        [ad.title, ad.placement, ad.image_url, ad.target_url]
      );
    }

    // Seed Widgets for Drag & Drop Modular Page Builder
    const widgets = [
      {
        title: 'Running Breaking News Ticker',
        type: 'breaking_news',
        position: 'top_header',
        sort_order: 1,
        settings: JSON.stringify({ limit: 5 })
      },
      {
        title: 'Hero Highlight / Editor Pick Grid',
        type: 'editor_pick',
        position: 'hero_section',
        sort_order: 2,
        settings: JSON.stringify({ limit: 4 })
      },
      {
        title: 'Kategori Berita Teknologi',
        type: 'category_posts',
        position: 'main_feed',
        sort_order: 3,
        settings: JSON.stringify({ category_slug: 'teknologi', limit: 3, layout: 'grid' })
      },
      {
        title: 'Banner Iklan In-Feed Sponsor',
        type: 'ad_banner',
        position: 'main_feed',
        sort_order: 4,
        settings: JSON.stringify({ placement: 'in_feed' })
      },
      {
        title: 'Kategori Bisnis & Ekonomi',
        type: 'category_posts',
        position: 'main_feed',
        sort_order: 5,
        settings: JSON.stringify({ category_slug: 'bisnis-ekonomi', limit: 3, layout: 'list' })
      },
      {
        title: 'Informasi Pasar & Cuaca Jakarta',
        type: 'weather_market',
        position: 'sidebar',
        sort_order: 1,
        settings: JSON.stringify({ city: 'Jakarta', show_stocks: true })
      },
      {
        title: 'Daftar Berita Terpopuler (#1 - #5)',
        type: 'trending_list',
        position: 'sidebar',
        sort_order: 2,
        settings: JSON.stringify({ limit: 5 })
      },
      {
        title: 'Banner Iklan Sidebar 300x250',
        type: 'ad_banner',
        position: 'sidebar',
        sort_order: 3,
        settings: JSON.stringify({ placement: 'sidebar_rectangle' })
      },
      {
        title: 'Newsletter Redaksi BeritaAnda',
        type: 'newsletter',
        position: 'sidebar',
        sort_order: 4,
        settings: JSON.stringify({ title: 'Langganan Buletin Harian' })
      },
      {
        title: 'Iklan Sticky Bottom Bar',
        type: 'ad_banner',
        position: 'sticky_bottom',
        sort_order: 1,
        settings: JSON.stringify({ placement: 'sticky_bottom' })
      }
    ];

    for (const w of widgets) {
      await execute(
        'INSERT INTO widgets (title, type, position, sort_order, is_active, settings) VALUES (?, ?, ?, ?, 1, ?)',
        [w.title, w.type, w.position, w.sort_order, w.settings]
      );
    }

    console.log('Database successfully seeded with Pages, Menus, Ad Banners, and Widgets!');
  }
}
