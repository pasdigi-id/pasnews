import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LoginModal } from './components/LoginModal.js';
import { ArchitectureModal } from './components/ArchitectureModal.js';
import { Home } from './pages/Home.js';
import { ArticleDetail } from './pages/ArticleDetail.js';
import { ApiDocsPage } from './pages/ApiDocsPage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { MemberDashboard } from './pages/MemberDashboard.js';
import { User, Post, Category, SystemSettings } from './types/index.js';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    site_title: 'BeritaAnda',
    site_tagline: 'Portal Berita & Platform Informasi Terpercaya',
    default_theme: 'dark',
    allow_member_registration: 'true',
    enable_comments: 'true',
    enable_member_submissions: 'true',
    enable_api: 'true',
    enable_cache: 'true',
    reading_wpm: '200',
    hero_banner: 'true'
  });

  const [cacheSource, setCacheSource] = useState<string>('sqlite-db');

  // Theme Management (Light vs Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ba_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  // User Auth & Bookmarks
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Sync Theme class on document documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('ba_theme', theme);
  }, [theme]);

  // Initial Data & User Token Restoration
  const fetchPublicData = async () => {
    try {
      const [postsRes, catRes, setRes] = await Promise.all([
        fetch('/api/posts').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json())
      ]);

      if (postsRes.success) {
        setPosts(postsRes.data || []);
        if (postsRes.source) setCacheSource(postsRes.source);
      }
      if (catRes.success) setCategories(catRes.data || []);
      if (setRes.success && setRes.settings) {
        setSettings((prev) => ({ ...prev, ...setRes.settings }));
      }
    } catch (err) {
      console.error('Failed to load public data:', err);
    }
  };

  const fetchUserBookmarks = async (token: string) => {
    try {
      const res = await fetch('/api/member/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const ids = new Set<number>(data.data.map((b: any) => b.id));
        setBookmarkedIds(ids);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPublicData();

    // Check stored JWT token
    const token = localStorage.getItem('ba_jwt_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            fetchUserBookmarks(token);
          } else {
            localStorage.removeItem('ba_jwt_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('ba_jwt_token');
        });
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem('ba_jwt_token', token);
    fetchUserBookmarks(token);

    if (loggedInUser.role === 'admin' || loggedInUser.role === 'editor') {
      setCurrentView('admin');
    } else {
      setCurrentView('member-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setBookmarkedIds(new Set());
    localStorage.removeItem('ba_jwt_token');
    setCurrentView('home');
  };

  const handleBookmarkToggle = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const token = localStorage.getItem('ba_jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/member/bookmarks/${postId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(postId);
          } else {
            next.delete(postId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    const token = localStorage.getItem('ba_jwt_token');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newSettings)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    if (data.settings) {
      setSettings((prev) => ({ ...prev, ...data.settings }));
    }
  };

  const handleNavigate = (view: string, param?: any) => {
    if (view === 'article-detail' && param) {
      setSelectedPost(param);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-[#0a0a0c] dark:text-slate-100">
      
      {/* Primary Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        settings={settings}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PUBLIC AREA: Home Page */}
        {currentView === 'home' && (
          <Home
            posts={posts}
            categories={categories}
            onSelectPost={(post) => handleNavigate('article-detail', post)}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
            cacheSource={cacheSource}
            settings={settings}
          />
        )}

        {/* PUBLIC AREA: Article Detail Page */}
        {currentView === 'article-detail' && selectedPost && (
          <ArticleDetail
            post={selectedPost}
            onBack={() => handleNavigate('home')}
            onBookmarkToggle={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.has(selectedPost.id)}
            settings={settings}
            user={user}
          />
        )}

        {/* PUBLIC AREA: API Documentation */}
        {currentView === 'api-docs' && (
          <ApiDocsPage settings={settings} />
        )}

        {/* MEMBER AREA: Member Dashboard */}
        {currentView === 'member-dashboard' && user && (
          <MemberDashboard
            user={user}
            onSelectPost={(post) => handleNavigate('article-detail', post)}
            settings={settings}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}

        {/* ADMIN AREA: Admin Dashboard */}
        {currentView === 'admin' && user && (user.role === 'admin' || user.role === 'editor') && (
          <AdminDashboard
            user={user}
            onNavigate={handleNavigate}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onNavigate={handleNavigate}
        settings={settings}
      />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        allowRegistration={settings.allow_member_registration !== 'false'}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

    </div>
  );
}
