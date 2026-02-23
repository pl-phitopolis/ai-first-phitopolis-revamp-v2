import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Briefcase, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
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

type CareerFilterKey = "job_type" | "department" | "location";

// Filter config — add new categories here to extend filtering
const FILTER_CONFIG: Array<{ key: CareerFilterKey; label: string }> = [
  { key: "job_type", label: "Employment Type" },
  { key: "department", label: "Department" },
  { key: "location", label: "Location" },
];


const BENEFITS = [
  {
    emoji: "💰",
    title: "Competitive Pay",
    desc: "Industry leading salary and meaningful equity packages.",
  },
  {
    emoji: "📚",
    title: "Learning Budget",
    desc: "Generous allowance for conferences, certifications, courses, and source materials.",
  },
  {
    emoji: "🩺",
    title: "Health & Wellness",
    desc: "Premium health coverage and mental health support.",
  },
];

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string | undefined;
  onSelect: (value: string | null) => void;
}

const FilterDropdown = ({ label, options, value, onSelect }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
          value
            ? "bg-accent text-primary border-accent"
            : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
        }`}
      >
        {value || label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl min-w-[180px] py-2 overflow-hidden">
          <button
            onClick={() => { onSelect(null); setIsOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
              !value ? "font-semibold text-primary" : "text-slate-500"
            }`}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onSelect(option); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                value === option ? "font-semibold text-primary bg-accent/10" : "text-slate-500"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Partial<Record<CareerFilterKey, string>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const listRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const result = await apolloClient.query<CareersData>({
          query: GET_CAREERS,
        });

        console.log("GraphQL Response:", result);

        if (result.error) {
          console.error("GraphQL Error:", result.error);
          setError(`GraphQL Error: ${result.error.message}`);
        }

        setCareers(result.data.careers || []);
      } catch (error: any) {
        console.error("Error fetching careers:", error);
        setError(error.message || "Failed to fetch careers");
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const filterOptions = FILTER_CONFIG.reduce((acc, config) => {
    acc[config.key] = [
      ...new Set(careers.map((c) => c[config.key]).filter((v): v is string => !!v)),
    ].sort();
    return acc;
  }, {} as Record<CareerFilterKey, string[]>);

  const setFilter = (key: CareerFilterKey, value: string | null) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setCurrentPage(1);
  };

  const filteredCareers = careers.filter((job) =>
    FILTER_CONFIG.every(
      (config) => !activeFilters[config.key] || job[config.key] === activeFilters[config.key]
    )
  );

  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const paginatedCareers = filteredCareers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Build the future of engineering.
            </h1>
            <p className="text-xl text-slate-200 leading-relaxed font-light">
              Join our team of mathematicians, physicists, and engineers building the next
              generation of high-performance technology.
            </p>
          </div>
        </div>
      </section>

      {/* Job List */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-accent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-bold mb-2">Error loading careers</p>
              <p className="text-slate-500 text-sm">{error}</p>
              <p className="text-slate-400 text-xs mt-4">Check browser console for details</p>
            </div>
          ) : careers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No careers available at the moment.</p>
              <p className="text-slate-400 text-xs mt-2">Check browser console for details</p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div ref={listRef} className="flex flex-wrap items-center gap-3 mb-10">
                {FILTER_CONFIG.map((config) => {
                  const options = filterOptions[config.key] || [];
                  if (options.length === 0) return null;
                  return (
                    <FilterDropdown
                      key={config.key}
                      label={config.label}
                      options={options}
                      value={activeFilters[config.key]}
                      onSelect={(val) => setFilter(config.key, val)}
                    />
                  );
                })}
                {hasActiveFilters && (
                  <button
                    onClick={() => { setActiveFilters({}); setCurrentPage(1); }}
                    className="text-sm text-slate-400 hover:text-primary transition-colors ml-1"
                  >
                    Clear all
                  </button>
                )}
                {hasActiveFilters && (
                  <span className="text-xs text-slate-400 ml-auto">
                    {filteredCareers.length} result{filteredCareers.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {paginatedCareers.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 mb-4">No positions match your selected filters.</p>
                  <button
                    onClick={() => { setActiveFilters({}); setCurrentPage(1); }}
                    className="text-sm text-accent font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
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
                                <span className="text-xs text-slate-500 flex items-center">
                                  <Clock size={14} className="mr-1 text-accent" /> {job.job_type}
                                </span>
                              </div>
                              <h3 className="text-2xl font-display font-bold text-primary group-hover:text-primary-light transition-colors">
                                {job.job_title}
                              </h3>
                              <div className="flex items-center space-x-6 text-sm text-slate-500">
                                <span className="flex items-center">
                                  <MapPin size={16} className="mr-2 text-accent" /> {job.location}
                                </span>
                                <span className="flex items-center">
                                  <Briefcase size={16} className="mr-2 text-accent" /> Remote Friendly
                                </span>
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

                  {/* Per page + Pagination */}
                  <div className="flex items-center justify-between flex-wrap gap-4 mt-12">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Per page</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 bg-white hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                      >
                        {[3, 5, 10, 25].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "border border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary">
              Perks & Benefits
            </h2>
            <p className="text-slate-600 mt-4">
              We take care of our people so they can focus on what they do best.
            </p>
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
