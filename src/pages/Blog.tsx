import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, Calendar, Clock, Search, Tag, ImageIcon } from 'lucide-react';
import SEO from '@/components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "");

export default function Blog() {
  const [navVisible, setNavVisible] = useState(false);
  const [displayPosts, setDisplayPosts] = useState(blogPosts);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);

    async function loadPosts() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const dbRes = await fetch(`${API_BASE}/api/blogs`, { signal: controller.signal });
        clearTimeout(timeout);
        const dbData = await dbRes.json();
        const dbPosts = dbData.posts || [];

        const merged = [...dbPosts, ...blogPosts];
        const unique = merged.filter((post, index, self) =>
          index === self.findIndex((p) => p.slug === post.slug)
        );
        unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setDisplayPosts(unique);
      } catch {
        try {
          const liveRes = await fetch('/live_posts.json');
          const liveData = await liveRes.json();
          if (liveData?.posts?.length > 0) {
            const merged = [...liveData.posts, ...blogPosts];
            const unique = merged.filter((post, index, self) =>
              index === self.findIndex((p) => p.slug === post.slug)
            );
            unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setDisplayPosts(unique);
          }
        } catch { /* static blogPosts already set */ }
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [setScrollLocked]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(displayPosts.map(p => p.category)))];

  // Filter posts
  const filteredPosts = displayPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title="FouriqTech Blog | Global Web Design Insights"
        description="Read the latest insights, strategies, and technical guides on web design and SEO for growing your business globally."
        url="https://fouriqtech.com/blog"
      />
      <Navbar isVisible={navVisible} />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 text-sm font-heading font-medium uppercase tracking-[0.3em] text-primary mb-6"
            >
              <span className="h-[2px] w-12 bg-gradient-to-r from-primary to-transparent" />
              Insights & Guides
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.9]"
            >
              Our <span className="text-gradient">Blog</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              Strategies, insights, and technical guides on web design, development, and growing your business globally.
            </motion.p>
          </div>

          {/* Search & Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-col md:flex-row gap-4 items-start md:items-center"
          >
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 border ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading articles...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">No articles found</h3>
            <p className="text-muted-foreground max-w-md">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <>
            {/* Featured Post (Hero Card with Image) */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-16"
              >
                <Link 
                  to={`/blog/${featuredPost.slug}`}
                  className="group relative block rounded-3xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="relative lg:w-[45%] aspect-[16/9] lg:aspect-auto overflow-hidden">
                      {featuredPost.imageUrl ? (
                        <>
                          <img 
                            src={featuredPost.imageUrl} 
                            alt={featuredPost.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] hidden lg:block" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent lg:hidden" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[#0a0a0a] to-accent/5 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ImageIcon size={32} className="text-primary/40" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="relative flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-[#0a0a0a]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 rounded-full text-xs font-semibold text-primary border border-primary/25 uppercase tracking-wider">
                            <Tag size={12} /> {featuredPost.category}
                          </span>
                          <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs font-medium text-zinc-400 border border-white/10">
                            Featured
                          </span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-zinc-100 group-hover:text-primary transition-colors duration-300 leading-tight mb-5">
                          {featuredPost.title}
                        </h2>
                        
                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6">
                          <span className="flex items-center gap-2 text-sm text-zinc-500">
                            <Calendar size={14} className="text-primary/70" /> {featuredPost.date}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-zinc-500">
                            <Clock size={14} className="text-primary/70" /> {featuredPost.readTime}
                          </span>
                          <span className="ml-auto flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wide">
                            Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Post Grid with Images */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {remainingPosts.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.08) }}
                  >
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="group relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/[0.06] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#080808]">
                        {post.imageUrl ? (
                          <>
                            <img 
                              src={post.imageUrl} 
                              alt={post.title}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-[#080808] to-accent/[0.04] flex items-center justify-center">
                            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                              <ImageIcon size={24} className="text-primary/30" />
                            </div>
                          </div>
                        )}
                        {/* Category badge on image */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-primary/90 uppercase tracking-wider border border-white/10">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="relative flex flex-col flex-1 p-6 bg-[#080808]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 flex flex-col flex-1">
                          {/* Title */}
                          <h2 className="text-lg font-display font-bold text-zinc-100 group-hover:text-primary transition-colors duration-300 leading-snug mb-3 line-clamp-2">
                            {post.title}
                          </h2>
                          
                          {/* Excerpt */}
                          <p className="text-zinc-400 text-sm leading-relaxed mb-5 flex-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                          
                          {/* Footer */}
                          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-primary/60" /> {post.date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={11} className="text-primary/60" /> {post.readTime}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-primary/80 group-hover:text-primary transition-colors">
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
