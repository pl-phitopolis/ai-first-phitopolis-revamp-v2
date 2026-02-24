
import React, { useRef, useEffect } from 'react';
import { TEAM } from '../../constants';
import { Linkedin, ExternalLink, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { TeamMember } from '../../types';
import TextScramble from '../../components/TextScramble';
import MagneticWrapper from '../../components/MagneticWrapper';

// Fixed Type: Explicitly defining props interface and including key to resolve list rendering TS error
interface TeamMemberCardProps {
  member: TeamMember;
  idx: number;
  key?: React.Key;
}

const TeamMemberCard = ({ member, idx }: TeamMemberCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for cursor-tracking blob
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const blobX = useSpring(mouseX, springConfig);
  const blobY = useSpring(mouseY, springConfig);

  // Motion values for 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const rY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateX.set(-(y - 0.5) * 8);
    rotateY.set((x - 0.5) * 8);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: '1000px' }}>
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      style={{ rotateX: rX, rotateY: rY }}
      className="group relative p-8 bg-slate-50 border border-slate-200 rounded-3xl hover:border-accent/50 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 overflow-hidden"
    >
      {/* Interactive Background Blob */}
      <motion.div 
        className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          left: blobX,
          top: blobY,
          translateX: '-50%',
          translateY: '-50%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,199,44,0.15) 0%, rgba(255,199,44,0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 transition-all shadow-sm">
        <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="relative z-10 flex-1 space-y-4">
        <div>
          <h3 className="text-3xl font-bold text-primary">{member.name}</h3>
          <p className="text-primary/70 font-bold text-sm tracking-wide uppercase">{member.role}</p>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
        <div className="flex flex-wrap gap-2">
          {member.expertise.map((exp: string, i: number) => (
            <span key={i} className="text-[10px] uppercase font-bold text-primary/60 bg-accent/10 px-2 py-1 rounded">
              {exp}
            </span>
          ))}
        </div>
        <div className="flex space-x-4 pt-2">
          <Linkedin size={18} className="text-slate-400 hover:text-accent cursor-pointer transition-colors" />
          <ExternalLink size={18} className="text-slate-400 hover:text-accent cursor-pointer transition-colors" />
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default function TeamPage() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Our Team | Phitopolis';
  }, []);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ctaRef.current) return;
    const rect = ctaRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div className="bg-white min-h-screen text-primary">
      {/* Header Section - Static */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <span className="text-accent font-bold tracking-widest uppercase text-xs">
            The Collective
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mt-4 mb-8 text-primary">
            <TextScramble text="Meet the practitioners." />
          </h1>
          <p className="text-xl text-slate-600 font-light leading-relaxed">
            At Phitopolis, caliber is our only currency. We are a team of global technologists and entrepreneurs 
            dedicated to solving the most complex engineering challenges.
          </p>
        </div>

        {/* Engineering DNA Highlights - Scroll Animations Retained */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm"
          >
            <Award className="text-primary w-10 h-10" />
            <h3 className="text-xl font-bold">Institutional Rigor</h3>
            <p className="text-slate-600 text-sm">Leadership with senior roles at Morgan Stanley, JPMorgan, and Merrill Lynch.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm"
          >
            <Zap className="text-primary w-10 h-10" />
            <h3 className="text-xl font-bold">Local Expertise</h3>
            <p className="text-slate-600 text-sm">Deep roots in the Philippine technology ecosystem with a history of building high-performing local teams.</p>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div className={`grid grid-cols-1 ${TEAM.length > 1 ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8`}>
          {TEAM.map((member, idx) => (
            <TeamMemberCard key={member.id} member={member} idx={idx} />
          ))}
        </div>

        {/* Culture Teaser - Now with Interactive Spotlight */}
        <div 
          ref={ctaRef}
          onMouseMove={handleMouseMove}
          className="group mt-32 p-12 bg-primary border border-primary-light rounded-3xl text-center shadow-2xl relative overflow-hidden"
        >
          {/* Interactive spotlight blob */}
          <motion.div 
            className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
            style={{
              left: spotlightX,
              top: spotlightY,
              translateX: '-50%',
              translateY: '-50%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(255,199,44,0.15) 0%, rgba(255,199,44,0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          
          <h2 className="text-3xl font-display font-bold mb-6 text-white relative z-10">Want to join our global team?</h2>
          <p className="text-slate-200 mb-8 max-w-xl mx-auto relative z-10">
            We're always looking for brilliant minds who obsess over building the next generation of financial and enterprise technology.
          </p>
          <MagneticWrapper>
            <Link to="/careers" className="relative overflow-hidden inline-flex px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold transition-colors hover:scale-105 active:scale-95 shadow-lg shadow-accent/20 z-10">
              <span className="shimmer-sweep" aria-hidden="true" />
              <span className="relative z-10">View Career Opportunities</span>
            </Link>
          </MagneticWrapper>
        </div>
      </section>
    </div>
  );
}
