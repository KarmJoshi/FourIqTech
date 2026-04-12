import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import { getPostBySlug } from '@/data/blogPosts';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import SEO from '@/components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [navVisible, setNavVisible] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setScrollLocked } = useScrollLock();
  
  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);

    async function loadPost() {
      try {
        // 1. Try DB API first
        const dbRes = await fetch(`${API_BASE}/api/blogs/${slug}`);
        if (dbRes.ok) {
          const data = await dbRes.json();
          setPost(data.post);
          setIsLoading(false);
          return;
        }
      } catch { /* fallback below */ }

      // 2. Try static
      const staticPost = getPostBySlug(slug || '');
      if (staticPost) {
        setPost(staticPost);
        setIsLoading(false);
        return;
      }

      // 3. Try live storage
      try {
        const liveRes = await fetch('/live_posts.json');
        const data = await liveRes.json();
        const livePost = data.posts?.find((p: any) => p.slug === slug);
        setPost(livePost || null);
      } catch {
        setPost(null);
      }
      setIsLoading(false);
    }

    loadPost();
  }, [slug, setScrollLocked]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-primary tracking-widest font-bold">LOADING ARTICLE...</div></div>;
  }

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

  // Helper to parse HTML string and convert FAQs into accordion details
  const createInteractiveFAQs = (htmlContent: string) => {
    // 1. In standard markdown-to-html, an FAQ section is usually an <h2> followed by <h3> questions.
    // We look for <h3> tags inside the content that appear to be questions.
    
    // This regex looks for <h3>Question</h3> followed by <p>Answer</p>
    // It is a simple heuristic to wrap them in <details> tags
    let processedHtml = htmlContent;
    
    // Advanced parsing: replace <h3> Q </h3> <p> A </p> with <details><summary> Q </summary> <div class="faq-content"> <p> A </p> </div></details>
    // Since regex on HTML is fragile, we'll do a simple string replacement pattern for the common AI output structures
    
    // Find all H3s (which are the FAQ questions) and wrap them and the following P tags until the next H3 or H2
    try {
      if (typeof window !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Find the FAQ h2 section if it exists
        const headings = Array.from(doc.querySelectorAll('h2, h3'));
        let inFAQSection = false;
        
        headings.forEach((heading) => {
          if (heading.tagName === 'H2' && heading.textContent?.toLowerCase().includes('faq')) {
            inFAQSection = true;
          } else if (heading.tagName === 'H2') {
            inFAQSection = false; // Left FAQ section
          }
          
          // If we are an H3 (often used for questions whether under an FAQ H2 or not)
          if (heading.tagName === 'H3' && (inFAQSection || heading.textContent?.endsWith('?'))) {
            const details = doc.createElement('details');
            details.className = 'group my-6 border border-white/10 bg-white/5 rounded-xl transition-all duration-300 open:bg-white/10 hover:border-primary/50';
            
            const summary = doc.createElement('summary');
            summary.className = 'flex items-center justify-between cursor-pointer p-6 font-display font-semibold text-xl text-zinc-100 list-none [&::-webkit-details-marker]:hidden';
            summary.innerHTML = `${heading.innerHTML} <span class="transition-transform duration-300 group-open:-rotate-180 text-primary opacity-70">▼</span>`;
            
            const contentDiv = doc.createElement('div');
            contentDiv.className = 'p-6 pt-0 text-zinc-300 leading-relaxed border-t border-white/10 mt-2';
            
            // Gather all sibling elements until the next H2 or H3
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
              prose-p:text-zinc-300 prose-p:leading-loose prose-p:mb-10 prose-p:text-lg prose-p:text-justify prose-p:tracking-wide
              prose-p:first-of-type:text-xl prose-p:first-of-type:leading-relaxed prose-p:first-of-type:text-zinc-100 prose-p:first-of-type:font-medium
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:underline-offset-4
              prose-strong:text-zinc-100 prose-strong:font-semibold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8 prose-ul:text-zinc-300 prose-ul:text-lg
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8 prose-ol:text-zinc-300 prose-ol:text-lg
              prose-li:mb-2 prose-li:marker:text-primary/70
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-8 prose-blockquote:italic prose-blockquote:text-zinc-200 prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/10 prose-blockquote:to-transparent prose-blockquote:py-6 prose-blockquote:pr-6 prose-blockquote:rounded-r-2xl prose-blockquote:my-14 prose-blockquote:text-xl
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-2xl
              prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-12
              prose-hr:border-white/10 prose-hr:my-12"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
