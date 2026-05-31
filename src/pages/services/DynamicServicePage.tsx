import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "");

/**
 * Dynamic Service Page — Renders AI-generated service pages from the database.
 * Acts as a catch-all for /services/:slug routes that don't have static components.
 * If the page doesn't exist in the DB either, redirects to /services.
 */
export default function DynamicServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const [navVisible, setNavVisible] = useState(false);
  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);

    async function loadPage() {
      try {
        const res = await fetch(`${API_BASE}/api/services/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.page) {
            setPage(data.page);
            setIsLoading(false);
            return;
          }
        }
      } catch { /* fallback below */ }

      // Page not found in DB
      setNotFound(true);
      setIsLoading(false);
    }

    loadPage();
  }, [slug, setScrollLocked]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If page doesn't exist, redirect to services listing instead of showing 404
  if (notFound || !page) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title={page.title || 'Service | FouriqTech'}
        description={page.metaDesc || page.title}
        url={`https://fouriqtech.com/services/${slug}`}
      />
      <Navbar isVisible={navVisible} />
      
      <main 
        className="flex-1"
        dangerouslySetInnerHTML={{ __html: page.component || '' }}
      />

      <Footer />
    </div>
  );
}
