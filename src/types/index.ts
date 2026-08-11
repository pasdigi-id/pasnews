export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color?: string;
  post_count?: number;
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
  cover_image: string;
  status: 'published' | 'draft';
  views: number;
  created_at: string;
  updated_at: string;
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
  user_id: number;
  active: boolean;
  requests_count: number;
  created_at: string;
  last_used_at?: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploaded_at: string;
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
