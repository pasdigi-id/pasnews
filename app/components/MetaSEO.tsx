import React, { useEffect } from 'react';

export interface MetaSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  categoryName?: string;
  siteTitle?: string;
}

export const MetaSEO: React.FC<MetaSEOProps> = ({
  title,
  description = 'Portal berita dan media informasi terpercaya menyajikan kabar terkini, terakurat, dan mendalam.',
  keywords = 'berita, berita terkini, kabar terbaru, berita indonesia, portal berita, informasi',
  image = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authorName,
  categoryName,
  siteTitle = 'BeritaAnda'
}) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const pageTitle = title ? `${title} - ${siteTitle}` : `${siteTitle} | Portal Berita Terpercaya`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    if (authorName) {
      updateMetaTag('meta[name="author"]', 'name', 'author', authorName);
    }

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    if (currentUrl) canonical.setAttribute('href', currentUrl);

    // Open Graph Meta Tags
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteTitle);
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title || siteTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    if (currentUrl) {
      updateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    }
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'id_ID');

    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
      }
      if (modifiedTime) {
        updateMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', modifiedTime);
      }
      if (authorName) {
        updateMetaTag('meta[property="article:author"]', 'property', 'article:author', authorName);
      }
      if (categoryName) {
        updateMetaTag('meta[property="article:section"]', 'property', 'article:section', categoryName);
      }
    }

    // Twitter Cards
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title || siteTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // Schema.org JSON-LD Injection
    let scriptLd = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
    if (!scriptLd) {
      scriptLd = document.createElement('script');
      scriptLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptLd);
    }

    let jsonLdData: any = {};

    if (type === 'article') {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl
        },
        headline: title,
        image: [image],
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || publishedTime || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: authorName || siteTitle
        },
        publisher: {
          '@type': 'Organization',
          name: siteTitle,
          logo: {
            '@type': 'ImageObject',
            url: `${window.location.origin}/logo.png`
          }
        },
        description: description,
        articleSection: categoryName || 'Berita'
      };
    } else {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: siteTitle,
        url: window.location.origin,
        logo: `${window.location.origin}/logo.png`,
        sameAs: [],
        description: description
      };
    }

    scriptLd.textContent = JSON.stringify(jsonLdData);

  }, [pageTitle, description, keywords, image, currentUrl, type, publishedTime, modifiedTime, authorName, categoryName, siteTitle]);

  return null;
};
