
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../../constants';
import { Calendar, User } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function BlogPage() {
  const newsletterRef = useRef<HTMLDivElement>(null);
  
  // Motion values for newsletter spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!newsletterRef.current) return;
    const rect = newsletterRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div className="bg-white min-h-screen text-primary">
      {/* Insights Header - Static */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <span className="text-accent font-bold tracking-widest uppercase text-xs">Insights</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mt-4 mb-8 text-primary">Technical perspectives.</h1>
          <p className="text-xl text-slate-600 font-light">Deep dives into FinTech, ML, and the future of distributed systems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {BLOG_POSTS.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
            >
              <Link 
                to={`/blog/${post.slug}`}
                className="group block space-y-6"
              >
                <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-shadow group-hover:shadow-lg">
                  <img 
                    src={post.thumbnail} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-accent">
                    <span>{post.category}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-slate-400">{post.readTime}</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold group-hover:text-primary-light transition-colors text-primary">{post.title}</h2>
                  <p className="text-slate-600 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center space-x-3 text-sm text-slate-500 pt-2">
                     <User size={14} className="text-accent" /> <span>{post.author}</span>
                     <Calendar size={14} className="ml-2 text-accent" /> <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter Section - Fade in + Spotlight */}
      <motion.section 
        ref={newsletterRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-primary text-white relative overflow-hidden group"
      >
        {/* Interactive Spotlight Blob */}
        <motion.div 
          className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
          style={{
            left: spotlightX,
            top: spotlightY,
            translateX: '-50%',
            translateY: '-50%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,199,44,0.15) 0%, rgba(255,199,44,0) 70%)',
            filter: 'blur(60px)',
            zIndex: 1
          }}
        />

        <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
          <h3 className="text-3xl font-display font-bold mb-4">Stay ahead of the curve.</h3>
          <p className="text-slate-300 mb-8">Subscribe to our monthly newsletter for engineering insights and updates.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 outline-none focus:ring-1 focus:ring-accent text-white placeholder-white/50" placeholder="Email Address" />
            <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95">Subscribe</button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
