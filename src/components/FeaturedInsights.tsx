import React from 'react';
import { motion } from 'framer-motion';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

const FeaturedInsights = () => {
  // Logic to pick "Pillar" posts (latest 3 for now, or those with 'Engineering' category)
  const featuredPosts = blogPosts
    .filter(post => post.category.includes('Engineering') || post.category.includes('Architecture'))
    .slice(0, 3);

  if (featuredPosts.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              Latest <span className="text-gradient">Engineering Insights</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Deep dives into architecture, performance optimization, and enterprise-grade SaaS engineering.
            </motion.p>
          </div>
          <motion.a
            href="/blog"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-medium group"
          >
            Explore all articles <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col h-full glass-card p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary rounded-full border border-primary/20">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={14} />
                    {post.readTime}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-8 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>

                <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    Read Case Study
                  </span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <ArrowRight size={18} className="group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
};

export default FeaturedInsights;
