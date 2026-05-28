import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import { getPostBySlug, blogPosts } from '@/data/blogPosts';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Share2, Tag } from 'lucide-react';
import SEO from '@/components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "");

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [navVisible, setNavVisible] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<any[]>(blogPosts);
  const { setScrollLocked } = useScrollLock();
  
  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);

    async function loadPost() {
      try {
        const dbRes = await fetch(`${API_BASE}/api/blogs/${slug}`);
        if (dbRes.ok) {
          const data = await dbRes.json();
          setPost(data.post);
          setIsLoading(false);
          return;
        }
      } catch { /* fallback below */ }

      const staticPost = getPostBySlug(slug || '');
      if (staticPost) {
        setPost(staticPost);
        setIsLoading(false);
        return;
      }

      try {
        const liveRes = await fetch('/live_posts.json');
        const data = await liveRes.json();
        const livePost = data.posts?.find((p: any) => p.slug === slug);
        if (data.posts) setAllPosts(prev => {
          const merged = [...data.posts, ...prev];
          return merged.filter((p, i, self) => i === self.findIndex(x => x.slug === p.slug));
        });
        setPost(livePost || null);
      } catch {
        setPost(null);
      }
      setIsLoading(false);
    }

    loadPost();
  }, [slug, setScrollLocked]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Find related posts (same category, excluding current)
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

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

  // Helper to parse HTML string and convert FAQs into accordion details
  const createInteractiveFAQs = (htmlContent: string) => {
    let processedHtml = htmlContent;
    
    try {
      if (typeof window !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const headings = Array.from(doc.querySelectorAll('h2, h3'));
        let inFAQSection = false;
        
        headings.forEach((heading) => {
          if (heading.tagName === 'H2' && heading.textContent?.toLowerCase().includes('faq')) {
            inFAQSection = true;
          } else if (heading.tagName === 'H2') {
            inFAQSection = false;
          }
          
          if (heading.tagName === 'H3' && (inFAQSection || heading.textContent?.endsWith('?'))) {
            const details = doc.createElement('details');
            details.className = 'group my-6 border border-white/10 bg-white/[0.02] rounded-2xl transition-all duration-300 open:bg-white/[0.04] hover:border-primary/30';
            
            const summary = doc.createElement('summary');
            summary.className = 'flex items-center justify-between cursor-pointer p-6 font-display font-semibold text-lg text-zinc-100 list-none [&::-webkit-details-marker]:hidden';
            summary.innerHTML = `${heading.innerHTML} <span class="transition-transform duration-300 group-open:rotate-45 text-primary/70 text-xl font-light">+</span>`;
            
            const contentDiv = doc.createElement('div');
            contentDiv.className = 'px-6 pb-6 text-zinc-300 leading-relaxed';
            
            let nextSibling = heading.nextElementSibling;
            while (nextSibling && nextSibling.tagName !== 'H2' && nextSibling.tagName !== 'H3') {
              const toMove = nextSibling;
              nextSibling = nextSibling.nextElementSibling;
              contentDiv.appendChild(toMove);
            }
            
            details.appendChild(summary);
            details.appendChild(contentDiv);
            
            heading.parentNode?.replaceChild(details, heading);
          }
        });
        
        processedHtml = doc.body.innerHTML;
      }
    } catch (e) {
      console.error("Error parsing FAQs", e);
    }
    
    return processedHtml;
  };

  const parsedContent = createInteractiveFAQs(post.content);

  const handleShare = async () => {
    const url = `https://fouriqtech.com/blog/${post.slug}`;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title={`${post.title} | FouriqTech Blog`}
        description={post.excerpt}
        url={`https://fouriqtech.com/blog/${post.slug}`}
        image={post.imageUrl}
        article={true}
        schema={articleSchema}
      />
      <Navbar isVisible={navVisible} />
      
      {/* Article Header */}
      <header className="relative pt-36 pb-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to all articles
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 rounded-full text-xs font-semibold text-primary border border-primary/25 uppercase tracking-wider">
                <Tag size={12} /> {post.category}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-3xl">
              {post.excerpt}
            </p>
            
            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <span className="font-medium text-zinc-300">{post.author}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary/70" /> {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-primary/70" /> {post.readTime}
                </span>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-primary hover:border-primary/30 transition-all"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Cover Image */}
      {post.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-5xl mx-auto px-6 lg:px-12 mb-12"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/40 aspect-[21/9]">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          </div>
        </motion.div>
      )}

      {/* Article Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-12 pb-24">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert lg:prose-lg max-w-none 
            prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-100 prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-8
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/[0.06]
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-zinc-300 prose-p:leading-[1.85] prose-p:mb-8 prose-p:text-[17px]
            prose-p:first-of-type:text-xl prose-p:first-of-type:leading-relaxed prose-p:first-of-type:text-zinc-200 prose-p:first-of-type:font-medium
            prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:underline-offset-4 prose-a:decoration-primary/30
            prose-strong:text-zinc-100 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8 prose-ul:text-zinc-300 prose-ul:text-[17px]
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8 prose-ol:text-zinc-300 prose-ol:text-[17px]
            prose-li:mb-3 prose-li:marker:text-primary/60 prose-li:leading-relaxed
            prose-blockquote:border-l-2 prose-blockquote:border-primary/60 prose-blockquote:pl-8 prose-blockquote:italic prose-blockquote:text-zinc-200 prose-blockquote:bg-primary/[0.03] prose-blockquote:py-6 prose-blockquote:pr-6 prose-blockquote:rounded-r-xl prose-blockquote:my-12 prose-blockquote:text-lg
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl prose-pre:shadow-xl
            prose-img:rounded-2xl prose-img:border prose-img:border-white/[0.06] prose-img:shadow-2xl prose-img:my-12
            prose-hr:border-white/[0.06] prose-hr:my-14"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-white/[0.06]">
            <h3 className="font-display text-2xl font-bold mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related, index) => (
                <motion.div
                  key={related.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/blog/${related.slug}`}
                    className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Related post image */}
                    {related.imageUrl && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img 
                          src={related.imageUrl} 
                          alt={related.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider mb-3">
                        {related.category}
                      </span>
                      <h4 className="font-display font-bold text-zinc-200 group-hover:text-primary transition-colors leading-snug mb-3 line-clamp-2">
                        {related.title}
                      </h4>
                      <p className="text-zinc-500 text-sm line-clamp-2 flex-1">{related.excerpt}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs text-primary/70 font-medium">
                        Read more <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
