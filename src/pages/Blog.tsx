import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import SEO from '@/components/SEO';

export default function Blog() {
  const [navVisible, setNavVisible] = useState(false);
  const [displayPosts, setDisplayPosts] = useState(blogPosts);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    // Show nav immediately on secondary pages
    setNavVisible(true);
    setScrollLocked(false);

    // Fetch Live Posts
    fetch('/live_posts.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.posts && data.posts.length > 0) {
          // Merge static and live, deduplicating by slug
          const merged = [...data.posts, ...blogPosts];
          const unique = merged.filter((post, index, self) =>
            index === self.findIndex((p) => p.slug === post.slug)
          );
          // Sort by date descending
          unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setDisplayPosts(unique);
        }
      })
      .catch(err => console.error("Could not fetch live posts:", err));
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title="FouriqTech Blog | Global Web Design Insights"
        description="Read the latest insights, strategies, and technical guides on web design and SEO for growing your business globally."
        url="https://fouriqtech.com/blog"
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-3 text-sm font-heading font-medium uppercase tracking-[0.3em] text-primary mb-6">
            <span className="h-[2px] w-8 bg-gradient-to-r from-transparent via-primary to-transparent" />
            Insights & Guides
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
            Our <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Strategies, insights, and technical guides on web design and growing your business globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post) => (
            <Link 
              key={post.slug} 
              to={`/blog/${post.slug}`}
              className="group relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-primary/30 transition-colors duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary/70" /> {post.date}</span>
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary/70" /> {post.readTime}</span>
              </div>
              
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-zinc-300 mb-4 border border-white/10 shadow-sm">
                  {post.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-zinc-100 group-hover:text-primary transition-colors duration-300 leading-tight">
                  {post.title}
                </h2>
              </div>
              
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 flex-1 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-base font-medium text-primary uppercase tracking-wide">
                Read Article <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
