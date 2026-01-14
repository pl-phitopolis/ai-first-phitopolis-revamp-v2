
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { SERVICES, JOBS } from '../constants.tsx';

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Motion values for interactive spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics
  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section 
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-primary group"
      >
        {/* Static & Animated Background Layers (Original) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[160px] animate-bg-drift-1"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-accent/10 rounded-full blur-[140px] animate-bg-drift-2"></div>
          <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[180px] animate-bg-drift-3"></div>
          
          {/* NEW: Interactive Spotlight Blob */}
          <motion.div 
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              left: spotlightX,
              top: spotlightY,
              translateX: '-50%',
              translateY: '-50%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(255,199,44,0.12) 0%, rgba(255,199,44,0) 70%)',
              filter: 'blur(60px)',
              zIndex: 1
            }}
          />

          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-6 text-center relative z-10"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-3 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Available for Q4 2024 Partnerships</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-bold mb-6 tracking-tight leading-none text-white">
            Making tomorrow's <br className="hidden md:block" /> technology available today.
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Phitopolis builds elite software for R&D, Data Science, and Full-Stack Engineering. 
            Founded by industry veterans from the world's leading investment banks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/services" className="px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold flex items-center group shadow-lg shadow-accent/30 transition-all hover:scale-105 active:scale-95">
              Explore Services
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/careers" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full font-bold border border-white/30 transition-all hover:scale-105 active:scale-95">
              Join the Team
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        >
           <div className="w-1 h-12 bg-gradient-to-b from-accent to-transparent rounded-full"></div>
        </motion.div>
      </section>

      {/* Services Summary */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs">Our Expertise</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mt-2 text-primary">What we build</h2>
            </div>
            <Link to="/services" className="text-slate-500 hover:text-primary flex items-center text-sm font-medium transition-colors group">
              View all services <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.15,
                  ease: [0.21, 1.02, 0.47, 0.98] 
                }}
                className="p-8 bg-slate-50 border border-slate-200 rounded-2xl group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6 text-primary transform transition-transform group-hover:scale-110 duration-500">
                    {React.cloneElement(service.icon as React.ReactElement<any>, { className: "w-8 h-8 text-primary" })}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-primary">{service.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((f, j) => (
                      <li key={j} className="text-xs text-slate-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Credentials Section */}
      <section className="py-24 bg-primary relative overflow-hidden text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold">Built by practitioners, for practitioners.</h2>
              <p className="text-slate-200 text-lg">
                Our leadership team brings decades of experience from Morgan Stanley, JPMorgan, and Deutsche Bank. 
                We understand the rigors of high-frequency, data-intensive environments.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl font-display font-bold text-accent">15+</div>
                  <div className="text-sm text-slate-300 uppercase tracking-wide">Years Exp</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-display font-bold text-accent">50+</div>
                  <div className="text-sm text-slate-300 uppercase tracking-wide">Projects</div>
                </div>
              </div>
              <Link to="/about" className="inline-flex items-center text-accent font-bold hover:underline group">
                Our Story <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-sm"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full"></div>
               <div className="space-y-6">
                 {[
                   { icon: <Zap className="text-accent" />, title: "Ultra Low Latency", desc: "Sub-microsecond execution systems" },
                   { icon: <Shield className="text-accent" />, title: "Enterprise Security", desc: "Military grade encryption standards" },
                   { icon: <TrendingUp className="text-accent" />, title: "Scalable Alpha", desc: "Statistical arbitrage & ML strategy" }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center space-x-4 p-4 bg-primary/50 border border-white/10 rounded-xl hover:bg-primary transition-colors duration-300">
                     {item.icon}
                     <div>
                       <div className="font-bold text-sm text-white">{item.title}</div>
                       <div className="text-xs text-slate-300">{item.desc}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-primary">Work with the best.</h2>
            <p className="text-slate-600 mb-12 max-w-xl mx-auto">
              We're looking for world-class engineers and data scientists to solve impossible problems.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto space-y-4 text-left">
            {JOBS.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link 
                  to={`/careers/${job.slug}`}
                  className="group block p-6 bg-white border border-slate-200 rounded-xl hover:border-accent hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-xl text-primary group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.department} • {job.location}</p>
                  </div>
                  <div className="px-4 py-2 bg-slate-100 text-primary text-sm font-bold rounded-full group-hover:bg-accent group-hover:text-primary transition-all group-hover:scale-105 active:scale-95">
                    View Position
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/careers" className="text-primary hover:text-accent font-bold transition-all underline decoration-accent underline-offset-4">View all 12 openings</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
