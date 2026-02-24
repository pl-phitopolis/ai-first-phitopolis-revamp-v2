
import React, { useRef, useEffect } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import TextScramble from '../../components/TextScramble';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function ContactPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Contact Us | Phitopolis';
  }, []);

  // Motion values for interactive glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics
  const springConfig = { damping: 25, stiffness: 150 };
  const blobX = useSpring(mouseX, springConfig);
  const blobY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div className="bg-white min-h-screen text-primary">
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-12">
            {/* Header - Static (No animation) */}
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-primary"><TextScramble text="Let's talk tech." /></h1>
              <p className="text-xl text-slate-600 font-light leading-relaxed">
                Whether you have a complex R&D challenge or want to scale your data capabilities,
                our team is ready to assist.
              </p>
            </div>

            <div className="space-y-8">
              {/* Email - Slides from left to right */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="flex items-start space-x-6"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-primary">Email</h4>
                  <p className="text-slate-600">info@phitopolis.com</p>

                </div>
              </motion.div>

              {/* Office - Slides from left to right with delay */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex items-start space-x-6"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-primary">Office</h4>
                  <p className="text-slate-600">
                    27/F Ecotower Building<br />
                    32nd St. cor. 9th Avenue<br />
                    Bonifacio Global City, Taguig<br />
                    Philippines, 1634
                  </p>

                </div>
              </motion.div>
            </div>
          </div>

          {/* Interactive Form Card - Slides from right to left */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="group relative bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            {/* Interactive spotlight blob */}
            <motion.div
              className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
              style={{
                left: blobX,
                top: blobY,
                translateX: '-50%',
                translateY: '-50%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255,199,44,0.15) 0%, rgba(255,199,44,0) 70%)',
                filter: 'blur(80px)',
              }}
            />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-8 text-primary">Send a message</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message Sent!'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                    <input className="w-full bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary transition-all" placeholder="Your Name" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" className="w-full bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary transition-all" placeholder="email@company.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Inquiry Type</label>
                  <select className="w-full bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-accent text-primary appearance-none transition-all">
                    <option>Service Inquiry</option>
                    <option>Career Question</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                  <textarea className="w-full bg-white/80 backdrop-blur-sm border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-accent h-32 text-primary transition-all" placeholder="Tell us about your project..." required />
                </div>
                <button className="relative overflow-hidden w-full py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold flex items-center justify-center group transition-colors shadow-lg shadow-accent/20 hover:scale-105 active:scale-95">
                  <span className="shimmer-sweep" aria-hidden="true" />
                  <span className="relative z-10 flex items-center">
                    Send Inquiry
                    <Send size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
