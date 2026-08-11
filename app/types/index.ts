export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'reporter' | 'member';
  avatar?: string;
  post_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count?: number;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  show_in_menu: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  location: 'header' | 'footer' | 'sidebar';
  title: string;
  url: string;
  target?: string;
  sort_order: number;
  icon?: string;
  is_active: number;
}

export interface WidgetSettings {
  category_slug?: string;
  limit?: number;
  layout?: 'grid' | 'list' | 'carousel' | 'hero_highlight' | 'compact';
  placement?: string;
  subtitle?: string;
  badge_text?: string;
  accent_color?: string;
  bg_style?: 'card' | 'bordered' | 'gradient' | 'transparent' | 'dark_luxury';
  image_url?: string; // Cloudflare R2 Uploaded Media URL
  cta_label?: string;
  cta_url?: string;
  custom_html?: string;
  show_views?: boolean;
  show_date?: boolean;
  show_category_tag?: boolean;
  refresh_interval_sec?: number;
}

export interface Widget {
  id: number;
  title: string;
  type: 'category_posts' | 'breaking_news' | 'trending_list' | 'ad_banner' | 'editor_pick' | 'newsletter' | 'weather_market' | 'custom_html';
  position: 'top_header' | 'hero_section' | 'main_feed' | 'sidebar' | 'bottom_footer' | 'sticky_bottom';
  sort_order: number;
  is_active: number;
  settings?: WidgetSettings;
}

export interface AdBanner {
  id: number;
  title: string;
  placement: 'top_leaderboard' | 'in_article' | 'sidebar_rectangle' | 'sticky_bottom' | 'in_feed';
  image_url: string;
  target_url: string;
  is_active: number;
  impressions: number;
  clicks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  author_id: number;
  author_name?: string;
  cover_image?: string;
  status: 'published' | 'draft';
  views: number;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  comment: string;
  created_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  active: number;
  requests_count: number;
  created_at: string;
  last_used_at?: string;
}

export interface SystemStats {
  total_posts: number;
  total_views: number;
  total_categories: number;
  total_comments: number;
  total_api_keys: number;
  cache_hits: number;
  cache_misses: number;
  cache_size: number;
}

export interface SystemSettings {
  site_title: string;
  site_tagline: string;
  default_theme: string;
  allow_member_registration: string;
  enable_comments: string;
  enable_member_submissions: string;
  enable_api: string;
  enable_cache: string;
  reading_wpm: string;
  hero_banner: string;
}

export interface Bookmark {
  post_id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  category_name: string;
  category_color?: string;
  bookmarked_at: string;
}

export interface ReadingHistoryItem {
  id: number;
  read_at: string;
  post_id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  category_name: string;
}
