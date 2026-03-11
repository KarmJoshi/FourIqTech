import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import { getPostBySlug } from '@/data/blogPosts';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import SEO from '@/components/SEO';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  
  const post = getPostBySlug(slug || '');

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    // Scroll to top when loading a new post
    window.scrollTo(0, 0);
  }, [slug, setScrollLocked]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.imageUrl || "https://four-iq-tech.vercel.app/og-image.jpg",
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "FouriqTech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://four-iq-tech.vercel.app/logo.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title={`${post.title} | FouriqTech Blog`}
        description={post.excerpt}
        url={`https://four-iq-tech.vercel.app/blog/${post.slug}`}
        image={post.imageUrl}
        article={true}
        schema={articleSchema}
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft size={16} /> Back to all articles
        </Link>
        
        <article>
          <header className="mb-16">
            <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-primary mb-6 border border-white/10 uppercase tracking-widest">
              {post.category}
            </span>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground border-t border-white/10 pt-6">
              <span className="flex items-center gap-2">
                <User size={16} className="text-primary" /> {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-primary" /> {post.readTime}
              </span>
            </div>
          </header>
          
          <div 
            className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors
              prose-strong:text-zinc-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
