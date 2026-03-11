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
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    // Show nav immediately on secondary pages
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title="FouriqTech Blog | Web Design & Marketing Insights"
        description="Read the latest insights, strategies, and technical guides on web design, SEO, and digital marketing for growing your business in Gujarat."
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
            Strategies, insights, and technical guides on web design, digital marketing, and growing your business in Gujarat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link 
              key={post.slug} 
              to={`/blog/${post.slug}`}
              className="group relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-primary/30 transition-colors duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-white/70 mb-4 border border-white/10">
                  {post.category}
                </span>
                <h2 className="text-2xl font-display font-bold text-zinc-100 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h2>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                {post.excerpt}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
                Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
