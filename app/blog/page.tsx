
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { apolloClient } from '../../lib/apollo-client';
import { GET_BLOGS } from '../../lib/graphql/queries';
import { getAssetUrl } from '../../lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: {
    id: string;
  };
  tags?: string[];
  date_created: string;
  user_created?: {
    first_name: string;
    last_name: string;
  };
}

interface BlogsData {
  blog: BlogPost[];
}

export default function BlogPage() {
  const newsletterRef = useRef<HTMLDivElement>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const result = await apolloClient.query<BlogsData>({
          query: GET_BLOGS,
          fetchPolicy: 'network-only',
        });
        console.log('Blog data received:', result);
        console.log('Number of blogs:', result.data?.blog?.length || 0);

        if (result.error) {
          console.error('GraphQL Error:', result.error);
          setError(`GraphQL Error: ${result.error.message}`);
        }

        if (result.data?.blog) {
          console.log('First blog:', result.data.blog[0]);
          setBlogs(result.data.blog);
        }
      } catch (error: any) {
        console.error('Error fetching blogs:', error);
        console.error('Error details:', error.message, error.networkError);
        setError(error.message || 'Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);
  
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-bold mb-2">Error loading blog posts</p>
            <p className="text-slate-500 text-sm">{error}</p>
            <p className="text-slate-400 text-xs mt-4">Check browser console for details</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No blog posts available at the moment.</p>
            <p className="text-slate-400 text-xs mt-2">Check browser console for details</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {blogs.map((post: BlogPost, idx: number) => {
              const authorName = post.user_created
                ? `${post.user_created.first_name} ${post.user_created.last_name}`
                : 'Phitopolis Team';
              const formattedDate = new Date(post.date_created).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const thumbnailUrl = getAssetUrl(post.thumbnail?.id);

              return (
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
                        src={thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="space-y-4">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-accent">
                          <span>{post.tags[0]}</span>
                        </div>
                      )}
                      <h2 className="text-3xl font-display font-bold group-hover:text-primary-light transition-colors text-primary">{post.title}</h2>
                      {post.excerpt && <p className="text-slate-600 leading-relaxed line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center space-x-3 text-sm text-slate-500 pt-2">
                         <User size={14} className="text-accent" /> <span>{authorName}</span>
                         <Calendar size={14} className="ml-2 text-accent" /> <span>{formattedDate}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
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
