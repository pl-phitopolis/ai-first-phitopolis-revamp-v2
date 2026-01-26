
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronRight, Zap, Shield, TrendingUp, Hexagon, Circle, Triangle } from 'lucide-react';
import { SERVICES } from '../constants.tsx';
import { apolloClient } from '../lib/apollo-client';
import { GET_CAREERS } from '../lib/graphql/queries';

// Floating shapes for the practitioners section
const PractitionersFloatingShapes = () => {
  const shapes = [
    { Icon: Hexagon, size: 30, x: '5%', y: '20%', duration: 18, delay: 0 },
    { Icon: Circle, size: 20, x: '95%', y: '30%', duration: 15, delay: 1 },
    { Icon: Triangle, size: 24, x: '90%', y: '70%', duration: 20, delay: 2 },
    { Icon: Hexagon, size: 18, x: '8%', y: '75%', duration: 16, delay: 1.5 },
    { Icon: Circle, size: 14, x: '50%', y: '15%', duration: 22, delay: 0.5 },
  ];

  return (
    <>
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <shape.Icon
            size={shape.size}
            className="text-accent"
            strokeWidth={1}
          />
        </motion.div>
      ))}
    </>
  );
};

// Lightning effect icon (for Zap)
const LightningIcon = ({ isHovered }: { isHovered: boolean }) => (
  <motion.div className="relative w-10 h-10 flex items-center justify-center">
    {/* Electric field effect */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,44,0.4) 0%, transparent 70%)',
      }}
      animate={{
        scale: isHovered ? [1, 1.8, 1.5, 2, 1.3] : [1, 1.3, 1],
        opacity: isHovered ? [0.5, 0.8, 0.4, 1, 0.5] : [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: isHovered ? 0.5 : 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {/* Lightning bolts */}
    {isHovered && (
      <>
        <motion.div
          className="absolute w-6 h-0.5 bg-accent rounded-full"
          style={{ rotate: '45deg', left: '-8px', top: '12px' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.2 }}
        />
        <motion.div
          className="absolute w-5 h-0.5 bg-accent rounded-full"
          style={{ rotate: '-45deg', right: '-6px', bottom: '12px' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, delay: 0.15, repeat: Infinity, repeatDelay: 0.2 }}
        />
        <motion.div
          className="absolute w-4 h-0.5 bg-accent rounded-full"
          style={{ rotate: '30deg', left: '-4px', bottom: '8px' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.25, delay: 0.1, repeat: Infinity, repeatDelay: 0.3 }}
        />
      </>
    )}
    {/* Icon */}
    <motion.div
      animate={{
        scale: isHovered ? [1, 1.2, 1] : 1,
        rotate: isHovered ? [0, -5, 5, 0] : 0,
      }}
      transition={{ duration: 0.3, repeat: isHovered ? Infinity : 0, repeatDelay: 0.2 }}
    >
      <Zap className="text-accent w-5 h-5 relative z-10" />
    </motion.div>
  </motion.div>
);

// Shield pulse effect icon
const ShieldIcon = ({ isHovered }: { isHovered: boolean }) => (
  <motion.div className="relative w-10 h-10 flex items-center justify-center">
    {/* Ripple effects - only on hover */}
    {isHovered && (
      <>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/40"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.8, 2.2],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/40"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.8, 2.2],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 1.5,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </>
    )}
    {/* Shield glow */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,44,0.3) 0%, transparent 70%)',
      }}
      animate={{
        scale: isHovered ? [1, 1.5, 1.2] : [1, 1.15, 1],
        opacity: isHovered ? [0.5, 0.8, 0.5] : [0.2, 0.35, 0.2],
      }}
      transition={{
        duration: isHovered ? 0.8 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {/* Icon */}
    <motion.div
      animate={{
        scale: isHovered ? [1, 1.15, 1.1] : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <Shield className="text-accent w-5 h-5 relative z-10" />
    </motion.div>
  </motion.div>
);

// Trending up growth effect icon
const TrendingIcon = ({ isHovered }: { isHovered: boolean }) => (
  <motion.div className="relative w-10 h-10 flex items-center justify-center">
    {/* Upward particles */}
    {isHovered && (
      <>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            initial={{ y: 10, x: -5 + i * 4, opacity: 0 }}
            animate={{
              y: [-5, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.15,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </>
    )}
    {/* Growth glow */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'linear-gradient(to top, rgba(255,199,44,0.4) 0%, transparent 100%)',
      }}
      animate={{
        scale: isHovered ? [1, 1.4, 1.2] : [1, 1.2, 1],
        opacity: isHovered ? [0.4, 0.7, 0.4] : [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: isHovered ? 0.6 : 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {/* Icon */}
    <motion.div
      animate={{
        y: isHovered ? [0, -3, 0] : 0,
        scale: isHovered ? 1.1 : 1,
      }}
      transition={{ duration: 0.4, repeat: isHovered ? Infinity : 0 }}
    >
      <TrendingUp className="text-accent w-5 h-5 relative z-10" />
    </motion.div>
  </motion.div>
);

// Interactive Credential Card with hover text swap
const CredentialCard = ({
  iconType,
  title,
  description,
  index,
}: {
  iconType: 'zap' | 'shield' | 'trending';
  title: string;
  description: string;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = {
    zap: LightningIcon,
    shield: ShieldIcon,
    trending: TrendingIcon,
  }[iconType];

  return (
    <motion.div
      className="flex items-center space-x-4 p-4 bg-primary/50 border border-white/10 rounded-xl hover:bg-primary/70 hover:border-accent/30 transition-all duration-300 cursor-default overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, x: 5 }}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 + 0.3 }}
    >
      <IconComponent isHovered={isHovered} />
      <div className="relative flex-1 h-10 overflow-hidden">
        {/* Title - slides up and fades on hover */}
        <motion.div
          className="absolute inset-0 flex items-center"
          animate={{
            y: isHovered ? -30 : 0,
            opacity: isHovered ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <span className="font-bold text-sm text-white">{title}</span>
        </motion.div>
        {/* Description - slides up from below on hover */}
        <motion.div
          className="absolute inset-0 flex items-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{
            y: isHovered ? 0 : 30,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <span className="text-sm text-accent font-medium">{description}</span>
        </motion.div>
      </div>
      {/* Hover indicator arrow */}
      <motion.div
        animate={{
          x: isHovered ? 0 : -10,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="w-4 h-4 text-accent" />
      </motion.div>
    </motion.div>
  );
};

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

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [careers, setCareers] = useState<Career[]>([]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const result = await apolloClient.query<CareersData>({
          query: GET_CAREERS,
        });
        setCareers(result.data.careers || []);
      } catch (error) {
        console.error('Error fetching careers:', error);
      }
    };

    fetchCareers();
  }, []);
  
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
        {/* Background Video */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-105"
          >
            <source src="/hi-tech_blue_digital_connectivity_abstract_video.mp4" type="video/mp4" />
          </video>
          
          {/* Static & Animated Background Layers */}
          <div className="absolute inset-0">
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
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-6 text-center relative z-10"
        >
          <h1 className="text-5xl md:text-8xl font-display font-bold mb-6 tracking-tight leading-none text-white">
            Make tomorrow's <br className="hidden md:block" /> technology with us!
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Founded by veterans in finance, we build the data systems of tomorrow.
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
              <h2 className="text-4xl md:text-5xl font-display font-bold mt-2 text-primary">Services we offer</h2>
            </div>
            <Link to="/services" className="text-slate-500 hover:text-primary flex items-center text-sm font-medium transition-colors group">
              View all services <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
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
                className="p-8 bg-slate-50 border border-slate-200 rounded-2xl group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 text-primary transform transition-transform group-hover:scale-110 duration-500">
                    {React.cloneElement(service.icon as React.ReactElement<any>, { className: "w-8 h-8 text-primary" })}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-primary">{service.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {service.features.map((f, j) => (
                      <li key={j} className="text-xs text-slate-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {/* Service Card Image moved inside relative z-10 for consistent bottom alignment */}
                  <div className="relative mt-auto -mx-8 -mb-8 overflow-hidden h-48">
                    <img 
                      src={[
                        'https://phitopolis.com/img/core-competencies/innovation.jpg',
                        'https://phitopolis.com/img/core-competencies/technical-excellence.jpg',
                        'https://phitopolis.com/img/core-competencies/proactive-communication.jpg'
                      ][i % 3]} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Credentials Section */}
      <section className="py-24 bg-primary relative overflow-hidden text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large watermark background text with pulsing outline */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Glowing outline layer */}
            <motion.div
              className="absolute text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem] xl:text-[24rem] 2xl:text-[28rem] font-display font-bold whitespace-nowrap select-none leading-none tracking-tight"
              style={{
                WebkitTextStroke: '1px rgba(255,199,44,0.1)',
                WebkitTextFillColor: 'transparent',
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              animate={{
                WebkitTextStroke: [
                  '1px rgba(255,199,44,0.05)',
                  '2px rgba(255,199,44,0.15)',
                  '1px rgba(255,199,44,0.05)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              7 YEARS
            </motion.div>
            {/* Main text with subtle pulse */}
            <motion.div
              className="text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem] xl:text-[24rem] 2xl:text-[28rem] font-display font-bold text-white/[0.03] whitespace-nowrap select-none leading-none tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              animate={{
                opacity: [0.03, 0.045, 0.03],
              }}
              style={{
                textShadow: '0 0 80px rgba(255,199,44,0.05)',
              }}
            >
              7 YEARS
            </motion.div>
            {/* Ambient glow behind text */}
            <motion.div
              className="absolute w-full h-full"
              style={{
                background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,199,44,0.03) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden pb-4 sm:pb-6 md:pb-8">
            <motion.div
              className="text-[0.7rem] sm:text-[1rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2.5rem] 2xl:text-[3rem] font-display font-bold text-white/[0.04] whitespace-nowrap select-none uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            >
              Building Tomorrow's Technology
            </motion.div>
          </div>

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,199,44,0.1) 0%, transparent 70%)',
              filter: 'blur(80px)',
              left: '-10%',
              top: '20%',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
              right: '-5%',
              bottom: '10%',
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating geometric shapes */}
          <PractitionersFloatingShapes />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
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
              <Link to="/about" className="inline-flex items-center text-accent font-bold hover:underline group">
                Our Story <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-sm group"
            >
              {/* Animated corner glow */}
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 blur-2xl rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 5,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="space-y-4 relative z-10">
                <CredentialCard
                  iconType="zap"
                  title="Ultra Low Latency"
                  description="Sub-microsecond execution systems"
                  index={0}
                />
                <CredentialCard
                  iconType="shield"
                  title="Enterprise Security"
                  description="Military grade encryption standards"
                  index={1}
                />
                <CredentialCard
                  iconType="trending"
                  title="Scalable Alpha"
                  description="Statistical arbitrage & ML strategy"
                  index={2}
                />
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
            {careers.slice(0, 5).map((job: Career, idx: number) => (
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
                    <h3 className="font-bold text-xl text-primary group-hover:text-primary transition-colors">{job.job_title}</h3>
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
            <Link to="/careers" className="text-primary hover:text-accent font-bold transition-all underline decoration-accent underline-offset-4">
              {careers.length > 0
                ? `View all ${careers.length} opening${careers.length !== 1 ? 's' : ''}`
                : 'View careers page'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
