
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { JOBS } from '../../../constants';
import { ArrowLeft, Send, CheckCircle2, Info } from 'lucide-react';

export default function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find(j => j.slug === slug);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Job not found</h2>
          <Link to="/careers" className="text-accent hover:underline">Back to Careers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 text-primary">
      <div className="container mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-primary mb-12 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent/20 px-3 py-1 rounded-full">
                {job.department}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold mt-6 mb-4 text-primary">{job.title}</h1>
              <p className="text-slate-600">{job.location} • {job.type}</p>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-primary mb-6">Role Overview</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {job.description} Join a team of elites building high-performance systems where every millisecond counts.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Key Requirements</h2>
              <ul className="space-y-4">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start space-x-3 text-slate-700">
                    <CheckCircle2 size={20} className="text-accent mt-1 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Benefits</h2>
              <ul className="space-y-4">
                {job.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start space-x-3 text-slate-700">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl sticky top-24 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-primary">Apply for this role</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Application Submitted (Mock)'); }}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                  <input className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                  <input type="email" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Resume URL / LinkedIn</label>
                  <input type="url" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary" placeholder="https://" required />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message (Optional)</label>
                   <textarea className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-accent h-24 text-primary" />
                </div>
                <button className="w-full py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold flex items-center justify-center group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20">
                  Submit Application
                  <Send size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-4">
                  By applying, you agree to our privacy policy and terms.
                </p>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Info size={18} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-slate-600">Our hiring process typically takes 2-3 weeks from first contact.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
