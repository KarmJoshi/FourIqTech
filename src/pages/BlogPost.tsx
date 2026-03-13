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
    "image": post.imageUrl || "https://fouriqtech.com/og-image.jpg",
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
        "url": "https://fouriqtech.com/logo.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title={`${post.title} | FouriqTech Blog`}
        description={post.excerpt}
        url={`https://fouriqtech.com/blog/${post.slug}`}
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
            className="prose prose-invert lg:prose-xl max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-8
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 text-glow-subtle
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-lg
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:underline-offset-4
              prose-strong:text-zinc-100 prose-strong:font-semibold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8 prose-ul:text-zinc-300 prose-ul:text-lg
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8 prose-ol:text-zinc-300 prose-ol:text-lg
              prose-li:mb-2 prose-li:marker:text-primary/70
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-zinc-400 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg prose-blockquote:my-10
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-2xl
              prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-12
              prose-hr:border-white/10 prose-hr:my-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
