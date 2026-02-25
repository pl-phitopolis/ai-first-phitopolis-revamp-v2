
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TextScramble from '../../components/TextScramble';
import {
  Calendar, User, Tag,
  ChevronLeft, ChevronRight, ChevronDown,
  SlidersHorizontal, X, ArrowLeft, Search, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { apolloClient } from '../../lib/apollo-client';
import { GET_BLOGS } from '../../lib/graphql/queries';
import { getAssetUrl } from '../../lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: { id: string };
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

type BlogFilterKey = 'author' | 'tag';

const BLOG_FILTER_CONFIG: Array<{ key: BlogFilterKey; label: string; icon: React.ReactNode }> = [
  { key: 'author', label: 'AUTHOR', icon: <User size={14} /> },
  { key: 'tag', label: 'TAG', icon: <Tag size={14} /> },
];

const getAuthorName = (post: BlogPost) =>
  post.user_created
    ? `${post.user_created.first_name} ${post.user_created.last_name}`.trim()
    : 'Phitopolis Team';

// ─── Slack-like Filter Dropdown ────────────────────────────────────────────

interface SlackFilterDropdownProps {
  config: Array<{ key: BlogFilterKey; label: string; icon: React.ReactNode }>;
  options: Record<BlogFilterKey, string[]>;
  activeFilters: Record<BlogFilterKey, string[]>;
  onToggleValue: (key: BlogFilterKey, value: string) => void;
  onRemoveFilter: (key: BlogFilterKey) => void;
  onClose: () => void;
  initialView?: BlogFilterKey;
}

function SlackFilterDropdown({
  config,
  options,
  activeFilters,
  onToggleValue,
  onRemoveFilter,
  onClose,
  initialView,
}: SlackFilterDropdownProps) {
  const [view, setView] = useState<'fields' | BlogFilterKey>(initialView ?? 'fields');
  const [fieldSearch, setFieldSearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');

  const activeField = view !== 'fields' ? config.find((c) => c.key === view) : null;

  const visibleFields = config.filter((c) =>
    c.label.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const visibleValues = (options[view as BlogFilterKey] || []).filter((v) =>
    v.toLowerCase().includes(valueSearch.toLowerCase())
  );

  const handleSelectField = (key: BlogFilterKey) => {
    setView(key);
    setValueSearch('');
  };

  const handleBack = () => {
    setView('fields');
    setValueSearch('');
  };

  return (
    <div className="absolute top-full mt-2 left-0 z-50 bg-primary border border-white/15 rounded-xl shadow-2xl overflow-hidden w-[260px]">
      <AnimatePresence mode="wait" initial={false}>
        {view === 'fields' ? (
          <motion.div
            key="fields"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search */}
            <div className="p-2 border-b border-white/15">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <Search size={13} className="text-white/50 shrink-0" />
                <input
                  autoFocus
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  placeholder="Filter by field..."
                  className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full"
                />
              </div>
            </div>

            {/* Fields list */}
            <div className="py-1">
              {visibleFields.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleSelectField(c.key)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <span className="text-white/50">{c.icon}</span>
                  {c.label}
                  {(activeFilters[c.key] || []).length > 0 && (
                    <span className="ml-auto text-[10px] bg-accent/25 text-accent font-bold px-1.5 py-0.5 rounded-full">
                      {activeFilters[c.key].length}
                    </span>
                  )}
                </button>
              ))}

              {visibleFields.length === 0 && (
                <p className="px-4 py-3 text-xs text-white/30">No matching fields.</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
          >
            {/* Sub-panel header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/15">
              <button
                onClick={handleBack}
                className="text-white/50 hover:text-white transition-colors p-0.5 rounded"
              >
                <ArrowLeft size={14} />
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {activeField?.label}
              </span>
            </div>

            {/* Value search */}
            <div className="p-2 border-b border-white/15">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <Search size={13} className="text-white/50 shrink-0" />
                <input
                  autoFocus
                  value={valueSearch}
                  onChange={(e) => setValueSearch(e.target.value)}
                  placeholder={`Filter by ${activeField?.label.toLowerCase()}...`}
                  className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="max-h-[200px] overflow-y-auto py-1">
              {visibleValues.map((v) => {
                const checked = (activeFilters[view as BlogFilterKey] || []).includes(v);
                return (
                  <label
                    key={v}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onToggleValue(view as BlogFilterKey, v)}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked
                        ? 'bg-accent border-accent'
                        : 'border-white/30 bg-transparent'
                        }`}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3L3.5 5.5L8 1" stroke="#0A2A66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-white/80 uppercase tracking-wide">
                      {v}
                    </span>
                  </label>
                );
              })}

              {visibleValues.length === 0 && (
                <p className="px-4 py-3 text-xs text-white/30">No options available.</p>
              )}
            </div>

            {/* Remove filter */}
            <div className="border-t border-white/15 px-4 py-2.5">
              <button
                onClick={() => {
                  onRemoveFilter(view as BlogFilterKey);
                  handleBack();
                }}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors font-semibold"
              >
                <Trash2 size={12} />
                Remove filter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function BlogPage() {
  useEffect(() => {
    document.title = 'Blog | Phitopolis';
  }, []);

  const newsletterRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Slack-like filter state
  const [activeFilters, setActiveFilters] = useState<Record<BlogFilterKey, string[]>>({
    author: [],
    tag: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reOpenKey, setReOpenKey] = useState<BlogFilterKey | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
        setReOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const result = await apolloClient.query<BlogsData>({
          query: GET_BLOGS,
          fetchPolicy: 'network-only',
        });
        if (result.error) setError(`GraphQL Error: ${result.error.message}`);
        if (result.data?.blog) setBlogs(result.data.blog);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const blogFilterOptions: Record<BlogFilterKey, string[]> = {
    author: Array.from<string>(new Set(blogs.map(getAuthorName))).sort(),
    tag: Array.from<string>(new Set<string>(blogs.flatMap((p) => p.tags ?? []))).sort(),
  };

  const toggleValue = (key: BlogFilterKey, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
    setCurrentPage(1);
  };

  const removeFilter = (key: BlogFilterKey) => {
    setActiveFilters((prev) => ({ ...prev, [key]: [] }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilters({ author: [], tag: [] });
    setCurrentPage(1);
  };

  const activePills = BLOG_FILTER_CONFIG.filter((c) => (activeFilters[c.key] || []).length > 0);
  const hasActiveFilters = activePills.length > 0;

  const filteredBlogs = blogs.filter((post) =>
    BLOG_FILTER_CONFIG.every((c) => {
      const selected = activeFilters[c.key] || [];
      if (selected.length === 0) return true;
      if (c.key === 'author') return selected.includes(getAuthorName(post));
      if (c.key === 'tag') return selected.some((t) => (post.tags || []).includes(t));
      return true;
    })
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Newsletter spotlight
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

  const handleFilterButtonClick = () => {
    setReOpenKey(null);
    setIsFilterOpen((v) => !v);
  };

  const handlePillClick = (key: BlogFilterKey) => {
    setReOpenKey(key);
    setIsFilterOpen(true);
  };

  return (
    <div className="bg-white min-h-screen text-primary">
      <section className="py-24 container mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-accent font-bold tracking-widest uppercase text-xs">Insights</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mt-4 mb-8 text-primary"><TextScramble text="Technical perspectives." /></h1>
          <p className="text-xl text-slate-600 font-light">Deep dives into FinTech, ML, and the future of distributed systems.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-accent rounded-full animate-spin"></div>
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
          <>
            {/* Scroll anchor */}
            <div ref={listRef} />

            {/* Sticky Filter & Pagination Bar */}
            <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md py-4 mb-12 border-b border-slate-100 -mx-6 px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">

                {/* Left: Filter by button + active pills + Reset */}
                <div className="flex flex-wrap items-center gap-2">

                  {/* Filter by button with dropdown */}
                  <div ref={filterPanelRef} className="relative">
                    <button
                      onClick={handleFilterButtonClick}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${isFilterOpen
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                        }`}
                    >
                      <SlidersHorizontal size={13} />
                      Filter by
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isFilterOpen && (
                      <SlackFilterDropdown
                        config={BLOG_FILTER_CONFIG}
                        options={blogFilterOptions}
                        activeFilters={activeFilters}
                        onToggleValue={toggleValue}
                        onRemoveFilter={removeFilter}
                        onClose={() => setIsFilterOpen(false)}
                        initialView={reOpenKey ?? undefined}
                      />
                    )}
                  </div>

                  {/* Active filter pills */}
                  <AnimatePresence>
                    {activePills.map((c) => {
                      const values = activeFilters[c.key];
                      const label = values.length === 1
                        ? values[0].toUpperCase()
                        : `${values.length} selected`;
                      return (
                        <motion.div
                          key={c.key}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1 pl-3 pr-1.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => handlePillClick(c.key)}
                        >
                          <span className="opacity-70 mr-0.5">{c.label}:</span>
                          {label}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFilter(c.key); }}
                            className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Reset */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors font-semibold"
                    >
                      Reset
                    </button>
                  )}

                  {hasActiveFilters && (
                    <span className="text-xs text-slate-400 font-semibold">
                      {filteredBlogs.length} post{filteredBlogs.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Right: Per page + pagination */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Per page</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-slate-200 rounded-lg px-2 py-2 text-[10px] text-slate-600 bg-white hover:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      {[3, 5, 10, 25].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs font-bold text-primary px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {paginatedBlogs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 mb-4">No posts match your selected filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-accent font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {paginatedBlogs.map((post: BlogPost, idx: number) => {
                  const authorName = getAuthorName(post);
                  const formattedDate = new Date(post.date_created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const thumbnailUrl = getAssetUrl(post.thumbnail?.id);

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group block space-y-6">
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
                          <h2 className="text-3xl font-display font-bold group-hover:text-primary-light transition-colors text-primary">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-slate-600 leading-relaxed line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="flex items-center space-x-3 text-sm text-slate-500 pt-2">
                            <User size={14} className="text-accent" />
                            <span>{authorName}</span>
                            <Calendar size={14} className="ml-2 text-accent" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter Section */}
      <motion.section
        ref={newsletterRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-primary text-white relative overflow-hidden group"
      >
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
            zIndex: 1,
          }}
        />
        <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
          <h3 className="text-3xl font-display font-bold mb-4">Stay ahead of the curve.</h3>
          <p className="text-slate-300 mb-8">
            Subscribe to our monthly newsletter for engineering insights and updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 outline-none focus:ring-1 focus:ring-accent text-white placeholder-white/50"
              placeholder="Email Address"
            />
            <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95">
              Subscribe
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
