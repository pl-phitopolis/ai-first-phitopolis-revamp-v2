import React, { useState, useRef, useEffect } from 'react';
import { Target, Eye, Heart, Play, X, Rocket, ShieldCheck, Globe, Building2, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import TextScramble from '../../components/TextScramble';

export default function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    document.title = 'About Us | Phitopolis';
  }, []);
  
  // Interactive spotlight logic for the Founder's Story section
  const founderSectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!founderSectionRef.current) return;
    const rect = founderSectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const PHILOSOPHY = [
    {
      icon: <Target size={26} />,
      title: "Mission",
      desc: "To build high-performance systems that make massive datasets actionable, empowering our clients to stay ahead in competitive markets."
    },
    {
      icon: <Eye size={26} />,
      title: "Vision",
      desc: "To be the global benchmark for elite R&D and data science services, recognized for our technical depth and proven outcomes."
    },
    {
      icon: <Heart size={26} />,
      title: "Values",
      desc: "Radical transparency, technical integrity, and a relentless pursuit of performance. We value depth over breadth."
    }
  ];

  const JOURNEY_DATA = [
    {
      year: '2021',
      title: 'Inception',
      desc: 'Phitopolis founded with a core team of quant engineers.',
      icon: <Rocket className="text-accent" />
    },
    {
      year: '2022',
      title: 'Growth',
      desc: 'Strategic partnerships with global investment banks.',
      icon: <ShieldCheck className="text-accent" />
    },
    {
      year: '2023',
      title: 'Delivery',
      desc: 'Scaling operations across multiple global time zones.',
      icon: <Globe className="text-accent" />
    },
    {
      year: '2024',
      title: 'Ready',
      desc: 'Pioneering next-gen AI infrastructures in NYC.',
      icon: <Building2 className="text-accent" />
    },
    {
      year: '2025',
      title: 'Evolved',
      desc: 'Modernized infrastructure and expanded R&D capabilities.',
      icon: <Cpu className="text-accent" />
    },
    {
      year: '2026',
      title: 'Frontier',
      desc: 'Leading the frontier in AI-first engineering solutions.',
      icon: <Zap className="text-accent" />,
      current: true
    }
  ];

  return (
    <div className="bg-white min-h-screen text-primary">
      {/* Hero */}
      <section className="min-h-screen flex items-center border-b border-slate-100">
        <div className="container mx-auto px-6 py-32">
          <div className="max-w-4xl">
            <span className="text-accent font-bold tracking-widest uppercase text-xs">Our Story</span>
            <h1 className="text-5xl md:text-8xl font-display font-bold mt-4 mb-12 tracking-tight text-primary">
              <TextScramble text="We bridge the gap between vision and reality." />
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
              Phitopolis was founded with a single mission: to provide elite-level technology services 
              that empower organizations to solve their most complex data and computational challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-32 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-6">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <span className="text-accent font-bold tracking-widest uppercase text-xs">What Drives Us</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 leading-tight">
              Built on a clear<br />philosophy.
            </h2>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {PHILOSOPHY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative p-10 md:p-12 group overflow-hidden hover:bg-white/[0.03] transition-colors duration-500"
              >
                {/* Large background number */}
                <div className="absolute -top-2 -right-2 text-[140px] font-black text-white/[0.04] font-display leading-none select-none pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-300">
                    {item.icon}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold">{item.title}</h3>
                  <p className="text-white/55 leading-relaxed text-lg">{item.desc}</p>
                </div>

                {/* Accent line reveal */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.15 + 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ transformOrigin: 'left center' }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent/10"
                />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs">Visual Story</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-2 text-primary">Engineering in Motion</h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => setIsVideoOpen(true)}
          >
            <img 
              src="https://phitopolis.com/img/core-competencies/teamwork-and-leadership.jpg" 
              alt="Phitopolis Team" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-primary shadow-xl">
                <Play size={32} fill="currentColor" className="ml-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/95 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center" onClick={() => setIsVideoOpen(false)}>
                <X size={24} />
              </button>
              <iframe src="https://player.vimeo.com/video/799777608?autoplay=1" className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Founder's Story with Cursor-following Blob */}
      <section 
        ref={founderSectionRef}
        onMouseMove={handleMouseMove}
        className="py-24 bg-slate-50 relative overflow-hidden group"
      >
        {/* Interactive Spotlight Blob */}
        <motion.div 
          className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
          style={{
            left: spotlightX,
            top: spotlightY,
            translateX: '-50%',
            translateY: '-50%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,199,44,0.12) 0%, rgba(255,199,44,0) 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
               className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl"
             >
               <img src="https://phitopolis.com/blog/wp-content/uploads/2025/05/image1.png" alt="Phitopolis Office" className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
               <div className="absolute bottom-8 left-8 text-white">
                 <div className="font-bold text-2xl">Expanding Horizons</div>
                 <div className="text-white/80">Phitopolis Unveils Its New Office</div>
               </div>
             </motion.div>
             <div className="space-y-8">
               <h2 className="text-4xl font-display font-bold text-primary">Rooted in High-Finance.</h2>
               <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                 <p>
                   Our founders spent years at the intersection of quantitative finance and distributed computing. 
                   Building systems for JPMorgan and Morgan Stanley taught us that reliability is non-negotiable 
                   and performance is the ultimate differentiator.
                 </p>
                 <p>
                   In 2021, we realized that these same challenges—massive data, low-latency requirements, 
                   and the need for complex R&D—were moving into broader enterprise sectors. Phitopolis was born 
                   to bring that elite expertise to you.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* STATIC Grid Journey Timeline */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent font-bold tracking-widest uppercase text-xs">Milestones</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mt-2">Our Journey</h2>
          </div>

          <div className="relative">
            {/* Timeline Background Line (XL screens only, positioned at top of card area) */}
            <div className="hidden xl:block absolute top-6 left-0 w-full h-[1px] bg-slate-100 z-0" />

            {/* Grid Container - No scrolling needed */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-8 relative z-10">
              {JOURNEY_DATA.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative lg:flex lg:flex-col"
                >
                  {/* Visual Node on the line (XL Desktop only) - sits above the card */}
                  <div className="hidden xl:block absolute top-6 left-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary -translate-y-1/2 -translate-x-1/2 z-20">
                    {item.current && <div className="absolute inset-0 rounded-full bg-accent animate-ping" />}
                  </div>

                  {/* Spacer to push card below the dot (XL screens only) */}
                  <div className="hidden xl:block h-14" />

                  {/* Milestone Card */}
                  <div
                    className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-20px_rgba(10,42,102,0.1)] transition-all duration-500 group lg:flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl md:text-5xl font-display font-black text-slate-100 group-hover:text-accent/20 transition-colors">
                          {item.year}
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-accent/10 transition-colors">
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                        </div>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2 mb-2">
                        {item.title}
                        {item.current && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase rounded-full">Now</span>
                        )}
                      </h3>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
