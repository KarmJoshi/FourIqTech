import React from 'react';
import { motion } from 'framer-motion';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, BookOpen, Clock, Sparkles, ImageIcon } from 'lucide-react';

const FeaturedInsights = () => {
  const featuredPosts = blogPosts
    .filter(post => post.category.includes('Engineering') || post.category.includes('Architecture'))
    .slice(0, 3);

  if (featuredPosts.length === 0) return null;

  return (
    <section className="py-28 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-heading font-medium uppercase tracking-[0.3em] text-primary mb-5"
            >
              <Sparkles size={14} /> From the Blog
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-[1.1]"
            >
              Engineering <span className="text-gradient">Insights</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Deep dives into architecture, performance optimization, and enterprise-grade engineering.
            </motion.p>
          </div>
          <motion.a
            href="/blog"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-sm font-medium text-zinc-300 hover:text-primary hover:border-primary/30 transition-all duration-300 group shrink-0"
          >
            All articles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featuredPosts.map((post, index) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group relative flex flex-col h-full rounded-2xl border border-white/[0.06] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
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
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <ImageIcon size={20} className="text-primary/30" />
                    </div>
                  </div>
                )}
                {/* Read time badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-zinc-300 font-medium border border-white/10">
                    <Clock size={10} /> {post.readTime}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col flex-1 p-6 bg-[#080808]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col flex-1">
                  {/* Category */}
                  <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-primary/10 text-primary rounded-lg border border-primary/15 self-start mb-4">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold font-display mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/[0.06] mt-auto flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                      <BookOpen size={13} className="text-primary/70" />
                      Read Article
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <ArrowRight size={13} className="text-zinc-400 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-accent/[0.03] blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
};

export default FeaturedInsights;
