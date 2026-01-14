import React from 'react';
import { Link } from 'react-router-dom';
import { JOBS } from '../../constants';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CareersPage() {
  const BENEFITS = [
    {
      emoji: "💰",
      title: "Competitive Pay",
      desc: "Industry leading salary and meaningful equity packages."
    },
    {
      emoji: "📚",
      title: "Learning Budget",
      desc: "Generous allowance for conferences, certifications, courses, and source materials."
    },
    {
      emoji: "🩺",
      title: "Health & Wellness",
      desc: "Premium health coverage and mental health support."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Static */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Build the future of engineering.</h1>
            <p className="text-xl text-slate-200 leading-relaxed font-light">
              Join our team of mathematicians, physicists, and engineers building the next generation of high-performance technology.
            </p>
          </div>
        </div>
      </section>

      {/* Job List */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            {JOBS.map((job, idx) => (
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
                          <Clock size={14} className="mr-1 text-accent" /> {job.type}
                        </span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-primary group-hover:text-primary-light transition-colors">{job.title}</h3>
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
        </div>
      </section>

      {/* Benefits Section */}
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
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-xl">{benefit.emoji}</div>
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