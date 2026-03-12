
import React, { useRef, useState, useEffect } from 'react';
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView, useVelocity,
  useMotionValue, useSpring, useMotionValueEvent,
  useAnimationFrame, animate,
} from 'framer-motion';
import TextScramble from '../../components/TextScramble';
import MagneticWrapper from '../../components/MagneticWrapper';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base:    '#F0F2FA',   // cool off-white — subtle blue tint to harmonise with primary
  accent:  '#FFC72C',   // Phitopolis golden yellow
  charcoal:'#0A2A66',   // Phitopolis primary deep blue
  mid:     '#0E2F6E',   // slightly lighter deep blue for card surfaces
  muted:   '#6B7FA8',   // blue-tinted muted gray
};

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

// ── GRAIN OVERLAY — animated film grain texture ───────────────────────────────
const GrainOverlay = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (ref.current) {
        const x = Math.random() * 300;
        const y = Math.random() * 300;
        ref.current.style.backgroundPosition = `${x}px ${y}px`;
      }
      id = setTimeout(tick, 55);
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0, zIndex: 9996, pointerEvents: 'none',
        opacity: 0.048,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '400px 400px',
        mixBlendMode: 'overlay',
      }}
    />
  );
};

// ── PRELOADER — SVG morphing blob + iris reveal + percentage counter ───────────
const BLOB_A = 'M100,38 C126,10 168,12 186,46 C204,80 196,132 168,152 C140,172 60,172 32,152 C4,132 -4,80 14,46 C32,12 74,10 100,38 Z';
const BLOB_B = 'M100,30 C130,5 174,18 190,55 C206,92 192,146 158,162 C124,178 56,174 28,154 C0,134 2,85 20,52 C38,19 78,5 100,30 Z';
const BLOB_C = 'M100,42 C120,8 166,6 184,44 C202,82 196,136 166,154 C136,172 54,170 28,150 C2,130 6,80 24,46 C42,12 80,8 100,42 Z';

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'morph' | 'iris' | 'gone'>('morph');
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Count up 0 → 100 over 1800ms
    const start = Date.now();
    const duration = 1750;
    const timer = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
      setPct(p);
      if (p >= 100) clearInterval(timer);
    }, 28);
    const t1 = setTimeout(() => setPhase('iris'), 1900);
    const t2 = setTimeout(() => setPhase('gone'), 2600);
    const t3 = setTimeout(onComplete, 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(timer); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'gone' && (
        <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: C.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {/* Rotating rings */}
          <AnimatePresence>
            {phase === 'morph' && (
              <motion.div key="rings" exit={{ opacity: 0, transition: { duration: 0.25 } }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
              >
                {[300, 244, 188].map((sz, i) => (
                  <motion.div key={i}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 10 + i * 4, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `1px ${i === 0 ? 'dashed' : 'solid'} ${i === 0 ? 'rgba(255,199,44,0.35)' : 'rgba(255,199,44,0.12)'}` }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Iris blob */}
          <motion.div
            animate={{ scale: phase === 'iris' ? 22 : 1 }}
            transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}
          >
            <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <motion.path
                animate={{
                  d: phase === 'morph' ? [BLOB_A, BLOB_B, BLOB_C, BLOB_A] : BLOB_A,
                  // @ts-ignore
                  fill: phase === 'iris' ? C.charcoal : C.accent,
                }}
                transition={{
                  d: phase === 'morph' ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.05 },
                  fill: { duration: 0.6, ease: 'easeInOut' },
                }}
              />
            </svg>
            <AnimatePresence>
              {phase === 'morph' && (
                <motion.div key="logo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                  <img src="/phitopolis_logo_white.svg" alt="Phitopolis" style={{ height: 34, width: 'auto' }} />
                  <span style={{ color: '#fff', fontSize: 9, letterSpacing: '0.4em', fontWeight: 700, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase' }}>
                    AI Day 2026
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Percentage counter */}
          <AnimatePresence>
            {phase === 'morph' && (
              <motion.div key="pct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{ position: 'absolute', bottom: 48, right: 56, display: 'flex', alignItems: 'baseline', gap: 4 }}
              >
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '4rem', lineHeight: 1, color: C.base, letterSpacing: '-0.05em' }}>
                  {String(pct).padStart(2, '0')}
                </span>
                <span style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>%</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Year stamp */}
          <AnimatePresence>
            {phase === 'morph' && (
              <motion.div key="year" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{ position: 'absolute', bottom: 52, left: 56, color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}
              >
                Phitopolis © 2026
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── SCROLL PROGRESS BAR ───────────────────────────────────────────────────────
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: C.accent, transformOrigin: '0%', scaleX, zIndex: 200 }} />;
};

// ── CUSTOM CURSOR ─────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const mx = useMotionValue(-200), my = useMotionValue(-200);
  // Tight spring for the label only — snappy, not laggy
  const sx = useSpring(mx, { stiffness: 600, damping: 36 });
  const sy = useSpring(my, { stiffness: 600, damping: 36 });
  const [variant, setVariant] = useState<'default' | 'hover' | 'drag'>('default');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    const setHover = () => setVariant('hover');
    const setDefault = () => setVariant('default');
    const setDrag = () => setVariant('drag');
    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', setHover);
      el.addEventListener('mouseleave', setDefault);
    });
    document.querySelectorAll('[data-cursor="drag"]').forEach(el => {
      el.addEventListener('mouseenter', setDrag);
      el.addEventListener('mouseleave', setDefault);
    });
    return () => window.removeEventListener('mousemove', onMove);
  }, [isMobile, mx, my]);

  if (isMobile) return null;

  return (
    <>
      {/* Main dot — instant tracking, no delay */}
      <motion.div
        animate={{
          width:   variant === 'hover' ? 14 : 7,
          height:  variant === 'hover' ? 14 : 7,
          opacity: variant === 'drag'  ? 0  : 1,
          background: variant === 'hover' ? C.charcoal : C.accent,
        }}
        transition={{ duration: 0.12 }}
        style={{ position: 'fixed', left: mx, top: my, x: '-50%', y: '-50%', borderRadius: '50%', zIndex: 10000, pointerEvents: 'none' }}
      />
      {/* Scroll label — only in drag zones, snappy spring follow */}
      <AnimatePresence>
        {variant === 'drag' && (
          <motion.div
            key="drag-label"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', left: sx, top: sy, x: '-50%', y: '-50%',
              zIndex: 10000, pointerEvents: 'none',
              background: C.accent, color: C.charcoal,
              fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '7px 14px', borderRadius: 20,
            }}
          >
            scroll →
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── FLOATING SECTION NAV ──────────────────────────────────────────────────────
const FLOAT_SECTIONS = [
  { id: 'sec-hero',      label: 'Intro' },
  { id: 'sec-statement', label: 'Statement' },
  { id: 'sec-vision',    label: 'Vision' },
  { id: 'sec-expertise',  label: 'Expertise' },
  { id: 'sec-techstack',  label: 'Tech Stack' },
  { id: 'sec-stats',      label: 'Impact' },
  { id: 'sec-process',   label: 'Process' },
  { id: 'sec-people',    label: 'People' },
  { id: 'sec-showcase',  label: 'Projects' },
];

const FloatNav = () => {
  const [active, setActive] = useState('sec-hero');
  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight * 0.45;
      let cur = FLOAT_SECTIONS[0].id;
      for (const s of FLOAT_SECTIONS) { const el = document.getElementById(s.id); if (el && el.offsetTop <= mid) cur = s.id; }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);
  if (isMobile) return null;
  return (
    <div style={{ position: 'fixed', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {FLOAT_SECTIONS.map(s => (
        <motion.button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
          whileHover={{ scale: 1.6 }} title={s.label}
          style={{ width: active === s.id ? 10 : 6, height: active === s.id ? 10 : 6, borderRadius: '50%', background: active === s.id ? C.accent : 'rgba(255,199,44,0.28)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
        />
      ))}
    </div>
  );
};

// ── SECTION BADGE ─────────────────────────────────────────────────────────────
const Badge = ({ n, label }: { n: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
    <span style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em' }}>{n}</span>
    <div style={{ width: 36, height: 1, background: C.accent }} />
    <span style={{ color: C.muted, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{label}</span>
  </div>
);

// ── SECTION TAG — dev reference label top-left of each section ───────────────
const SectionTag = ({ name, dark }: { name: string; dark?: boolean }) => (
  <div style={{
    position: 'absolute', top: 12, left: 12, zIndex: 999,
    background: dark ? 'rgba(10,42,102,0.18)' : 'rgba(255,199,44,0.15)',
    border: dark ? '1px solid rgba(10,42,102,0.5)' : '1px solid rgba(255,199,44,0.5)',
    backdropFilter: 'blur(8px)',
    borderRadius: 4, padding: '3px 8px',
    fontFamily: 'Inter, monospace', fontSize: 10, fontWeight: 600,
    color: dark ? C.charcoal : '#FFC72C', letterSpacing: '0.12em', textTransform: 'uppercase',
    pointerEvents: 'none', userSelect: 'none',
  }}>
    {name}
  </div>
);

// ── ANIMATED DIVIDER LINE ─────────────────────────────────────────────────────
const Divider = ({ inView, delay = 0, color = 'rgba(255,255,255,0.1)' }: { inView: boolean; delay?: number; color?: string }) => (
  <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
    transition={{ duration: 1, delay, ease: [0.76, 0, 0.24, 1] }}
    style={{ height: 1, background: color, transformOrigin: 'left', marginBottom: 40 }}
  />
);

// ── SPLIT-WORD HEADING REVEAL ─────────────────────────────────────────────────
const SplitText = ({ text, style, inView, delay = 0 }: { text: string; style?: React.CSSProperties; inView: boolean; delay?: number }) => (
  <span style={{ display: 'block', ...style }}>
    {text.split(' ').map((word, i) => (
      <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.26em', verticalAlign: 'bottom' }}>
        <motion.span style={{ display: 'inline-block' }}
          initial={{ y: '115%', opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.72, delay: delay + i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {word}
        </motion.span>
      </span>
    ))}
  </span>
);

// ── OUTLINE + SOLID SECTION HEADING ──────────────────────────────────────────
const SplitHeading = ({
  outline, solid, inView, color, fontSize = 'clamp(2.8rem, 5vw, 5rem)', delay = 0,
}: { outline: string; solid: string; inView: boolean; color: string; fontSize?: string; delay?: number }) => (
  <div style={{ overflow: 'hidden' }}>
    <motion.div
      initial={{ y: '110%' }} animate={inView ? { y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ display: 'flex', alignItems: 'baseline', gap: '0.22em', flexWrap: 'wrap' }}
    >
      <span style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize,
        letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'lowercase',
        WebkitTextStroke: `2px ${color}`, WebkitTextFillColor: 'transparent', display: 'inline-block',
      }}>{outline}</span>
      <span style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize,
        letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'lowercase',
        color, display: 'inline-block',
      }}>{solid}</span>
    </motion.div>
  </div>
);

// ── CANVAS PARTICLE NETWORK ───────────────────────────────────────────────────
const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf: number;
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const init = () => { pts = Array.from({ length: 72 }, () => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 1.4 + 0.6 })); };
    const resize = () => { const dpr = window.devicePixelRatio || 1; canvas.width = W() * dpr; canvas.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); init(); };
    const tick = () => {
      const w = W(), h = H(); ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 0) { const d = Math.sqrt(d2), f = (130 - d) / 130; p.vx += (dx / d) * f * 0.85; p.vy += (dy / d) * f * 0.85; }
        p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(255,199,44,${(1 - Math.sqrt(d2) / 120) * 0.22})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      }
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,199,44,0.5)'; ctx.fill(); }
      raf = requestAnimationFrame(tick);
    };
    const onMouse = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    resize(); tick();
    window.addEventListener('resize', resize); canvas.addEventListener('mousemove', onMouse);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMouse); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

// ── SVG ORGANIC MORPH MASK ────────────────────────────────────────────────────
const ORG_SMALL = 'M200,80 C235,50 285,55 305,100 C325,145 310,200 275,220 C240,240 160,240 125,220 C90,200 75,145 95,100 C115,55 165,50 200,80 Z';
const ORG_LARGE = 'M200,-50 C295,-95 420,-70 455,85 C490,240 465,340 350,365 C235,390 -35,390 -90,360 C-145,330 -115,230 -75,75 C-35,-80 105,-95 200,-50 Z';

const OrgMorphReveal = ({ src, alt }: { src: string; alt: string }) => {
  const [uid] = useState<string>(() => `omr-${Math.random().toString(36).slice(2, 8)}`);
  const divRef = useRef<HTMLDivElement>(null);
  const inView = useInView(divRef, { once: true, margin: '-80px' });
  return (
    <div ref={divRef} style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs><clipPath id={uid}><motion.path initial={{ d: ORG_SMALL }} animate={{ d: inView ? ORG_LARGE : ORG_SMALL }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }} /></clipPath></defs>
        <image href={src} x="0" y="0" width="400" height="300" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid})`} />
      </svg>
    </div>
  );
};

// ── VELOCITY-RESPONSIVE MARQUEE ───────────────────────────────────────────────
const MARQUEE_ROW1 = ['Machine Learning', 'LLM Orchestration', 'Data Infrastructure', 'Computer Vision', 'RAG Systems', 'FinTech', 'Real-Time Analytics', 'Neural Networks'];
const MARQUEE_ROW2 = ['Quantitative Finance', 'Agentic AI', 'Human-in-the-Loop', 'MLOps', 'Vector Databases', 'Edge Computing', 'Transformer Models', 'Stream Processing'];

const MarqueeTrack = ({ items, basePPS = 90, reverse = false }: { items: string[]; basePPS?: number; reverse?: boolean }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const xPos = useRef(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothV = useSpring(velocity, { damping: 40, stiffness: 300 });
  const text = items.map(t => `${t}   ·   `).join('');

  useAnimationFrame((_, delta) => {
    if (!trackRef.current) return;
    const v = Math.abs(smoothV.get());
    const speedMult = 1 + v / 600;
    const pxPerFrame = (basePPS * speedMult * delta / 1000) * (reverse ? -1 : 1);
    xPos.current += pxPerFrame;
    const half = trackRef.current.scrollWidth / 2;
    if (xPos.current > half) xPos.current -= half;
    if (xPos.current < 0) xPos.current += half;
    trackRef.current.style.transform = `translateX(-${xPos.current}px)`;
  });

  return (
    <div style={{ overflow: 'hidden' }}>
      <div ref={trackRef} style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
        <span style={{ flexShrink: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', letterSpacing: '0.05em', color: C.charcoal, textTransform: 'uppercase' }}>{text}</span>
        <span style={{ flexShrink: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', letterSpacing: '0.05em', color: C.charcoal, textTransform: 'uppercase' }}>{text}</span>
      </div>
    </div>
  );
};

const MarqueeSection = () => (
  <div style={{ background: C.accent, padding: '20px 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
    <SectionTag name="marquee" dark />
    <div style={{ height: 24 }} />
    <MarqueeTrack items={MARQUEE_ROW1} basePPS={85} />
    <MarqueeTrack items={MARQUEE_ROW2} basePPS={70} reverse />
  </div>
);

// ── TECH STACK MARQUEE ────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  ai:    '#FFC72C',
  dev:   '#A78BFA',
  infra: '#60A5FA',
  data:  '#34D399',
};

// Simple Icons slugs — https://simpleicons.org
const SI: Record<string, string> = {
  'OpenAI':            'openai',
  'Anthropic Claude':  'anthropic',
  'LangChain':         'langchain',
  'LlamaIndex':        'llamaindex',
  'Hugging Face':      'huggingface',
  'PyTorch':           'pytorch',
  'TensorFlow':        'tensorflow',
  'Ollama':            'ollama',
  'CrewAI':            'crewai',
  'DALL·E':            'openai',
  'Whisper':           'openai',
  'Stable Diffusion':  'stablediffusion',
  'MLflow':            'mlflow',
  'Weights & Biases':  'weightsandbiases',
  'Pinecone':          'pinecone',
  'Weaviate':          'weaviate',
  'Qdrant':            'qdrant',
  'scikit-learn':      'scikitlearn',
  'Python':            'python',
  'FastAPI':           'fastapi',
  'Node.js':           'nodedotjs',
  'React':             'react',
  'TypeScript':        'typescript',
  'Next.js':           'nextdotjs',
  'GraphQL':           'graphql',
  'Celery':            'celery',
  'Docker':            'docker',
  'Kubernetes':        'kubernetes',
  'Terraform':         'terraform',
  'AWS':               'amazonaws',
  'Azure':             'microsoftazure',
  'GCP':               'googlecloud',
  'Nginx':             'nginx',
  'Prometheus':        'prometheus',
  'Grafana':           'grafana',
  'PostgreSQL':        'postgresql',
  'Redis':             'redis',
  'MongoDB':           'mongodb',
  'Kafka':             'apachekafka',
  'Snowflake':         'snowflake',
  'Apache Spark':      'apachespark',
  'dbt':               'dbt',
  'Airflow':           'apacheairflow',
};

const TECH_ROW1 = [
  { name: 'OpenAI', cat: 'ai' }, { name: 'Anthropic Claude', cat: 'ai' },
  { name: 'LangChain', cat: 'ai' }, { name: 'LlamaIndex', cat: 'ai' },
  { name: 'Hugging Face', cat: 'ai' }, { name: 'PyTorch', cat: 'ai' },
  { name: 'TensorFlow', cat: 'ai' }, { name: 'Ollama', cat: 'ai' },
  { name: 'CrewAI', cat: 'ai' }, { name: 'DALL·E', cat: 'ai' },
  { name: 'Whisper', cat: 'ai' }, { name: 'Stable Diffusion', cat: 'ai' },
  { name: 'MLflow', cat: 'ai' }, { name: 'Weights & Biases', cat: 'ai' },
];

const TECH_ROW2 = [
  { name: 'Python', cat: 'dev' }, { name: 'FastAPI', cat: 'dev' },
  { name: 'Node.js', cat: 'dev' }, { name: 'React', cat: 'dev' },
  { name: 'TypeScript', cat: 'dev' }, { name: 'Next.js', cat: 'dev' },
  { name: 'GraphQL', cat: 'dev' }, { name: 'Celery', cat: 'dev' },
  { name: 'Docker', cat: 'infra' }, { name: 'Kubernetes', cat: 'infra' },
  { name: 'Terraform', cat: 'infra' }, { name: 'AWS', cat: 'infra' },
  { name: 'Azure', cat: 'infra' }, { name: 'GCP', cat: 'infra' },
  { name: 'Nginx', cat: 'infra' }, { name: 'Prometheus', cat: 'infra' },
];

const TECH_ROW3 = [
  { name: 'Pinecone', cat: 'ai' }, { name: 'Weaviate', cat: 'ai' },
  { name: 'Qdrant', cat: 'ai' }, { name: 'scikit-learn', cat: 'ai' },
  { name: 'Grafana', cat: 'infra' }, { name: 'PostgreSQL', cat: 'data' },
  { name: 'Redis', cat: 'data' }, { name: 'MongoDB', cat: 'data' },
  { name: 'Kafka', cat: 'data' }, { name: 'Snowflake', cat: 'data' },
  { name: 'Apache Spark', cat: 'data' }, { name: 'dbt', cat: 'data' },
  { name: 'Airflow', cat: 'data' },
];

// Individual item — flat logo + text, no pill container
const TechPill = React.memo(({ tech }: { tech: { name: string; cat: string } }) => {
  const slug = SI[tech.name];
  const [imgOk, setImgOk] = useState(true);
  const showLogo = slug && imgOk;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, flexShrink: 0, padding: '0 48px' }}>
      {showLogo ? (
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={tech.name}
          width={52} height={52}
          style={{ flexShrink: 0, objectFit: 'contain', opacity: 0.85 }}
          onError={() => setImgOk(false)}
        />
      ) : (
        <div style={{
          width: 52, height: 52, borderRadius: 10, flexShrink: 0,
          background: CAT_COLORS[tech.cat],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
            {tech.name[0]}
          </span>
        </div>
      )}
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 28, color: C.charcoal, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
        {tech.name}
      </span>
    </div>
  );
});

const TechMarqueeTrack = ({ items, basePPS = 55, reverse = false }: { items: { name: string; cat: string }[]; basePPS?: number; reverse?: boolean }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const xPos = useRef(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothV = useSpring(velocity, { damping: 40, stiffness: 300 });
  const doubled = [...items, ...items];

  useAnimationFrame((_, delta) => {
    if (!trackRef.current) return;
    const v = Math.abs(smoothV.get());
    const speedMult = 1 + v / 800;
    const pxPerFrame = (basePPS * speedMult * delta / 1000) * (reverse ? -1 : 1);
    xPos.current += pxPerFrame;
    const half = trackRef.current.scrollWidth / 2;
    if (xPos.current > half) xPos.current -= half;
    if (xPos.current < 0) xPos.current += half;
    trackRef.current.style.transform = `translateX(-${xPos.current}px)`;
  });

  return (
    <div style={{ overflow: 'hidden' }}>
      <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', gap: 10, willChange: 'transform', paddingRight: 10 }}>
        {doubled.map((tech, i) => <TechPill key={i} tech={tech} />)}
      </div>
    </div>
  );
};

const TechStack = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section id="sec-techstack" ref={ref} style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <SectionTag name="tech stack" />
      {/* Section header */}
      <div style={{ paddingLeft: 40, paddingRight: 40, marginBottom: 64 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Divider inView={inView} color="rgba(0,0,0,0.1)" />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <Badge n="03" label="Tech Stack" />
              <SplitHeading outline="powered" solid="by" inView={inView} color={C.charcoal} />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45, duration: 0.65 }}
              style={{ color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 320, paddingBottom: 6 }}
            >
              the full arsenal — from model training and orchestration to deployment, data pipelines, and cloud infrastructure.
            </motion.p>
          </div>
          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 36, flexWrap: 'wrap' }}
          >
            {Object.entries({ 'AI / ML': 'ai', 'Languages & Frameworks': 'dev', 'Cloud & Infra': 'infra', 'Data & Storage': 'data' }).map(([label, cat]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_COLORS[cat] }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Three scrolling rows — full bleed, no horizontal padding */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <TechMarqueeTrack items={TECH_ROW1} basePPS={28} />
        <TechMarqueeTrack items={TECH_ROW2} basePPS={22} reverse />
        <TechMarqueeTrack items={TECH_ROW3} basePPS={34} />
      </div>
    </section>
  );
};

// ── ANIMATED STAT COUNT-UP ────────────────────────────────────────────────────
const AnimatedStat = ({ end, suffix = '', decimals = 0, label, sub }: { end: number; suffix?: string; decimals?: number; label: string; sub: string }) => {
  const count = useMotionValue(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, end, { duration: 2.4, ease: [0.21, 0.47, 0.32, 0.98], onUpdate: (v) => setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()) });
    return () => ctrl.stop();
  }, [inView, end, count, decimals]);
  return (
    <div ref={ref}>
      <Divider inView={inView} color="rgba(255,255,255,0.1)" />
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', lineHeight: 1, letterSpacing: '-0.04em', color: C.accent }}>
        {display}{suffix}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: C.base, marginTop: 10, textTransform: 'lowercase', letterSpacing: '-0.01em' }}>{label}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>{sub}</div>
    </div>
  );
};

const Stats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const isMobile = useIsMobile();
  return (
    <section id="sec-stats" ref={ref} style={{ background: C.charcoal, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="stats" />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 80 }}>
          <Badge n="04" label="Proven Impact" />
          <SplitHeading outline="results" solid="that speak" inView={inView} color={C.base} />
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 44 : 64 }}>
          <AnimatedStat end={100} suffix="x" label="latency improvement" sub="HFT pipeline · 2ms → 18μs" />
          <AnimatedStat end={8} suffix="x" label="analyst throughput" sub="AI research synthesis" />
          <AnimatedStat end={99.4} decimals={1} suffix="%" label="detection accuracy" sub="Computer vision QA" />
          <AnimatedStat end={10} suffix="M+" label="documents indexed" sub="RAG enterprise knowledge base" />
        </div>
      </div>
    </section>
  );
};

// ── HERO — massive mixed outline + fill typography ────────────────────────────
const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section id="sec-hero" ref={containerRef} style={{ minHeight: '100vh', background: C.charcoal, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(60px,8vw,100px) 40px clamp(64px,9vw,100px)', position: 'relative', overflow: 'hidden' }}>
      <SectionTag name="hero" />
      <motion.div style={{ position: 'absolute', inset: 0, y: bgY }}>
        <CanvasBackground />
      </motion.div>

      {/* Glow */}
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}10 0%, transparent 70%)`, top: '-15%', right: '-10%', filter: 'blur(100px)', pointerEvents: 'none' }}
      />

      {/* Top-left label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
        style={{ position: 'absolute', top: 44, left: 44, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase' }}
      >
        ai day — 2026
      </motion.div>

      {/* Top-right label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        style={{ position: 'absolute', top: 44, right: 44, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase' }}
      >
        phitopolis
      </motion.div>

      {/* HERO TYPOGRAPHY — mixed stroke + fill */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Line 1: OUTLINE text — "future" */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: '110%' }} animate={{ y: 0 }}
            transition={{ delay: 0.15, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(5rem, 18vw, 16rem)', lineHeight: 0.88,
              letterSpacing: '-0.045em', textTransform: 'lowercase',
              WebkitTextStroke: `2px ${C.base}`,
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}
          >
            future
          </motion.div>
        </div>

        {/* Line 2: SOLID text — "proofing" */}
        <div style={{ overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
          <motion.div
            initial={{ y: '110%' }} animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(5rem, 18vw, 16rem)', lineHeight: 0.88,
              letterSpacing: '-0.045em', textTransform: 'lowercase',
              color: C.base, display: 'block',
            }}
          >
            proofing
          </motion.div>
        </div>

        {/* Line 3: MIXED — "with" (outline) + "ai" (accent solid) */}
        <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'baseline', gap: '0.18em' }}>
          <motion.span
            initial={{ y: '110%' }} animate={{ y: 0 }}
            transition={{ delay: 0.45, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(5rem, 18vw, 16rem)', lineHeight: 0.88,
              letterSpacing: '-0.045em', textTransform: 'lowercase',
              WebkitTextStroke: `2px ${C.base}`,
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            with
          </motion.span>
          <motion.span
            initial={{ y: '110%' }} animate={{ y: 0 }}
            transition={{ delay: 0.52, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(5rem, 18vw, 16rem)', lineHeight: 0.88,
              letterSpacing: '-0.045em', textTransform: 'lowercase',
              color: C.accent, display: 'inline-block',
            }}
          >
            ai
          </motion.span>
        </div>

        {/* Sub-row: tagline + scroll cue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48 }}
        >
          <p style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.85rem, 1.2vw, 1rem)', maxWidth: 380, lineHeight: 1.8, textTransform: 'lowercase' }}>
            redefining what's possible at the intersection of human ingenuity and artificial intelligence.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>scroll</span>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
              <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, ${C.accent}, transparent)` }} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── FULL-BLEED STATEMENT ──────────────────────────────────────────────────────
const Statement = () => {
  const ref = useRef(null);
  const sRef = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const { scrollYProgress } = useScroll({ target: sRef, offset: ['start end', 'end start'] });
  const blobY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const textY  = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="sec-statement" ref={sRef} style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="statement" />
      {/* Parallax background blob */}
      <motion.div style={{ position: 'absolute', left: '-8%', top: '10%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}16 0%, transparent 70%)`, filter: 'blur(70px)', y: blobY, pointerEvents: 'none' }} />
      <motion.div style={{ position: 'absolute', right: '-4%', bottom: '8%', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}10 0%, transparent 70%)`, filter: 'blur(60px)', y: blobY, pointerEvents: 'none' }} />

      <motion.div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', y: textY }}>
        {/* Section label */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}
        >
          <div style={{ width: 40, height: 1, background: C.accent }} />
          <span style={{ color: C.muted, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>manifesto</span>
        </motion.div>

        <SplitHeading outline="ai is not" solid="the future." inView={inView} color={C.charcoal} fontSize="clamp(3.2rem, 8.5vw, 9rem)" />
        <div style={{ marginTop: '0.1em' }}>
          <SplitHeading outline="it's" solid="the present." inView={inView} color={C.accent} fontSize="clamp(3.2rem, 8.5vw, 9rem)" delay={0.28} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 48px', marginTop: 64, alignItems: 'start' }}>
          <motion.div initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}} transition={{ duration: 0.8, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
            style={{ width: 1, height: 80, background: C.accent, transformOrigin: 'top', marginTop: 4 }}
          />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.7 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1rem, 1.4vw, 1.15rem)', color: '#777', lineHeight: 1.9, maxWidth: 540 }}
          >
            we built phitopolis to close the gap between research and production — because the teams that move fastest win.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
};

// ── 01 VISION ─────────────────────────────────────────────────────────────────
const Vision = () => {
  const ref = useRef(null);
  const sRef = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="sec-vision" ref={sRef} style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="vision" />
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Divider inView={inView} color={`rgba(0,0,0,0.1)`} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 64 : 100, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, ease: [0.21, 1.02, 0.47, 0.98] }}>
            <Badge n="01" label="The Vision" />
            <div style={{ marginBottom: 36 }}>
              <SplitHeading outline="engineering for" solid="the agentic ai era" inView={inView} color={C.charcoal} fontSize="clamp(2.8rem, 5.5vw, 5rem)" />
            </div>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.7 }}
              style={{ color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', lineHeight: 1.9, marginBottom: 24, textTransform: 'lowercase' }}
            >
              we're not just building software — we're architecting the foundations of intelligent, autonomous systems that learn, adapt, and evolve.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.65, duration: 0.7 }}
              style={{ color: '#888', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.85 }}
            >
              in a world where AI agents collaborate with humans in real-time, Phitopolis stands at the frontier — turning cutting-edge research into production-grade solutions.
            </motion.p>
          </motion.div>

          {/* Parallax image */}
          <motion.div style={{ y: imgY }}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.2, ease: [0.21, 1.02, 0.47, 0.98] }}>
              <OrgMorphReveal src="https://phitopolis.com/img/core-competencies/innovation.jpg" alt="Phitopolis AI Innovation" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── 02 EXPERTISE ──────────────────────────────────────────────────────────────
const EXPERTISE = [
  { title: 'Data Science', icon: '◈', color: C.accent, img: 'https://phitopolis.com/img/core-competencies/technical-excellence.jpg', desc: 'from raw data to actionable intelligence. we build end-to-end ml pipelines, statistical models, and real-time analytics systems that turn complexity into competitive advantage.' },
  { title: 'Full-Stack AI', icon: '⬡', color: '#6C63FF', img: 'https://phitopolis.com/img/core-competencies/proactive-communication.jpg', desc: 'seamlessly integrating models into production-grade apps. from LLM orchestration to agentic workflows — we bridge research and deployment with precision.' },
];

const ExpertiseCard = ({ card, index, inView }: { card: typeof EXPERTISE[0]; index: number; inView: boolean }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.85, delay: index * 0.15, ease: [0.21, 1.02, 0.47, 0.98] }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${hovered ? card.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 56, overflow: 'hidden', transition: 'border-color 0.3s' }}
    >
      <div style={{ height: 270, overflow: 'hidden', position: 'relative' }}>
        <motion.img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} animate={{ scale: hovered ? 1.07 : 1 }} transition={{ duration: 0.55 }} />
        {/* Hover overlay */}
        <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, ${card.color}44)` }}
        />
      </div>
      <div style={{ padding: '44px 52px 60px' }}>
        <div style={{ color: card.color, fontSize: 22, marginBottom: 14 }}>{card.icon}</div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.1rem', color: C.base, marginBottom: 18, letterSpacing: '-0.02em' }}>{card.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', fontSize: '0.93rem', lineHeight: 1.85 }}>{card.desc}</p>
      </div>
    </motion.div>
  );
};

const Expertise = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section id="sec-expertise" ref={ref} style={{ background: C.charcoal, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="expertise" />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Divider inView={inView} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 72 }}>
          <Badge n="02" label="Core Expertise" />
          <SplitHeading outline="what we" solid="do best" inView={inView} color={C.base} />
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 36 }}>
          {EXPERTISE.map((card, i) => <ExpertiseCard key={i} card={card} index={i} inView={inView} />)}
        </div>
      </div>
    </section>
  );
};

// ── 05 PROCESS + SERVICE WHEEL ────────────────────────────────────────────────
const WHEEL = [
  { label: 'Machine Learning', desc: 'supervised, unsupervised, and reinforcement learning tailored for financial and enterprise contexts.', angleDeg: -90 },
  { label: 'Data Infrastructure', desc: 'scalable pipelines, real-time streaming, and warehouse architecture built for speed at scale.', angleDeg: 30 },
  { label: 'Human-AI Synergy', desc: 'human-in-the-loop workflows that keep domain experts at the center of every AI decision.', angleDeg: 150 },
];

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const wheelRot = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const R = 152;
  return (
    <section id="sec-process" ref={containerRef} style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="process" />
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Divider inView={inView} color="rgba(0,0,0,0.1)" />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 72 : 100, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -36 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9 }}>
            <Badge n="05" label="The Process" />
            <div style={{ marginBottom: 44 }}>
              <SplitHeading outline="human-in-the-loop" solid="R&D" inView={inView} color={C.charcoal} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WHEEL.map((item, i) => (
                <motion.button key={i} onClick={() => setActive(i)} whileHover={{ x: 6 }}
                  style={{ textAlign: 'left', padding: '22px 28px', borderRadius: 24, cursor: 'pointer', border: `2px solid ${active === i ? C.accent : 'transparent'}`, background: active === i ? `${C.accent}10` : 'transparent', transition: 'border-color 0.25s, background 0.25s' }}
                >
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: active === i ? C.accent : C.charcoal, marginBottom: active === i ? 8 : 0, transition: 'color 0.25s', textTransform: 'lowercase' }}>{item.label}</div>
                  <AnimatePresence>
                    {active === i && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ color: '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', lineHeight: 1.75, margin: 0, overflow: 'hidden' }}
                      >{item.desc}</motion.p>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </motion.div>
          {!isMobile && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.9, delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ position: 'relative', width: 390, height: 390 }}>
                <motion.svg viewBox="0 0 390 390" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', rotate: wheelRot }}>
                  <circle cx="195" cy="195" r="180" fill="none" stroke={`${C.accent}18`} strokeWidth="1" />
                  <circle cx="195" cy="195" r="180" fill="none" stroke={C.accent} strokeWidth="1.2" strokeDasharray="18 13" />
                </motion.svg>
                <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: C.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/phitopolis_logo_white.svg" alt="Phitopolis" style={{ height: 28, width: 'auto' }} />
                </div>
                {WHEEL.map((item, i) => {
                  const rad = (item.angleDeg * Math.PI) / 180;
                  const cx = 195 + R * Math.cos(rad), cy = 195 + R * Math.sin(rad), innerR = 64;
                  return (
                    <React.Fragment key={i}>
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 390 390">
                        <line x1={195 + innerR * Math.cos(rad)} y1={195 + innerR * Math.sin(rad)} x2={cx - 22 * Math.cos(rad)} y2={cy - 22 * Math.sin(rad)}
                          stroke={active === i ? C.accent : `${C.accent}30`} strokeWidth={active === i ? 1.5 : 1} strokeDasharray={active === i ? undefined : '4 4'} style={{ transition: 'all 0.3s' }}
                        />
                      </svg>
                      <motion.button onClick={() => setActive(i)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} title={item.label}
                        style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', width: 48, height: 48, borderRadius: '50%', background: active === i ? C.accent : `${C.accent}18`, border: `2px solid ${C.accent}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
                      >
                        <span style={{ color: active === i ? C.charcoal : C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 12 }}>{String(i + 1).padStart(2, '0')}</span>
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

// ── 06 HORIZONTAL SHOWCASE ────────────────────────────────────────────────────
const CARDS = [
  { label: 'LLM Orchestration Engine', tag: 'Generative AI', desc: 'a production-grade multi-agent framework that routes complex tasks across specialized AI models with sub-second latency.', color: '#FFC72C' },
  { label: 'Real-Time Risk Dashboard', tag: 'FinTech', desc: 'live risk visualization for institutional portfolios, processing 1M+ events/sec with intelligent anomaly detection.', color: '#4A90D9' },
  { label: 'Predictive Analytics Platform', tag: 'Data Science', desc: 'end-to-end ML pipeline for customer churn prediction, driving 40% reduction in attrition for enterprise clients.', color: '#6C63FF' },
  { label: 'Agentic Research Assistant', tag: 'AI Agents', desc: 'autonomous research agent that synthesizes market intelligence from 500+ sources with human-in-the-loop validation.', color: '#2ECC71' },
  { label: 'Automated Trading Signal System', tag: 'Quantitative Finance', desc: 'ML-driven alpha signal generator processing tick-level market data, delivering sub-millisecond trade recommendations.', color: '#E91E8C' },
  { label: 'RAG Knowledge Base', tag: 'Enterprise AI', desc: 'retrieval-augmented generation system indexing 10M+ internal documents, enabling natural language querying across an entire organization.', color: '#F59E0B' },
  { label: 'Computer Vision QA Pipeline', tag: 'Vision AI', desc: 'real-time defect detection system trained on manufacturing imagery, achieving 99.4% accuracy and reducing inspection costs by 60%.', color: '#06B6D4' },
  { label: 'AI-Powered Compliance Monitor', tag: 'RegTech', desc: 'NLP-based regulatory compliance engine that continuously scans communications and flags violations before they become liabilities.', color: '#A78BFA' },
];
const CARD_W = 480;

const ShowCard = ({ card, index, fullWidth = false }: { card: typeof CARDS[0]; index: number; fullWidth?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const rxS = useSpring(rx, { stiffness: 280, damping: 22 });
  const ryS = useSpring(ry, { stiffness: 280, damping: 22 });
  const onMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); setHovered(false); };
  return (
    <div style={{ width: fullWidth ? '100%' : CARD_W, flexShrink: 0, perspective: 1000 }}>
      <motion.div ref={cardRef} onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={onLeave}
        style={{ rotateX: rxS, rotateY: ryS, background: C.mid, borderRadius: 56, padding: '52px 44px', height: fullWidth ? 'auto' : 470, minHeight: fullWidth ? 300 : undefined, display: 'flex', flexDirection: 'column', border: `1px solid ${hovered ? card.color : 'rgba(255,255,255,0.06)'}`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
      >
        <motion.div style={{ position: 'absolute', top: -20, right: -20, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${card.color}25 0%, transparent 70%)`, filter: 'blur(40px)' }}
          animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 1 : 0.3 }} transition={{ duration: 0.45 }}
        />
        <div style={{ position: 'absolute', top: 28, right: 36, color: `${card.color}18`, fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '6rem', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, background: `${card.color}20`, color: card.color, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 22, fontFamily: 'Inter, sans-serif' }}>{card.tag}</span>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: C.base, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.015em' }}>{card.label}</h3>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.85 }}>{card.desc}</p>
        </div>
      </motion.div>
    </div>
  );
};

// ── OUR PEOPLE ────────────────────────────────────────────────────────────────
const DEPT_COLORS: Record<string, string> = {
  AI:      '#FFC72C',
  Data:    '#34D399',
  Eng:     '#A78BFA',
  Infra:   '#60A5FA',
  Arch:    '#F59E0B',
  Product: '#F472B6',
  Design:  '#4ADE80',
};

const PEOPLE = [
  { id: '01', role: 'AI / ML Engineer',      dept: 'AI',      desc: 'Trains, fine-tunes and deploys production ML models end-to-end',           skills: ['PyTorch', 'LangChain', 'MLflow'] },
  { id: '02', role: 'Research Scientist',     dept: 'AI',      desc: 'Pushes the frontier of applied AI — model architecture and novel methods',  skills: ['Transformers', 'CUDA', 'W&B'] },
  { id: '03', role: 'Data Scientist',         dept: 'Data',    desc: 'Extracts strategic signals from complex, high-volume datasets',             skills: ['Python', 'SQL', 'Spark'] },
  { id: '04', role: 'Data Engineer',          dept: 'Data',    desc: 'Architects the reliable data infrastructure everything runs on',            skills: ['Airflow', 'dbt', 'Kafka'] },
  { id: '05', role: 'Backend Engineer',       dept: 'Eng',     desc: 'Designs fast, resilient APIs and distributed services at scale',            skills: ['FastAPI', 'Redis', 'PostgreSQL'] },
  { id: '06', role: 'Frontend Engineer',      dept: 'Eng',     desc: 'Crafts high-performance, animated and accessible web interfaces',           skills: ['React', 'TypeScript', 'CSS'] },
  { id: '07', role: 'DevOps Engineer',        dept: 'Infra',   desc: 'Keeps cloud infrastructure secure, reliable and infinitely scalable',       skills: ['Kubernetes', 'Terraform', 'AWS'] },
  { id: '08', role: 'Solutions Architect',    dept: 'Arch',    desc: 'Designs end-to-end system blueprints aligned to business goals',            skills: ['System Design', 'AWS', 'APIs'] },
  { id: '09', role: 'Security Engineer',      dept: 'Infra',   desc: 'Hardens every layer of the stack against evolving threats',                 skills: ['IAM', 'SAST', 'Zero Trust'] },
  { id: '10', role: 'Product Manager',        dept: 'Product', desc: 'Bridges technical vision with real user needs and measurable impact',       skills: ['Roadmapping', 'OKRs', 'Discovery'] },
  { id: '11', role: 'UX Designer',            dept: 'Design',  desc: 'Makes complex AI-powered systems feel human and effortless to use',         skills: ['Figma', 'Prototyping', 'Research'] },
  { id: '12', role: 'Technical Lead',         dept: 'Eng',     desc: 'Elevates entire teams through architecture ownership and mentorship',        skills: ['Architecture', 'Mentoring', 'Git'] },
];

const RoleRow = React.memo(({ person, index, inView }: { person: typeof PEOPLE[0]; index: number; inView: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.25 + index * 0.045, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '36px 1fr' : '44px 1fr 2fr auto',
        alignItems: 'center',
        gap: isMobile ? '0 16px' : '0 32px',
        padding: isMobile ? '14px 16px' : '15px 28px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        background: hovered ? 'rgba(255,199,44,0.05)' : 'transparent',
        transition: 'background 0.28s ease',
        cursor: 'default',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
        background: DEPT_COLORS[person.dept],
        transform: hovered ? 'scaleY(1)' : 'scaleY(0)',
        transformOrigin: 'top',
        transition: 'transform 0.28s ease',
      }} />

      {/* Number */}
      <span style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 10,
        letterSpacing: '0.25em',
        color: hovered ? DEPT_COLORS[person.dept] : 'rgba(255,255,255,0.18)',
        transition: 'color 0.28s',
      }}>
        {person.id}
      </span>

      {/* Role + dept badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: isMobile ? '0.9rem' : '1rem',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.01em', transition: 'color 0.28s', whiteSpace: 'nowrap',
        }}>
          {person.role}
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600,
          color: DEPT_COLORS[person.dept],
          background: `${DEPT_COLORS[person.dept]}1A`,
          padding: '2px 8px', borderRadius: 100,
          letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {person.dept}
        </span>
      </div>

      {/* Description — hidden on mobile */}
      {!isMobile && (
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
          color: hovered ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.26)',
          lineHeight: 1.55, transition: 'color 0.28s',
        }}>
          {person.desc}
        </span>
      )}

      {/* Skill tags — hidden on mobile */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', flexShrink: 0 }}>
          {person.skills.map(s => (
            <span key={s} style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10,
              color: hovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
              border: `1px solid ${hovered ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap',
              transition: 'all 0.28s',
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
});

const OurPeople = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isMobile = useIsMobile();
  return (
    <section id="sec-people" ref={ref} style={{
      background: C.charcoal, minHeight: '100vh',
      padding: 'clamp(80px, 10vw, 120px) 40px',
      position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <SectionTag name="our people" />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Divider inView={inView} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Badge n="07" label="Our People" />
            <div style={{ overflow: 'hidden' }}>
              <motion.div
                initial={{ y: '110%' }} animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                style={{ display: 'flex', alignItems: 'baseline', gap: '0.2em', flexWrap: 'wrap' }}
              >
                <span style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                  letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'lowercase',
                  WebkitTextStroke: `2px ${C.base}`, WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}>the</span>
                <span style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                  letterSpacing: '-0.03em', lineHeight: 1.0, textTransform: 'lowercase',
                  color: C.base, display: 'inline-block',
                }}>people</span>
              </motion.div>
            </div>
          </div>

          {/* Stat + legend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, paddingBottom: 4 }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3.5rem)', color: C.accent, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {PEOPLE.length}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: C.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
                disciplines
              </div>
            </div>
            {/* Dept legend */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {Object.entries(DEPT_COLORS).map(([dept, color]) => (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dept}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Column headers */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: '44px 1fr 2fr auto', gap: '0 32px', padding: '0 28px 10px 28px' }}
          >
            {['#', 'Role', 'What they do', 'Key tools'].map(h => (
              <span key={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </motion.div>
        )}

        {/* Roles list */}
        <div>
          {PEOPLE.map((person, i) => (
            <RoleRow key={person.id} person={person} index={i} inView={inView} />
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </section>
  );
};

const Showcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-60px' });
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!trackRef.current) return;
    const scrollable = Math.max(0, trackRef.current.scrollWidth - (window.innerWidth - 80));
    x.set(-scrollable * v);
  });

  // Progress indicator for horizontal scroll
  const [pctDisplay, setPctDisplay] = useState('0');
  useMotionValueEvent(scrollYProgress, 'change', (v) => { setPctDisplay(String(Math.round(v * 100))); });

  if (isMobile) {
    return (
      <section id="sec-showcase" style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 24px', position: 'relative' }}>
        <SectionTag name="showcase" />
        <div ref={headerRef}>
          <div style={{ marginBottom: 52 }}>
            <Badge n="06" label="Innovation Hub" />
            <SplitHeading outline="ai projects" solid="at work" inView={inView} color={C.charcoal} fontSize="clamp(2.8rem, 8vw, 4.5rem)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {CARDS.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.75, delay: i * 0.08 }}>
                <ShowCard card={card} index={i} fullWidth />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="sec-showcase" ref={sectionRef} style={{ background: C.base, height: `${(CARDS.length + 1.5) * 100}vh`, position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}
        data-cursor="drag"
      >
        <SectionTag name="showcase" />
        <motion.div ref={headerRef} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Badge n="06" label="Innovation Hub" />
              <SplitHeading outline="ai projects" solid="at work" inView={inView} color={C.charcoal} fontSize="clamp(2.8rem, 5vw, 4.5rem)" />
            </div>
            {/* Horizontal progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8 }}>
              <span style={{ color: C.muted, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>scroll</span>
              <div style={{ width: 120, height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', background: C.accent, scaleX: scrollYProgress, transformOrigin: 'left' }} />
              </div>
              <span style={{ color: C.charcoal, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11 }}>{pctDisplay}%</span>
            </div>
          </div>
        </motion.div>
        <motion.div ref={trackRef} style={{ x, display: 'flex', gap: 28, willChange: 'transform' }}>
          {CARDS.map((card, i) => <ShowCard key={i} card={card} index={i} />)}
        </motion.div>
      </div>
    </section>
  );
};

// ── CLOSING CTA ───────────────────────────────────────────────────────────────
const Closing = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} style={{ background: C.charcoal, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="closing" />
      {/* Background accent */}
      <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${C.accent}12 0%, transparent 70%)`, pointerEvents: 'none' }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <Divider inView={inView} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '48px 80px', alignItems: 'end' }}>
          <div>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
              style={{ color: C.accent, fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 28 }}
            >
              let's build together
            </motion.p>
            <SplitHeading outline="the future" solid="starts here" inView={inView} color={C.base} fontSize="clamp(3.5rem, 7vw, 7rem)" />
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5, duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24, alignSelf: 'end', paddingBottom: 8 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.85, maxWidth: 340 }}>
              ready to transform your engineering? we partner with organizations who want to move at the speed of AI.
            </p>
            <MagneticWrapper>
              <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '20px 48px', background: C.accent, color: C.charcoal, borderRadius: 100, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', letterSpacing: '-0.01em', textTransform: 'lowercase', alignSelf: 'flex-start' }}>
                contact phitopolis
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </MagneticWrapper>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function AIDayPage() {
  const [ready, setReady] = useState(false); // kept for potential future use
  useEffect(() => {
    document.title = 'Phitopolis | AI Day 2026';
    document.body.style.cursor = 'none';
    document.body.style.backgroundColor = C.charcoal;
    return () => {
      document.body.style.cursor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <>
      <GrainOverlay />
      <Preloader onComplete={() => setReady(true)} />
      <div>
        <ScrollProgressBar />
        <CustomCursor />
        <FloatNav />
        <Hero />
        <Statement />
        <Vision />
        <MarqueeSection />
        <Expertise />
        <TechStack />
        <Stats />
        <Process />
        <OurPeople />
        <Showcase />
        <Closing />
      </div>
    </>
  );
}
