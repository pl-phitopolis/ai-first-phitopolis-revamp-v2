import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TextScramble from "../../components/TextScramble";
import {
  Clock, Briefcase, Building2, MapPin,
  ChevronLeft, ChevronRight, ChevronDown,
  SlidersHorizontal, X, ArrowLeft, Search, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apolloClient } from "../../lib/apollo-client";
import { GET_CAREERS } from "../../lib/graphql/queries";

interface Career {
  id: string;
  job_title: string;
  slug: string;
  department: string;
  location: string;
  job_type: string;
  short_description?: string;
}

interface CareersData {
  careers: Career[];
}

type CareerFilterKey = "job_type" | "department";

const FILTER_CONFIG: Array<{ key: CareerFilterKey; label: string; icon: React.ReactNode }> = [
  { key: "job_type", label: "JOB TYPE", icon: <Briefcase size={14} /> },
  { key: "department", label: "DEPARTMENT", icon: <Building2 size={14} /> },
];


const BENEFITS = [
  { emoji: "💰", title: "Competitive Pay", desc: "Industry leading salary and meaningful equity packages." },
  { emoji: "📚", title: "Learning Budget", desc: "Generous allowance for conferences, certifications, courses, and source materials." },
  { emoji: "🩺", title: "Health & Wellness", desc: "Premium health coverage and mental health support." },
];

// ─── Slack-like Filter Dropdown ────────────────────────────────────────────

interface SlackFilterDropdownProps {
  config: Array<{ key: CareerFilterKey; label: string; icon: React.ReactNode }>;
  options: Record<CareerFilterKey, string[]>;
  activeFilters: Record<CareerFilterKey, string[]>;
  onToggleValue: (key: CareerFilterKey, value: string) => void;
  onRemoveFilter: (key: CareerFilterKey) => void;
  onClose: () => void;
  initialView?: CareerFilterKey;
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
  const [view, setView] = useState<"fields" | CareerFilterKey>(initialView ?? "fields");
  const [fieldSearch, setFieldSearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");

  const activeField = view !== "fields" ? config.find((c) => c.key === view) : null;

  const visibleFields = config.filter((c) =>
    c.label.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const visibleValues = (options[view as CareerFilterKey] || []).filter((v) =>
    v.toLowerCase().includes(valueSearch.toLowerCase())
  );

  const handleSelectField = (key: CareerFilterKey) => {
    setView(key);
    setValueSearch("");
  };

  const handleBack = () => {
    setView("fields");
    setValueSearch("");
  };

  return (
    <div className="absolute top-full mt-2 left-0 z-50 bg-primary border border-white/15 rounded-xl shadow-2xl overflow-hidden w-[260px]">
      <AnimatePresence mode="wait" initial={false}>
        {view === "fields" ? (
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
              <span className="ml-1 text-[10px] text-white/40 border border-white/20 rounded px-1.5 py-0.5 flex items-center gap-1 cursor-default">
                includes <ChevronDown size={9} />
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
                const checked = (activeFilters[view as CareerFilterKey] || []).includes(v);
                return (
                  <label
                    key={v}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onToggleValue(view as CareerFilterKey, v)}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked
                        ? "bg-accent border-accent"
                        : "border-white/30 bg-transparent"
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
                  onRemoveFilter(view as CareerFilterKey);
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

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Careers | Phitopolis';
  }, []);

  // Slack-like filter state: each key maps to an array of selected values
  const [activeFilters, setActiveFilters] = useState<Record<CareerFilterKey, string[]>>({
    job_type: [],
    department: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Which pill was clicked to re-open its sub-panel
  const [reOpenKey, setReOpenKey] = useState<CareerFilterKey | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const listRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
        setReOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll to top of list on page change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const result = await apolloClient.query<CareersData>({ query: GET_CAREERS });
        if (result.error) setError(`GraphQL Error: ${result.error.message}`);
        setCareers(result.data.careers || []);
      } catch (error: any) {
        setError(error.message || "Failed to fetch careers");
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const filterOptions: Record<CareerFilterKey, string[]> = {
    job_type: Array.from<string>(new Set(careers.map((c) => c.job_type).filter((v): v is string => !!v))).sort(),
    department: Array.from<string>(new Set(careers.map((c) => c.department).filter((v): v is string => !!v))).sort(),
  };

  const toggleValue = (key: CareerFilterKey, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
    setCurrentPage(1);
  };

  const removeFilter = (key: CareerFilterKey) => {
    setActiveFilters((prev) => ({ ...prev, [key]: [] }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilters({ job_type: [], department: [] });
    setCurrentPage(1);
  };

  const activePills = FILTER_CONFIG.filter((c) => (activeFilters[c.key] || []).length > 0);
  const hasActiveFilters = activePills.length > 0;

  const filteredCareers = careers.filter((job) =>
    FILTER_CONFIG.every((c) => {
      const selected = activeFilters[c.key] || [];
      return selected.length === 0 || selected.includes(job[c.key]);
    })
  );

  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const paginatedCareers = filteredCareers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterButtonClick = () => {
    setReOpenKey(null);
    setIsFilterOpen((v) => !v);
  };

  const handlePillClick = (key: CareerFilterKey) => {
    setReOpenKey(key);
    setIsFilterOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6"><TextScramble text="Build the future of engineering." /></h1>
            <p className="text-xl text-slate-200 leading-relaxed font-light">
              Join our team of mathematicians, physicists, and engineers building the next generation of high-performance technology.
            </p>
          </div>
        </div>
      </section>

      {/* Job List */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-bold mb-2">Error loading careers</p>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          ) : careers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No careers available at the moment.</p>
            </div>
          ) : (
            <>
              <div ref={listRef} />

              {/* Sticky Filter & Pagination Bar */}
              <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md py-4 mb-10 border-b border-slate-100 -mx-6 px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">

                  {/* Left: Filter by button + active pills + Reset */}
                  <div className="flex flex-wrap items-center gap-2">

                    {/* Filter by button with dropdown */}
                    <div ref={filterPanelRef} className="relative">
                      <button
                        onClick={handleFilterButtonClick}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${isFilterOpen
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"
                          }`}
                      >
                        <SlidersHorizontal size={13} />
                        Filter by
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isFilterOpen && (
                        <SlackFilterDropdown
                          config={FILTER_CONFIG}
                          options={filterOptions}
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
                        {filteredCareers.length} result{filteredCareers.length !== 1 ? "s" : ""}
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
                        {[3, 5, 10, 25].map((n) => <option key={n} value={n}>{n}</option>)}
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
                        <span className="text-xs font-bold text-primary px-2">{currentPage} / {totalPages}</span>
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

              {paginatedCareers.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 mb-4">No positions match your selected filters.</p>
                  <button onClick={clearAllFilters} className="text-sm text-accent font-semibold hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedCareers.map((job: Career, idx: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                    >
                      <Link
                        to={`/careers/${job.slug}`}
                        className="group block p-8 bg-white border border-slate-200 rounded-2xl hover:border-accent hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent/20 px-3 py-1 rounded-full">
                                {job.department}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center capitalize">
                                <Clock size={14} className="mr-1 text-accent" /> {job.job_type}
                              </span>
                            </div>
                            <h3 className="text-2xl font-display font-bold text-primary group-hover:text-primary-light transition-colors">
                              {job.job_title}
                            </h3>
                            <div className="flex items-center space-x-6 text-sm text-slate-500">
                              <span className="flex items-center"><MapPin size={16} className="mr-2 text-accent" /> {job.location}</span>
                              <span className="flex items-center"><Briefcase size={16} className="mr-2 text-accent" /> Remote Friendly</span>
                            </div>
                          </div>
                          <button className="px-8 py-3 bg-accent text-primary rounded-full font-bold hover:bg-accent-hover transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20">
                            Apply Now
                          </button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary">Perks & Benefits</h2>
            <p className="text-slate-600 mt-4">We take care of our people so they can focus on what they do best.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                className="p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-xl">
                  {benefit.emoji}
                </div>
                <h4 className="font-bold mb-2 text-primary">{benefit.title}</h4>
                <p className="text-xs text-slate-500">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
