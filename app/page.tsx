
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import MagneticWrapper from '../components/MagneticWrapper';
import { ArrowRight, ChevronRight, Zap, Shield, TrendingUp, Hexagon, Circle, Triangle } from 'lucide-react';
import { SERVICES } from '../constants.tsx';
import { apolloClient } from '../lib/apollo-client';
import { GET_CAREERS } from '../lib/graphql/queries';
import { Hero, Showcase } from './ai-day/page.tsx';

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
      className="flex items-center space-x-4 p-4 bg-primary/50 border border-white/10 rounded-xl hover:bg-primary/70 hover:border-accent/30 focus-within:bg-primary/70 focus-within:border-accent/30 transition-all duration-300 cursor-default overflow-hidden outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${title}: ${description}`}
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

// Terminal typing overlay — shown on service card image hover
function DataStreamOverlay({ story, isVisible }: { story: string; isVisible: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setDisplayedText('');
    let index = 0;
    intervalRef.current = window.setInterval(() => {
      index++;
      if (index <= story.length) {
        setDisplayedText(story.slice(0, index));
      } else {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 25);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, story]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex flex-col justify-center overflow-hidden" style={{ backgroundColor: 'rgba(10, 42, 102, 0.92)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
      <div className="relative z-10 px-5 py-4 overflow-y-auto max-h-full">
        <div className="flex items-center gap-2 mb-3" style={{ opacity: 0.5 }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f87171' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#facc15' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ade80' }} />
          <span className="text-xs ml-2" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>phitopolis://expertise</span>
        </div>
        <p style={{ color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.6' }}>
          <span style={{ color: '#FFC72C', fontWeight: 700 }}>$ </span>
          {displayedText}
          <span className="inline-block ml-0.5 align-middle" style={{ width: '7px', height: '14px', backgroundColor: '#6ee7b7', animation: 'cursor-blink 0.8s steps(2) infinite' }} />
        </p>
      </div>
    </div>
  );
}

interface HomeSvcCardProps {
  service: typeof SERVICES[number];
  i: number;
  key?: React.Key;
}

function HomeSvcCard({ service, i }: HomeSvcCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rX = useSpring(rotateX, { stiffness: 280, damping: 28 });
  const rY = useSpring(rotateY, { stiffness: 280, damping: 28 });

  // Parallax: shift the image as the card travels through the viewport so it
  // scrolls slightly slower than the card itself.
  const { scrollYProgress } = useScroll({
    target: imageContainerRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateX.set(-(y - 0.5) * 9);
    rotateY.set((x - 0.5) * 9);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsImageHovered(false);
  };

  const images = [
    'https://phitopolis.com/img/core-competencies/innovation.jpg',
    'https://phitopolis.com/img/core-competencies/technical-excellence.jpg',
    'https://phitopolis.com/img/core-competencies/proactive-communication.jpg',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8, delay: i * 0.15, ease: [0.21, 1.02, 0.47, 0.98] }}
      style={{ perspective: '900px' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: rX, rotateY: rY }}
        className="p-8 bg-slate-50 border border-slate-200 rounded-2xl group relative overflow-hidden hover:shadow-xl flex flex-col h-full transition-shadow duration-300"
      >
        <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors duration-500" />
        <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-6 text-primary transform transition-transform group-hover:scale-110 duration-500">
            {React.cloneElement(service.icon as React.ReactElement<any>, { className: 'w-8 h-8 text-primary' })}
          </div>
          <h3 className="text-xl font-bold mb-4 text-primary">{service.title}</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">{service.description}</p>
          <ul className="space-y-3 mb-8 flex-grow">
            {service.features.map((f, j) => (
              <li key={j} className="text-xs text-slate-500 flex items-center">
                <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                {f.title}
              </li>
            ))}
          </ul>
          <div
            ref={imageContainerRef}
            className="relative mt-auto -mx-8 -mb-8 overflow-hidden h-48"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            {/* Parallax wrapper — sized 140% of the container so the ±15%
                translate stays within bounds and never reveals empty edges. */}
            <motion.div
              style={{ y: imageY, top: '-20%', bottom: '-20%' }}
              className="absolute left-0 right-0"
            >
              <img
                src={images[i % 3]}
                alt={service.title}
                className={`w-full h-full object-cover transition-all duration-700 ${isImageHovered ? 'scale-110 grayscale' : 'scale-100 group-hover:scale-110'}`}
              />
            </motion.div>
            <DataStreamOverlay story={service.story} isVisible={isImageHovered} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

const STITCH_VIDEOS = [
  '/videostitches/towervideo.mp4',
  '/videostitches/towervideo2.mp4',
];

function StitchedVideoBackground() {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const videos = refs.map(r => r.current!);

    // Preload both, play only the first
    videos.forEach((v, i) => {
      v.load();
      if (i === 0) v.play().catch(() => {});
    });

    const handlers = videos.map((v, i) => {
      const onEnded = () => {
        const next = (i + 1) % videos.length;
        videos[next].currentTime = 0;
        videos[next].play().catch(() => {});
        setActive(next);
      };
      v.addEventListener('ended', onEnded);
      return () => v.removeEventListener('ended', onEnded);
    });

    return () => handlers.forEach(cleanup => cleanup());
  }, []);

  return (
    <>
      {STITCH_VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={refs[i]}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: active === i ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}
    </>
  );
}

// ── Sticky Services Section (alternative layout) ─────────────────────────────
const SERVICE_VIDEOS = [
  '/expertise/research-and-development.mp4',
  '/expertise/support-and-operations.mp4',
  '/expertise/data-science.mp4',
];

// Navbar is fixed at ~72px. Box fills viewport below nav with py-4 breathing room.
// Nav (4.5rem) + top padding (1rem) + bottom padding (1rem) = 6.5rem
const NAV_H  = '4.5rem';   // ~72px fixed header
const VPAD   = '1rem';     // padding above and below the box
const BOX_H  = `calc(100vh - ${NAV_H} - ${VPAD} * 2)`;

function StickyServicesSection({ onReady }: { onReady?: () => void }) {
  const [activeService, setActiveService] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Page-scroll driven service index
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const idx = Math.min(SERVICES.length - 1, Math.floor(progress * SERVICES.length));
      setActiveService(idx);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Slow-motion playback
  useEffect(() => {
    videoRefs.current.forEach(v => { if (v) v.playbackRate = 0.35; });
  }, []);

  // Track each service video loaded
  useEffect(() => {
    if (!onReady) return;
    let stale = false;
    const report = () => { if (!stale) onReady(); };
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    const listeners: Array<[HTMLVideoElement, () => void]> = [];
    videos.forEach(v => {
      if (v.readyState >= 4) { report(); return; }
      const handler = () => report();
      v.addEventListener('canplaythrough', handler, { once: true });
      listeners.push([v, handler]);
    });
    return () => { stale = true; listeners.forEach(([v, h]) => v.removeEventListener('canplaythrough', h)); };
  }, [onReady]);

  // Pause inactive, play active
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      i === activeService ? v.play().catch(() => {}) : v.pause();
    });
  }, [activeService]);

  const service = SERVICES[activeService];

  return (
    <>
      {/* ── Sticky scroll space + viewer ───────────────────────────────── */}
      {/* Outer: SERVICES.length * 100vh gives scroll room per service */}
      <div
        ref={sectionRef}
        style={{ height: `${SERVICES.length * 100}vh` }}
        className="relative bg-white"
      >
        {/* Inner: sticks to viewport while outer scrolls */}
        <div
          className="sticky top-0 h-screen flex items-center px-6"
          style={{ paddingTop: `calc(${NAV_H} + ${VPAD})`, paddingBottom: VPAD }}
        >
          <div className="container mx-auto">
            <div className="flex gap-8 md:gap-12" style={{ height: BOX_H }}>

              {/* ── Left: rounded video card ── */}
              <div
                className="hidden md:block w-2/5 flex-shrink-0 rounded-3xl overflow-hidden relative"
                style={{ boxShadow: '0 24px 64px -12px rgba(10,42,102,0.18), 0 8px 24px -4px rgba(0,0,0,0.10)' }}
              >
                {SERVICE_VIDEOS.map((src, i) => (
                  <motion.video
                    key={src}
                    ref={el => { videoRefs.current[i] = el; }}
                    autoPlay={i === 0}
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    animate={{ opacity: activeService === i ? 1 : 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                  >
                    <source src={src} type="video/mp4" />
                  </motion.video>
                ))}
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Ghost number */}
                <div className="absolute bottom-4 left-6 pointer-events-none select-none overflow-hidden">
                  <motion.span
                    key={activeService}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="block font-display font-bold leading-none"
                    style={{ fontSize: 'clamp(5rem,10vw,9rem)', color: 'rgba(255,199,44,0.07)', WebkitTextStroke: '1.5px rgba(255,199,44,0.22)' }}
                  >
                    0{activeService + 1}
                  </motion.span>
                </div>

                {/* Label + progress */}
                <div className="absolute bottom-7 left-7 z-10">
                  <motion.p
                    key={`lbl-${activeService}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-[11px] uppercase tracking-[0.18em] text-accent font-bold mb-2.5"
                  >
                    {service.title}
                  </motion.p>
                  <div className="flex gap-1.5 items-center">
                    {SERVICES.map((_, i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        animate={{
                          width: activeService === i ? 24 : 6,
                          height: 4,
                          backgroundColor: activeService === i ? '#FFC72C' : 'rgba(255,255,255,0.3)',
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right: animated service content ── */}
              <div className="flex-1 flex flex-col justify-between py-10 overflow-hidden">

                {/* Top: section heading + service content grouped */}
                <div className="space-y-8">
                  <div>
                    <span className="text-accent font-bold tracking-widest uppercase text-xs">Our Expertise</span>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mt-2 text-primary leading-none whitespace-nowrap">
                      Services we offer
                    </h2>
                  </div>

                {/* Animated content block */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.21, 1.02, 0.47, 0.98] }}
                    className="space-y-6"
                  >
                    {/* Icon */}
                    <div>
                      {React.cloneElement(service.icon as React.ReactElement<any>, { className: 'w-7 h-7 text-accent flex-shrink-0' })}
                    </div>

                    {/* Title */}
                    <h3 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-lg leading-relaxed">
                      {service.description}
                    </p>

                    {/* Feature list — icon + title + description */}
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4 pt-2">
                      {service.features.map((f, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: j * 0.08 + 0.12, duration: 0.35 }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-transparent hover:border-accent/20 hover:bg-slate-50 transition-colors duration-200 cursor-default"
                        >
                          <motion.div
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/10"
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,199,44,0.18)' }}
                            transition={{ duration: 0.2 }}
                          >
                            {React.cloneElement(f.icon as React.ReactElement<any>, {
                              className: 'w-4 h-4 text-accent',
                              strokeWidth: 1.75,
                            })}
                          </motion.div>
                          <div>
                            <div className="w-4 h-0.5 rounded-full bg-accent mb-1.5" />
                            <span className="text-slate-700 text-sm font-semibold leading-snug block">{f.title}</span>
                            <span className="text-slate-400 text-xs leading-relaxed mt-1 block">{f.description}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
                </div>

                {/* Bottom: progress + hint */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {SERVICES.map((_, j) => (
                      <div
                        key={j}
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: j === activeService ? 28 : 8,
                          backgroundColor: j === activeService ? '#0A2A66' : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    {activeService < SERVICES.length - 1 && (
                      <motion.span
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[11px] text-slate-300 tracking-widest uppercase font-medium ml-1"
                      >
                        Scroll for next
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Scroll-to-play sequence ──────────────────────────────────────────────────
const SEQ_VIDEO_SRC = '/we-build-the-future.mp4';

const ParallaxHeading = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [120, -120]);

  return (
    <div id="parallax-heading" ref={ref} className="relative overflow-hidden bg-white pt-32 pb-10">
      <motion.div style={{ y }} className="text-center">
        <h2 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-widest text-primary select-none">
          PH<span className="text-accent">IT</span>OPOLIS
        </h2>
        <div className="mx-auto mt-6 mb-4 w-12 h-0.5 bg-accent rounded-full" />
        <p className="text-lg md:text-xl text-slate-400 tracking-wide">
          Built for what's next
        </p>
      </motion.div>
    </div>
  );
};

const HeroWithRadius = ({ onReady, ready }: { onReady?: () => void; ready?: boolean }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 164]);
  const headingY = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);

  return (
    <motion.div
      ref={heroRef}
      className="overflow-hidden relative"
      style={{ borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
    >
      <Hero ready={ready ?? false} hideDecorations onReady={onReady} />
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 3.2, duration: 1.2, ease: 'easeOut' }}
        className="absolute bottom-10 left-0 right-0 z-10 text-center"
        style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.04em', margin: 0, y: headingY }}
      >
        Making tomorrow&apos;s technology<br /><span style={{ color: '#FFC72C' }}>available today.</span>
      </motion.h1>
    </motion.div>
  );
};

const ScrollSequenceSection = ({ onReady }: { onReady?: () => void }) => {
  const containerRef    = useRef<HTMLDivElement>(null);
  const frameWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const headingRef      = useRef<HTMLHeadingElement>(null);
  const seekingRef      = useRef(false);
  const pendingTimeRef  = useRef<number | null>(null);

  // Draw current video frame to canvas with cover-crop
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width, ch = canvas.height;
    const vr = video.videoWidth / video.videoHeight;
    const cr = cw / ch;

    let sx: number, sy: number, sw: number, sh: number;
    if (vr > cr) {
      sh = video.videoHeight;
      sw = sh * cr;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      sw = video.videoWidth;
      sh = sw / cr;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  }, []);

  // Seek to a time, serialising requests so they don't pile up
  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    if (seekingRef.current) {
      // Already mid-seek — stash the latest requested time
      pendingTimeRef.current = time;
      return;
    }
    seekingRef.current = true;
    video.currentTime = time;
  }, []);

  // Sync canvas pixel size to display size
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      drawFrame();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame]);

  // Wire up video events: draw on seeked, then flush any pending seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onSeeked = () => {
      drawFrame();
      seekingRef.current = false;
      if (pendingTimeRef.current !== null) {
        const next = pendingTimeRef.current;
        pendingTimeRef.current = null;
        seekTo(next);
      }
    };

    const onReady_ = () => {
      drawFrame();
      if (onReady) onReady();
    };

    video.addEventListener('seeked', onSeeked);
    if (video.readyState >= 2) {
      onReady_();
    } else {
      video.addEventListener('loadeddata', onReady_, { once: true });
    }
    return () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadeddata', onReady_);
    };
  }, [drawFrame, seekTo, onReady]);

  // Advance video based on scroll position
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      const video     = videoRef.current;
      if (!container || !video || !video.duration) return;

      const rect       = container.getBoundingClientRect();
      const vh         = window.innerHeight;
      const scrollable = container.offsetHeight - vh;
      const progress   = Math.max(0, Math.min(1, -rect.top / scrollable));
      const releaseP   = Math.max(0, Math.min(1, (-rect.top - scrollable) / vh));

      seekTo(progress * video.duration);

      // Expand frame from bottom, then drop the radius once it's full-screen
      if (frameWrapperRef.current) {
        const expandP   = Math.max(0, Math.min(1, progress / 0.4));
        const scale     = 0.88 + 0.12 * expandP;
        const radiusP   = Math.max(0, Math.min(1, (progress - 0.4) / 0.1));
        const radius    = 144 * (1 - radiusP);
        const parallaxY = releaseP * vh * 0.3;
        frameWrapperRef.current.style.transform    = `translateY(${parallaxY}px) scale(${scale})`;
        frameWrapperRef.current.style.borderRadius = `${radius}px ${radius}px 0 0`;
      }

      // Fade heading in from 75 % → 100 % progress
      if (headingRef.current) {
        const headingOpacity = Math.max(0, Math.min(1, (progress - 0.75) / 0.25));
        headingRef.current.style.opacity = String(headingOpacity);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [seekTo]);

  return (
    <div id="scroll-sequence-section" ref={containerRef} style={{ height: '350vh' }} className="relative">
      {/* Hidden video element used as frame source */}
      <video
        ref={videoRef}
        src={SEQ_VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      />
      <div className="sticky top-0 h-screen bg-white overflow-hidden flex items-center justify-center">
        <div
          ref={frameWrapperRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: 'scale(0.88)',
            transformOrigin: 'bottom center',
            borderRadius: '144px 144px 0 0',
            ['cornerShape' as any]: 'squircle',
            willChange: 'transform, border-radius',
          }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div
          ref={headingRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6"
          style={{ opacity: 0 }}
        >
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 2px 32px rgba(0,0,0,0.6)',
            }}
          >
            Let&apos;s build the future today.
          </h2>
          <div className="mt-6 w-12 h-0.5 bg-accent rounded-full" />
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [videoReady, setVideoReady] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  // Listen for loading screen dismissal so Hero animation starts at the right time
  useEffect(() => {
    if ((window as any).__homeAssetsReady) { setLoadingDone(true); return; }
    const onDone = () => setLoadingDone(true);
    window.addEventListener('home-assets-ready', onDone, { once: true });
    return () => window.removeEventListener('home-assets-ready', onDone);
  }, []);

  // Track asset loading — report progress and dispatch event when all ready
  // 1 hero video + 1 seq video + 3 service videos = 5 total
  const TOTAL_ASSETS = 1 + 1 + SERVICE_VIDEOS.length;
  const loadedRef = useRef(0);
  const firedRef = useRef(false);
  // Reset on mount (handles Strict Mode remount and route re-entry)
  useEffect(() => {
    loadedRef.current = 0;
    firedRef.current = false;
    (window as any).__homeAssetsReady = false;
  }, []);
  const reportAssetLoaded = useCallback(() => {
    loadedRef.current++;
    const pct = Math.min(100, Math.round((loadedRef.current / TOTAL_ASSETS) * 100));
    window.dispatchEvent(new CustomEvent('home-assets-progress', { detail: pct }));
    if (!firedRef.current && loadedRef.current >= TOTAL_ASSETS) {
      firedRef.current = true;
      (window as any).__homeAssetsReady = true;
      window.dispatchEvent(new CustomEvent('home-assets-ready'));
    }
  }, [TOTAL_ASSETS]);

  useEffect(() => {
    document.title = 'Phitopolis | AI-First Engineering Solutions';
  }, []);

  // If the video is already cached/ready when the component mounts,
  // onCanPlay won't fire — so we check readyState immediately.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) {
      setVideoReady(true);
    }
  }, []);

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

  // Motion values for interactive spotlight (desktop)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Motion values for gyroscope parallax (mobile)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);
  const gyroX = useSpring(tiltX, { damping: 40, stiffness: 100 });
  const gyroY = useSpring(tiltY, { damping: 40, stiffness: 100 });

  // Device orientation listener for mobile parallax
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (!isTouchDevice) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0; // left/right tilt (-90 to 90)
      const beta = e.beta || 0;   // front/back tilt (-180 to 180)
      // Map to a subtle pixel offset (max ~15px)
      tiltX.set(gamma * 0.4);
      tiltY.set((beta - 45) * 0.3); // center around 45deg (typical holding angle)
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true } as any);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [tiltX, tiltY]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div className="space-y-0">
      {/* Hero Section (AI Day particle hero) */}
      <HeroWithRadius onReady={reportAssetLoaded} ready={loadingDone} />

      {/* "Brightest Minds" Quote */}
      <section className="relative bg-white pt-16 pb-4 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          <div className="w-10 h-0.5 bg-accent rounded-full mx-auto mb-4" />
          <blockquote
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 600,
              color: '#0A2A66',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            Work with the brightest minds, engineers and scientists who push the boundaries of what&apos;s possible to bring your most ambitious technology products to life.
          </blockquote>
          <div className="w-10 h-0.5 bg-accent rounded-full mx-auto mt-4" />
          <p className="mt-3 text-slate-400 text-sm tracking-widest uppercase font-medium">
            Phitopolis Built for what&apos;s next
          </p>
        </motion.div>
      </section>

      {/* Scroll-to-play sequence */}
      <ScrollSequenceSection onReady={reportAssetLoaded} />

      {/* === Video Stitches Section — commented out, may reuse on other section/page ===
      <section className="relative overflow-hidden bg-primary" style={{ height: '100vh' }}>
        <StitchedVideoBackground />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight max-w-3xl"
          >
            Making tomorrow's technology available today.
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 w-16 h-0.5 bg-accent origin-left"
          />
        </div>
      </section>
      === */}

      {/* === OLD HERO — commented out for potential restoration ===
      <section
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-primary group"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-primary">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.jpg"
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover mix-blend-screen scale-105 transition-opacity duration-1000 ${videoReady ? 'opacity-40' : 'opacity-0'}`}
          >
            <source src="/hi-tech_blue_digital_connectivity_abstract_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0">
            <motion.div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[160px] animate-bg-drift-1" style={{ x: gyroX, y: gyroY }} />
            <motion.div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-accent/10 rounded-full blur-[140px] animate-bg-drift-2" style={{ x: gyroX, y: gyroY }} />
            <motion.div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[180px] animate-bg-drift-3" style={{ x: gyroX, y: gyroY }} />
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
            Make tomorrow's technology with us!
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Founded by veterans in finance, we build the data systems of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticWrapper>
              <Link to="/careers" className="relative overflow-hidden px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold flex items-center group shadow-lg shadow-accent/30 transition-colors hover:scale-105 active:scale-95">
                <span className="shimmer-sweep" aria-hidden="true" />
                <span className="relative z-10 flex items-center">
                  Join the Team
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </MagneticWrapper>
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
      === END OLD HERO === */}

      {/* === Services Summary (card layout) — commented out, may reuse on other section/page ===
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {SERVICES.map((service, i) => (
              <HomeSvcCard key={i} service={service} i={i} />
            ))}
          </div>
        </div>
      </section>
      === */}

      {/* Sticky Services Alternative Layout */}
      <StickyServicesSection onReady={reportAssetLoaded} />

      {/* === Trust / Credentials Section — commented out, preserved for later use ===
      <section className="py-24 bg-primary relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem] xl:text-[24rem] 2xl:text-[28rem] font-display font-bold whitespace-nowrap select-none leading-none tracking-tight"
              style={{ WebkitTextStroke: '1px rgba(255,199,44,0.1)', WebkitTextFillColor: 'transparent' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              animate={{ WebkitTextStroke: ['1px rgba(255,199,44,0.05)', '2px rgba(255,199,44,0.15)', '1px rgba(255,199,44,0.05)'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >7 YEARS</motion.div>
            <motion.div
              className="text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem] xl:text-[24rem] 2xl:text-[28rem] font-display font-bold text-white/[0.03] whitespace-nowrap select-none leading-none tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }} animate={{ opacity: [0.03, 0.045, 0.03] }}
              style={{ textShadow: '0 0 80px rgba(255,199,44,0.05)' }}
            >7 YEARS</motion.div>
            <motion.div className="absolute w-full h-full"
              style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,199,44,0.03) 0%, transparent 70%)' }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden pb-4 sm:pb-6 md:pb-8">
            <motion.div className="text-[0.7rem] sm:text-[1rem] md:text-[1.5rem] lg:text-[2rem] xl:text-[2.5rem] 2xl:text-[3rem] font-display font-bold text-white/[0.04] whitespace-nowrap select-none uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em]"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            >Building Tomorrow's Technology</motion.div>
          </div>
          <motion.div className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,199,44,0.1) 0%, transparent 70%)', filter: 'blur(80px)', left: '-10%', top: '20%' }}
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div className="absolute w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)', right: '-5%', bottom: '10%' }}
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <PractitionersFloatingShapes />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
          />
        </div>
      </section>
      === */}

      {/* Innovation Hub */}
      <Showcase />

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
