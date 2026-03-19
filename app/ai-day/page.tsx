
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView, useVelocity,
  useMotionValue, useSpring, useMotionValueEvent,
  useAnimationFrame, animate,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
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

// ── IRIS SECTION TRANSITION ───────────────────────────────────────────────────
const ALL_SECTION_IDS = [
  'sec-hero', 'sec-statement', 'sec-vision',
  'sec-services', 'sec-techstack', 'sec-stats', 'sec-process', 'sec-people',
  'sec-timeline',
  'sec-showcase', 'sec-closing',
];

const IRIS_SECTIONS: Record<string, { n: string; title: string }> = {
  'sec-statement': { n: '00', title: 'Manifesto'    },
  'sec-vision':    { n: '01', title: 'Vision'       },
  'sec-techstack': { n: '04', title: 'Tech Stack'   },
  'sec-stats':     { n: '04', title: 'Impact'       },
  'sec-process':   { n: '05', title: 'Process'      },
  'sec-people':    { n: '06', title: 'Our People'   },
  'sec-timeline':  { n: '07', title: 'Our Journey'   },
  'sec-showcase':  { n: '07', title: 'Projects'     },
  'sec-closing':   { n: '08', title: "Let's Build"  },
};

const SectionTransition = () => {
  const [iris, setIris] = useState<{ key: number; n: string; title: string } | null>(null);
  const locked    = useRef(false);
  const activeId  = useRef('sec-hero');
  const touchStartY = useRef(0);

  // Fire iris + instant-scroll while covered
  const goTo = useCallback((targetId: string) => {
    if (locked.current) return;
    const cfg = IRIS_SECTIONS[targetId];
    locked.current = true;

    // 1. Trigger iris immediately — section not yet visible
    if (cfg) setIris(prev => ({ key: (prev?.key ?? 0) + 1, ...cfg }));

    // 2. Instant-scroll while iris is fully open (~380ms in)
    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      activeId.current = targetId;
    }, 380);

    // 3. Unlock after full iris animation completes
    setTimeout(() => { locked.current = false; }, 1550);
  }, []);

  useEffect(() => {
    // Track active section (for knowing where we are)
    // Track active section — threshold 0.5 works for all 100vh sections
    const tracker = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) activeId.current = e.target.id; });
    }, { threshold: 0.5 });
    document.querySelectorAll('[id^="sec-"]:not(#sec-showcase):not(#sec-services):not(#sec-process)').forEach(el => tracker.observe(el));

    // Tall sections need a low threshold since they can't reach 50% intersection
    const tallTracker = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) activeId.current = e.target.id; });
    }, { threshold: 0.05 });
    ['sec-services', 'sec-process', 'sec-people', 'sec-timeline', 'sec-showcase'].forEach(id => {
      const el = document.getElementById(id);
      if (el) tallTracker.observe(el);
    });

    const navigate = (dir: 1 | -1) => {
      const idx = ALL_SECTION_IDS.indexOf(activeId.current);
      const next = ALL_SECTION_IDS[idx + dir];
      if (next) goTo(next);
    };

    // Scroll progress (0–1) within any section taller than the viewport
    const sectionProgress = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const max = el.offsetHeight - window.innerHeight;
      return max > 0 ? Math.max(0, Math.min(1, (window.scrollY - el.offsetTop) / max)) : 1;
    };

    // Sections taller than 100vh that need scroll-through before transitioning
    const TALL_SECTIONS = new Set(['sec-services', 'sec-process', 'sec-people', 'sec-timeline', 'sec-showcase']);

    // Sections where natural browser scroll is used to cross the boundary (both directions)
    const FREE_SCROLL_PAIRS = new Set(['sec-hero', 'sec-vision', 'sec-services']);
    // Sections where only upward scroll is natural (preserves iris going down)
    const FREE_SCROLL_UP_SECTIONS = new Set(['sec-statement', 'sec-techstack']);

    // Wheel — pass through tall sections mid-scroll; intercept at boundaries
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;
      if (TALL_SECTIONS.has(activeId.current)) {
        const p = sectionProgress(activeId.current);
        if (e.deltaY > 0 && p >= 0.98) {
          if (FREE_SCROLL_PAIRS.has(activeId.current)) return;
          e.preventDefault(); navigate(1); return;
        }
        if (e.deltaY < 0 && p <= 0.02) {
          if (FREE_SCROLL_PAIRS.has(activeId.current)) return;
          e.preventDefault(); navigate(-1); return;
        }
        return; // mid-section: pass through
      }
      if (FREE_SCROLL_PAIRS.has(activeId.current)) return;
      if (FREE_SCROLL_UP_SECTIONS.has(activeId.current) && e.deltaY < 0) return;
      e.preventDefault();
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    // Touch swipe
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 60) return;
      if (TALL_SECTIONS.has(activeId.current)) {
        const p = sectionProgress(activeId.current);
        if (diff > 0 && p >= 0.98) { if (!FREE_SCROLL_PAIRS.has(activeId.current)) { navigate(1); } return; }
        if (diff < 0 && p <= 0.02) { if (!FREE_SCROLL_PAIRS.has(activeId.current)) { navigate(-1); } return; }
        return;
      }
      if (FREE_SCROLL_PAIRS.has(activeId.current)) return;
      if (FREE_SCROLL_UP_SECTIONS.has(activeId.current) && diff < 0) return;
      navigate(diff > 0 ? 1 : -1);
    };

    // Keyboard arrows / Page Up / Down
    const onKey = (e: KeyboardEvent) => {
      if (TALL_SECTIONS.has(activeId.current)) {
        const p = sectionProgress(activeId.current);
        if (['ArrowDown', 'PageDown'].includes(e.key) && p >= 0.98) { if (!FREE_SCROLL_PAIRS.has(activeId.current)) { e.preventDefault(); navigate(1); } return; }
        if (['ArrowUp',  'PageUp'  ].includes(e.key) && p <= 0.02) { if (!FREE_SCROLL_PAIRS.has(activeId.current)) { e.preventDefault(); navigate(-1); } return; }
        return;
      }
      if (FREE_SCROLL_PAIRS.has(activeId.current)) return;
      if (FREE_SCROLL_UP_SECTIONS.has(activeId.current) && ['ArrowUp', 'PageUp'].includes(e.key)) return;
      if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); navigate(1);  }
      if (['ArrowUp',  'PageUp'  ].includes(e.key)) { e.preventDefault(); navigate(-1); }
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true  });
    window.addEventListener('keydown',    onKey);

    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
      window.removeEventListener('keydown',    onKey);
      tracker.disconnect();
      tallTracker.disconnect();
    };
  }, [goTo]);

  if (!iris) return null;

  const OPEN  = 'circle(150% at 50% 50%)';
  const CLOSE = 'circle(0%   at 50% 50%)';
  const T     = [0, 0.38, 1] as [number, number, number];

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 250 }}>

      {/* Layer 1: charcoal — leads, creates halo border */}
      <motion.div
        key={`ring-${iris.key}`}
        initial={{ clipPath: CLOSE }}
        animate={{ clipPath: [CLOSE, OPEN, CLOSE] }}
        transition={{ duration: 1.35, times: T, ease: ['circIn', 'circOut'] }}
        style={{ position: 'absolute', inset: 0, background: C.charcoal }}
      />

      {/* Layer 2: accent — 0.07s delayed, fills inside charcoal ring */}
      <motion.div
        key={`fill-${iris.key}`}
        initial={{ clipPath: CLOSE }}
        animate={{ clipPath: [CLOSE, OPEN, CLOSE] }}
        transition={{ duration: 1.2, times: T, ease: ['circIn', 'circOut'], delay: 0.07 }}
        style={{ position: 'absolute', inset: 0, background: C.accent }}
      />

      {/* Label — visible at peak */}
      <motion.div
        key={`label-${iris.key}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.2, times: [0, 0.28, 0.52, 0.72] }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 900,
          fontSize: 'clamp(7rem, 18vw, 16rem)',
          color: C.charcoal, opacity: 0.07,
          lineHeight: 1, letterSpacing: '-0.06em',
          position: 'absolute', userSelect: 'none',
        }}>
          {iris.n}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 28, height: 1.5, background: C.charcoal, opacity: 0.35 }} />
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: C.charcoal,
          }}>
            {iris.title}
          </span>
          <div style={{ width: 28, height: 1.5, background: C.charcoal, opacity: 0.35 }} />
        </div>
      </motion.div>

    </div>
  );
};

// ── FLOATING SECTION NAV ──────────────────────────────────────────────────────
const FLOAT_SECTIONS = [
  { id: 'sec-hero',      label: 'Intro' },
  { id: 'sec-statement', label: 'Statement' },
  { id: 'sec-vision',    label: 'Vision' },
  { id: 'sec-services',  label: 'Services'  },
  { id: 'sec-techstack', label: 'Tech Stack' },
  { id: 'sec-stats',     label: 'Impact' },
  { id: 'sec-process',   label: 'Process' },
  { id: 'sec-people',    label: 'People' },
  { id: 'sec-timeline',  label: '2021–2026' },
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
    type P = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; r: number; blink: number; blinkSpeed: number; anchored: boolean };
    let pts: P[] = [];
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const init = () => { pts = Array.from({ length: 260 }, () => { const big = Math.random() < 0.12; const hx = Math.random() * W(), hy = Math.random() * H(); return { x: hx, y: hy, hx, hy, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: big ? 2.0 + Math.random() * 2.5 : Math.random() * 1.4 + 0.6, blink: Math.random() * Math.PI * 2, blinkSpeed: 0.8 + Math.random() * 2.5, anchored: Math.random() < 0.4 }; }); };
    // ── Text outline sampling — extracts edge points from "future" & "with" ──
    type TextTarget = { el: Element; anchors: { x: number; y: number }[] };
    let textTargets: TextTarget[] = [];
    const sampleOutlines = () => {
      textTargets = [];
      document.querySelectorAll('[data-connect-dots]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize);
        const off = document.createElement('canvas');
        off.width = Math.ceil(rect.width); off.height = Math.ceil(rect.height);
        const oc = off.getContext('2d')!;
        oc.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
        oc.letterSpacing = cs.letterSpacing;
        oc.textBaseline = 'top';
        oc.fillStyle = '#fff';
        oc.fillText(el.textContent || '', 0, fs * 0.05);
        const img = oc.getImageData(0, 0, off.width, off.height);
        const d = img.data, ow = off.width, oh = off.height;
        // Collect all edge pixels, then randomly pick ~4 per letter
        const edgePixels: { x: number; y: number }[] = [];
        const step = 3;
        for (let y = 0; y < oh; y += step) for (let x = 0; x < ow; x += step) {
          if (d[(y * ow + x) * 4 + 3] < 128) continue;
          let edge = false;
          for (const [ex, ey] of [[-step,0],[step,0],[0,-step],[0,step]]) {
            const nx = x + ex, ny = y + ey;
            if (nx < 0 || nx >= ow || ny < 0 || ny >= oh || d[(ny * ow + nx) * 4 + 3] < 128) { edge = true; break; }
          }
          if (edge) edgePixels.push({ x, y });
        }
        // Randomly pick ~4 anchors per letter
        const letterCount = (el.textContent || '').replace(/\s/g, '').length;
        const target = letterCount * 7;
        const anchors: { x: number; y: number }[] = [];
        for (let i = edgePixels.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [edgePixels[i], edgePixels[j]] = [edgePixels[j], edgePixels[i]]; }
        anchors.push(...edgePixels.slice(0, target));
        textTargets.push({ el, anchors });
      });
    };

    const resize = () => { const dpr = window.devicePixelRatio || 1; canvas.width = W() * dpr; canvas.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); init(); };
    const tick = () => {
      const w = W(), h = H(); ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 0) { const d = Math.sqrt(d2), f = (130 - d) / 130; p.vx += (dx / d) * f * 0.85; p.vy += (dy / d) * f * 0.85; }
        if (p.anchored) { p.vx += (p.hx - p.x) * 0.003; p.vy += (p.hy - p.y) * 0.003; }
        p.vx *= 0.95; p.vy *= 0.95; p.x += p.vx; p.y += p.vy;
        if (!p.anchored) { if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; }
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(255,199,44,${(1 - Math.sqrt(d2) / 120) * 0.22})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      }

      // ── Draw connections from particles to text outline anchor points ──
      const cRect = canvas.getBoundingClientRect();
      for (const tt of textTargets) {
        const eRect = tt.el.getBoundingClientRect();
        const ox = eRect.left - cRect.left, oy = eRect.top - cRect.top;
        for (const a of tt.anchors) {
          const ax = ox + a.x, ay = oy + a.y;
          // Dot at anchor point
          ctx.beginPath(); ctx.arc(ax, ay, 1.8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,199,44,0.35)'; ctx.fill();
          // Lines from nearby particles
          for (const p of pts) {
            const adx = p.x - ax, ady = p.y - ay, ad2 = adx * adx + ady * ady;
            if (ad2 < 140 * 140 && ad2 > 4) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ax, ay); ctx.strokeStyle = `rgba(255,199,44,${(1 - Math.sqrt(ad2) / 140) * 0.28})`; ctx.lineWidth = 0.6; ctx.stroke(); }
          }
        }
      }

      const now = performance.now() * 0.001;
      for (const p of pts) { const alpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(now * p.blinkSpeed + p.blink)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,199,44,${alpha})`; ctx.fill(); }
      raf = requestAnimationFrame(tick);
    };
    const onMouse = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    resize(); tick();
    // Sample text outlines after fonts are loaded, and on resize
    document.fonts.ready.then(() => setTimeout(sampleOutlines, 200));
    const onResize = () => { resize(); sampleOutlines(); };
    window.addEventListener('resize', onResize); window.addEventListener('mousemove', onMouse);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMouse); };
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

// ── PARTICLE LOGO — particles assemble into Phitopolis P logo ────────────────
const ParticleLogo = ({ scrollProgress, mouseX, mouseY, containerRef, ready }: {
  scrollProgress: import('framer-motion').MotionValue<number>;
  mouseX: import('framer-motion').MotionValue<number>;
  mouseY: import('framer-motion').MotionValue<number>;
  containerRef: React.RefObject<HTMLElement | null>;
  ready: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assembleStartRef = useRef<number>(Infinity); // set when preloader completes
  const svgLoadedAtRef   = useRef<number>(0);        // set when SVG finishes loading

  // Start assembly countdown once the hero is revealed by the preloader
  useEffect(() => {
    if (ready && assembleStartRef.current === Infinity) {
      assembleStartRef.current = performance.now() + 900;
    }
  }, [ready]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let mounted = true;
    const mouse = { x: -9999, y: -9999 };

    type Particle = {
      x: number; y: number;       // current position
      tx: number; ty: number;     // target position (on logo)
      sx: number; sy: number;     // start position (random)
      vx: number; vy: number;     // velocity
      r: number;                  // radius
      color: string;              // particle color
      blink: number;              // blink phase offset
      blinkSpeed: number;
      delay: number;              // assembly delay (staggered fly-in)
      sAngle: number;             // random scatter direction (not radial)
      sDist: number;              // random scatter distance
    };

    let particles: Particle[] = [];
    let neighborPairs: [number, number][] = []; // precomputed pairs of logo-adjacent particles
    let assembled = false;
    const ASSEMBLE_DURATION = 2200; // ms for particles to reach targets
    const LOGO_CONNECT_DIST = 12;   // px between target positions to be considered neighbors
    const LOGO_SIZE = Math.min(480, Math.max(260, window.innerWidth * 0.32));

    // Load SVG and sample edge points
    const img = new Image();
    img.src = '/phitopolis_logo_white_vector.svg';
    img.onload = () => {
      if (!mounted) return;
      // Render SVG to offscreen canvas at target size
      const aspect = img.naturalHeight / img.naturalWidth;
      const w = Math.round(LOGO_SIZE);
      const h = Math.round(LOGO_SIZE * aspect);
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const oc = off.getContext('2d')!;
      oc.drawImage(img, 0, 0, w, h);
      const imgData = oc.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Sample edge pixels
      const step = 3;
      const edgePixels: { x: number; y: number; isGold: boolean }[] = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] < 100) continue; // transparent
          // Check if edge pixel
          let edge = false;
          for (const [ex, ey] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
            const nx = x + ex, ny = y + ey;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h || d[(ny * w + nx) * 4 + 3] < 100) {
              edge = true;
              break;
            }
          }
          if (!edge) continue;
          // Determine color: golden parts have high R, high G, low B
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const isGold = r > 180 && g > 140 && b < 100;
          edgePixels.push({ x, y, isGold });
        }
      }

      // Also sample some interior points for density
      const interiorPixels: { x: number; y: number; isGold: boolean }[] = [];
      const interiorStep = 5;
      for (let y = 0; y < h; y += interiorStep) {
        for (let x = 0; x < w; x += interiorStep) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] < 100) continue;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const isGold = r > 180 && g > 140 && b < 100;
          interiorPixels.push({ x, y, isGold });
        }
      }

      // Shuffle and pick particles — more edges, fewer interior
      const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      shuffle(edgePixels);
      shuffle(interiorPixels);
      const maxParticles = 700;
      const edgeCount = Math.min(edgePixels.length, Math.round(maxParticles * 0.7));
      const interiorCount = Math.min(interiorPixels.length, maxParticles - edgeCount);
      const selected = [...edgePixels.slice(0, edgeCount), ...interiorPixels.slice(0, interiorCount)];

      // Position logo in the center of the canvas
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      const ox = (cw - w) / 2;
      const oy = (ch - h) / 2;

      particles = selected.map((p) => {
        // Each particle starts at its scatter position and flies to the logo on load
        const sAngle = Math.random() * Math.PI * 2;
        const sDist  = 600 + Math.random() * 1000;
        const sx = ox + p.x + Math.cos(sAngle) * sDist;
        const sy = oy + p.y + Math.sin(sAngle) * sDist;
        return {
          x: sx, y: sy,
          tx: ox + p.x, ty: oy + p.y,
          sx, sy,
          vx: 0, vy: 0,
          r: p.isGold ? (0.8 + Math.random() * 1.2) : (0.6 + Math.random() * 1.0),
          color: p.isGold ? 'rgba(255,199,44,' : 'rgba(240,242,250,',
          blink: Math.random() * Math.PI * 2,
          blinkSpeed: 0.6 + Math.random() * 2.0,
          delay: Math.random() * 600, // staggered fly-in
          sAngle,
          sDist,
        };
      });

      // Precompute which particles are logo-neighbors (close target positions)
      neighborPairs = [];
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].tx - particles[j].tx;
          const dy = particles[i].ty - particles[j].ty;
          if (dx * dx + dy * dy < LOGO_CONNECT_DIST * LOGO_CONNECT_DIST) {
            neighborPairs.push([i, j]);
          }
        }
      }

      // Record when SVG loaded; assembly timer is started externally when hero is revealed
      svgLoadedAtRef.current = performance.now();
      assembled = true;
    };

    // ── Background ambient dots (invisible at rest, connect to P dots on scroll) ──
    type BgDot = { x: number; y: number; vx: number; vy: number; r: number; blink: number; blinkSpeed: number };
    let bgDots: BgDot[] = [];
    const initBgDots = () => {
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      bgDots = Array.from({ length: 200 }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.5 + Math.random() * 1.1,
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.4 + Math.random() * 1.5,
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initBgDots();
    };

    const tick = () => {
      if (!mounted) return;
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      if (!assembled || particles.length === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      const elapsed = now - assembleStartRef.current;
      const scroll = scrollProgress.get(); // 0 at top, 1 when hero scrolled past

      // Update mouse position relative to canvas
      const container = containerRef.current;
      if (container) {
        const cRect = canvas.getBoundingClientRect();
        // mouseX/mouseY are -1 to 1 from hero center
        const hRect = container.getBoundingClientRect();
        const mx = (mouseX.get() * hRect.width / 2) + hRect.width / 2 + hRect.left - cRect.left;
        const my = (mouseY.get() * hRect.height / 2) + hRect.height / 2 + hRect.top - cRect.top;
        mouse.x = mx;
        mouse.y = my;
      }

      // Scroll scatter — stronger as we scroll down
      const scatterStrength = Math.min(scroll * 3, 1); // reaches full scatter at 33% scroll

      // Load-time scatter visibility: full during hold, fades out as logo forms
      const tSinceLoad = now - svgLoadedAtRef.current; // ms since SVG loaded
      const loadFadeIn = Math.min(1, Math.max(0, tSinceLoad / 400));
      const assemblyProgress = Math.min(1, Math.max(0, elapsed / ASSEMBLE_DURATION));
      const loadScatter = loadFadeIn * (1 - assemblyProgress);
      const bgVisibility = Math.max(scatterStrength, loadScatter);

      // Update background ambient dots
      for (const b of bgDots) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x = cw; if (b.x > cw) b.x = 0;
        if (b.y < 0) b.y = ch; if (b.y > ch) b.y = 0;
      }

      for (const p of particles) {
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        // Smooth ease-out cubic
        const ease = 1 - Math.pow(1 - assembleT, 3);

        // Target is the logo position
        let goalX = p.tx;
        let goalY = p.ty;

        // On scroll, scatter in each particle's own random direction — chaotic explosion
        if (scatterStrength > 0) {
          goalX = p.tx + Math.cos(p.sAngle) * scatterStrength * p.sDist;
          goalY = p.ty + Math.sin(p.sAngle) * scatterStrength * p.sDist;
        }

        // During assembly, interpolate from start to goal
        if (assembleT < 1) {
          p.x = p.sx + (goalX - p.sx) * ease;
          p.y = p.sy + (goalY - p.sy) * ease;
        } else {
          // After assembly, use spring physics toward goal
          // Spring force weakens during scatter for a slow drift outward
          const springForce = 0.035 - scatterStrength * 0.031; // 0.035 at rest → 0.004 at full scatter
          p.vx += (goalX - p.x) * springForce;
          p.vy += (goalY - p.y) * springForce;

          // Cursor repulsion
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          const repelRadius = 80;
          if (d2 < repelRadius * repelRadius && d2 > 0) {
            const d = Math.sqrt(d2);
            const f = (repelRadius - d) / repelRadius;
            p.vx += (dx / d) * f * 3.5;
            p.vy += (dy / d) * f * 3.5;
          }

          // Lower damping during scatter = more friction = slower movement
          const damping = 0.88 - scatterStrength * 0.08; // 0.88 at rest → 0.80 at full scatter
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // Logo-network connections: fade in as each pair of neighbors arrives at the logo
      const logoFade = 1 - scatterStrength;
      if (logoFade > 0.01 && neighborPairs.length > 0) {
        for (const [i, j] of neighborPairs) {
          const pi = particles[i], pj = particles[j];
          const ti = Math.min(1, Math.max(0, (elapsed - pi.delay) / ASSEMBLE_DURATION));
          const tj = Math.min(1, Math.max(0, (elapsed - pj.delay) / ASSEMBLE_DURATION));
          const arrivalA = Math.min(ti, tj);
          if (arrivalA < 0.02) continue;
          const tdx = pi.tx - pj.tx, tdy = pi.ty - pj.ty;
          const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
          const alpha = arrivalA * logoFade * (1 - tDist / LOGO_CONNECT_DIST) * 0.42;
          if (alpha < 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(255,199,44,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      // Scatter connections: expand and brighten as particles explode on scroll
      if (scatterStrength > 0.05) {
        const connectDist = 28 + scatterStrength * 80;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < connectDist * connectDist) {
              const alpha = (1 - Math.sqrt(d2) / connectDist) * scatterStrength * 0.35;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255,199,44,${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // Draw connections: P particles ↔ background dots (on scroll AND during initial load)
      if (bgVisibility > 0.05) {
        const bgConnectDist = 160;
        for (const p of particles) {
          for (const b of bgDots) {
            const dx = p.x - b.x, dy = p.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bgConnectDist * bgConnectDist) {
              const dist = Math.sqrt(d2);
              const alpha = (1 - dist / bgConnectDist) * bgVisibility * 0.28;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(255,199,44,${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // Draw background dots (visible on scroll AND during initial load assembly)
      const t = now * 0.001;
      if (bgVisibility > 0) {
        for (const b of bgDots) {
          const blinkAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * b.blinkSpeed + b.blink));
          const alpha = bgVisibility * blinkAlpha * 0.55;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,199,44,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // Draw P particles — visible at scatter positions during hold, fade in during assembly
      for (const p of particles) {
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        // Before assembleStart: show at full opacity; during assembly: fade in with assembleT
        const fadeIn = elapsed < 0 ? loadFadeIn : Math.min(1, assembleT * 2);
        const blinkAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.blinkSpeed + p.blink));
        const alpha = fadeIn * blinkAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha.toFixed(3) + ')';
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [scrollProgress, mouseX, mouseY, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
};

// ── HERO ──────────────────────────────────────────────────────────────────────
const Hero = ({ ready }: { ready: boolean }) => {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Cursor-driven parallax: track mouse position as -1 to 1 range
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Normalize to -1..1 from center of hero
      mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
      mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <section id="sec-hero" ref={containerRef} style={{ minHeight: '100vh', background: C.charcoal, position: 'relative', overflow: 'hidden' }}>
      <SectionTag name="hero" />

      {/* Background video */}
      <motion.div style={{ position: 'absolute', inset: 0, y: bgY, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: 'translate(-50%, -50%)', objectFit: 'cover', opacity: 0.15 }}
        >
          <source src="/seamless-tech-loop.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, ${C.charcoal}cc 0%, transparent 30%, transparent 70%, ${C.charcoal} 100%)` }} />
      </motion.div>

      {/* Canvas particle network */}
      <motion.div style={{ position: 'absolute', inset: 0, y: bgY, zIndex: 2, pointerEvents: 'none' }}>
        <CanvasBackground />
      </motion.div>

      {/* Particle Logo — centered */}
      <ParticleLogo scrollProgress={scrollYProgress} mouseX={mouseX} mouseY={mouseY} containerRef={containerRef} ready={ready} />

      {/* Glow */}
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}08 0%, transparent 70%)`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 2 }}
      />

      {/* Top-left label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
        style={{ position: 'absolute', top: 44, left: 44, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', zIndex: 10 }}
      >
        ai day — 2026
      </motion.div>

      {/* Top-right label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        style={{ position: 'absolute', top: 44, right: 44, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', zIndex: 10 }}
      >
        phitopolis
      </motion.div>

      {/* Narrator AI placeholder — lower left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 'clamp(80px, 11vh, 120px)',
          left: 56,
          width: 'clamp(180px, 20vw, 260px)',
          height: 'clamp(90px, 12vh, 140px)',
          border: '1px dashed rgba(255,199,44,0.2)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid rgba(255,199,44,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,199,44,0.2)' }} />
        </div>
        <span style={{ color: 'rgba(255,199,44,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase' }}>narrator ai</span>
        <span style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'Inter, sans-serif', fontSize: 8, letterSpacing: '0.1em' }}>coming soon</span>
      </motion.div>

      {/* Scroll cue — bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.7 }}
        style={{ position: 'absolute', bottom: 'clamp(32px, 5vh, 48px)', right: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 10 }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>scroll</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
          <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, ${C.accent}, transparent)` }} />
        </motion.div>
      </motion.div>
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

// ── SERVICES SCROLL STORY ─────────────────────────────────────────────────────
const SCROLL_ITEMS = [
  {
    image: 'https://phitopolis.com/img/core-competencies/innovation.jpg',
    label: '01 / R&D',
    title: 'Research & Development',
    desc:  'Pioneering new technologies and frameworks to solve complex enterprise problems.',
  },
  {
    image: 'https://phitopolis.com/img/core-competencies/technical-excellence.jpg',
    label: '02 / Data',
    title: 'Data Science',
    desc:  'Extracting actionable insights from vast datasets through ML and statistical modeling.',
  },
  {
    image: 'https://phitopolis.com/img/core-competencies/proactive-communication.jpg',
    label: '03 / Eng',
    title: 'Full-Stack Engineering',
    desc:  'Building resilient, scalable, and high-performance applications for the modern web.',
  },
];

// Image base: 44vw × 88vh at left: 25vw, top: 6vh (centered layout with right caption area)
// Base image: top: 6vh, left: 25vw, width: 44vw, height: 88vh → right: 69vw, bottom: 94vh
// Thumbnail scale 0.22 → rendered size: 9.68vw × 19.36vh
// Left slot (prev): top-aligned with main, snug to left edge
//   → x = (25vw - 9.68vw - 1vw) - 25vw = -10.68vw ≈ -11vw, y = 0vh
// Right slot (next): bottom-aligned with main, snug to right edge
//   → x = (69vw + 1vw) - 25vw = 45vw → 46vw with gap, y = (94vh - 19.36vh) - 6vh ≈ 69vh
const ServicesScrollStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const img1Ref      = useRef<HTMLDivElement>(null);
  const img2Ref      = useRef<HTMLDivElement>(null);
  const img3Ref      = useRef<HTMLDivElement>(null);
  const cap1Ref      = useRef<HTMLDivElement>(null);
  const cap2Ref      = useRef<HTMLDivElement>(null);
  const cap3Ref      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states before ScrollTrigger takes over
      gsap.set(headingRef.current,  { transformOrigin: '50% 0%' });
      gsap.set(img1Ref.current,     { scale: 0.08, x: '23vw', y: '77vh', transformOrigin: '0% 0%', willChange: 'transform' });
      gsap.set(img2Ref.current,     { opacity: 0, scale: 0.22, x: '46vw', y: '69vh', transformOrigin: '0% 0%', willChange: 'transform' });
      gsap.set(img3Ref.current,     { opacity: 0, scale: 0.22, x: '46vw', y: '69vh', transformOrigin: '0% 0%', willChange: 'transform' });
      gsap.set(cap1Ref.current,     { opacity: 0 });
      gsap.set(cap2Ref.current,     { opacity: 0 });
      gsap.set(cap3Ref.current,     { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
        defaults: { ease: 'none' },
      });

      // ── Heading fades out ─────────────────────────────────────────────────────
      tl.to(headingRef.current, { opacity: 0, scale: 0.4, y: '-6vh', duration: 0.11 }, 0.15);

      // ── Image 1: tiny → full → thumbnail → fade ───────────────────────────────
      tl.to(img1Ref.current,   { scale: 1, x: '0vw', y: '0vh', duration: 0.22 }, 0);
      tl.to(img1Ref.current,   { scale: 0.22, x: '-11vw', duration: 0.20 }, 0.38);
      tl.to(img1Ref.current,   { opacity: 0, duration: 0.15 }, 0.75);

      // ── Caption 1 ─────────────────────────────────────────────────────────────
      tl.to(cap1Ref.current,   { opacity: 1, duration: 0.08 }, 0.35);
      tl.to(cap1Ref.current,   { opacity: 0, duration: 0.08 }, 0.50);

      // ── Image 2: appears → full → thumbnail ───────────────────────────────────
      tl.to(img2Ref.current,   { opacity: 1, duration: 0.08 }, 0.33);
      tl.to(img2Ref.current,   { scale: 1, x: '0vw', y: '0vh', duration: 0.20 }, 0.38);
      tl.to(img2Ref.current,   { scale: 0.22, x: '-11vw', duration: 0.15 }, 0.75);

      // ── Caption 2 ─────────────────────────────────────────────────────────────
      tl.to(cap2Ref.current,   { opacity: 1, duration: 0.08 }, 0.62);
      tl.to(cap2Ref.current,   { opacity: 0, duration: 0.08 }, 0.77);

      // ── Image 3: appears small → grows to full ────────────────────────────────
      tl.to(img3Ref.current,   { opacity: 1, duration: 0.08 }, 0.48);
      tl.to(img3Ref.current,   { scale: 1, x: '0vw', y: '0vh', duration: 0.21 }, 0.75);

      // ── Caption 3 ─────────────────────────────────────────────────────────────
      tl.to(cap3Ref.current,   { opacity: 1, duration: 0.08 }, 0.88);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const captionStyle: React.CSSProperties = {
    position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
    zIndex: 6, maxWidth: '22%', pointerEvents: 'none',
  };

  const imgWrapStyle: React.CSSProperties = {
    position: 'absolute',
    top: '6vh', left: '25vw',
    width: '44vw', height: '88vh',
    willChange: 'transform',
  };

  const imgInnerStyle: React.CSSProperties = {
    width: '100%', height: '100%',
    overflow: 'hidden', borderRadius: 20,
    position: 'relative',
  };

  return (
    <section id="sec-services" ref={containerRef} style={{ height: '500vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: C.charcoal }}>
        <SectionTag name="services" />

        {/* ── Heading ── */}
        <div ref={headingRef} style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, textAlign: 'center', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.base}`, WebkitTextFillColor: 'transparent' }}>
            what we{' '}
          </span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.base }}>
            do best.
          </span>
        </div>

        {/* ── Caption 1 ── */}
        <div ref={cap1Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[0].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: 12 }}>{SCROLL_ITEMS[0].title}</h3>
          <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[0].desc}</p>
        </div>

        {/* ── Caption 2 ── */}
        <div ref={cap2Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[1].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: 12 }}>{SCROLL_ITEMS[1].title}</h3>
          <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[1].desc}</p>
        </div>

        {/* ── Caption 3 ── */}
        <div ref={cap3Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[2].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: 12 }}>{SCROLL_ITEMS[2].title}</h3>
          <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[2].desc}</p>
        </div>

        {/* ── Image 3 (lowest z) ── */}
        <div ref={img3Ref} style={{ ...imgWrapStyle, zIndex: 1 }}>
          <div style={imgInnerStyle}>
            <img src={SCROLL_ITEMS[2].image} alt={SCROLL_ITEMS[2].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

        {/* ── Image 2 ── */}
        <div ref={img2Ref} style={{ ...imgWrapStyle, zIndex: 2 }}>
          <div style={imgInnerStyle}>
            <img src={SCROLL_ITEMS[1].image} alt={SCROLL_ITEMS[1].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

        {/* ── Image 1 ── */}
        <div ref={img1Ref} style={{ ...imgWrapStyle, zIndex: 3 }}>
          <div style={imgInnerStyle}>
            <img src={SCROLL_ITEMS[0].image} alt={SCROLL_ITEMS[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

      </div>
    </section>
  );
};


// ── 05 PROCESS + SERVICE WHEEL ────────────────────────────────────────────────
const PHASES = [
  {
    num: '01', label: 'Machine\nLearning',
    sub: 'supervised, unsupervised, and reinforcement learning tailored for financial and enterprise contexts.',
    color: C.accent, glow: '#FFC72C',
  },
  {
    num: '02', label: 'Data\nInfrastructure',
    sub: 'scalable pipelines, real-time streaming, and warehouse architecture built for speed at scale.',
    color: '#4A90D9', glow: '#4A90D9',
  },
  {
    num: '03', label: 'Human-AI\nSynergy',
    sub: 'human-in-the-loop workflows that keep domain experts at the center of every AI decision.',
    color: '#A78BFA', glow: '#A78BFA',
  },
];

// Transition windows: [enter-start, enter-end, exit-start, exit-end]
const PHASE_WIN = [
  [0.04, 0.14, 0.36, 0.44],
  [0.44, 0.54, 0.66, 0.74],
  [0.74, 0.84, 0.96, 1.00],
];

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // per-phase refs
  const phaseRefs   = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const labelRefs   = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const numRefs     = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const descRefs    = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const orbRefs     = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const stepRefs    = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const stepDotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const badgeRef    = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.8,
        },
        defaults: { ease: 'none' },
      });

      // ── Entry: badge + heading slide up ─────────────────────────────────────
      gsap.set([badgeRef.current, headRef.current], { y: 60, opacity: 0 });
      tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 0.06 }, 0);
      tl.to(headRef.current,  { y: 0, opacity: 1, duration: 0.06 }, 0.02);

      // ── Per-phase animations ────────────────────────────────────────────────
      PHASES.forEach((ph, i) => {
        const [es, ee, xs, xe] = PHASE_WIN[i];

        // Initial hidden state
        gsap.set(phaseRefs[i].current, { opacity: 0 });
        gsap.set(labelRefs[i].current, { clipPath: 'inset(0 0 100% 0)', y: 40 });
        gsap.set(numRefs[i].current,   { scale: 1.6, opacity: 0 });
        gsap.set(descRefs[i].current,  { y: 28, opacity: 0 });
        gsap.set(orbRefs[i].current,   { scale: 0.4, opacity: 0 });
        gsap.set(stepRefs[i].current,  { opacity: 0.25 });
        gsap.set(stepDotRefs[i].current, { scale: 0.5, backgroundColor: 'rgba(0,0,0,0.15)' });

        // — ENTER —
        const enterDur = ee - es;
        tl.to(phaseRefs[i].current,  { opacity: 1, duration: enterDur * 0.25 }, es);
        tl.to(numRefs[i].current,    { scale: 1, opacity: 1, duration: enterDur * 0.6 }, es);
        tl.to(labelRefs[i].current,  { clipPath: 'inset(0 0 0% 0)', y: 0, duration: enterDur * 0.55, ease: 'power2.out' }, es + enterDur * 0.1);
        tl.to(descRefs[i].current,   { y: 0, opacity: 1, duration: enterDur * 0.45 }, es + enterDur * 0.35);
        tl.to(orbRefs[i].current,    { scale: 1, opacity: 1, duration: enterDur * 0.6 }, es);
        // Step indicator brightens
        tl.to(stepRefs[i].current,   { opacity: 1, duration: enterDur * 0.3 }, es);
        tl.to(stepDotRefs[i].current, { scale: 1.15, backgroundColor: ph.color, duration: enterDur * 0.3 }, es);

        // — EXIT (if not last phase) —
        if (xs < 1) {
          const exitDur = xe - xs;
          tl.to(labelRefs[i].current, { clipPath: 'inset(100% 0 0% 0)', y: -40, duration: exitDur * 0.55, ease: 'power2.in' }, xs);
          tl.to(numRefs[i].current,   { scale: 0.5, opacity: 0, duration: exitDur * 0.55 }, xs);
          tl.to(descRefs[i].current,  { y: -20, opacity: 0, duration: exitDur * 0.4 }, xs);
          tl.to(orbRefs[i].current,   { scale: 0.3, opacity: 0, duration: exitDur * 0.5 }, xs);
          tl.to(phaseRefs[i].current, { opacity: 0, duration: exitDur * 0.2 }, xs + exitDur * 0.8);
          // Step indicator dims back
          tl.to(stepRefs[i].current,  { opacity: 0.25, duration: exitDur * 0.3 }, xs);
          tl.to(stepDotRefs[i].current, { scale: 0.5, backgroundColor: 'rgba(0,0,0,0.15)', duration: exitDur * 0.3 }, xs);
        }
      });

      // ── Vertical progress line grows ────────────────────────────────────────
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' });
      tl.to(lineRef.current, { scaleY: 1, duration: 0.88 }, 0.08);

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const isMobile = useIsMobile();

  return (
    <section id="sec-process" ref={containerRef} style={{ background: C.base, height: '520vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        <SectionTag name="process" />

        {/* ── Left rail ─────────────────────────────────────────────────── */}
        <div style={{ width: isMobile ? 80 : 'clamp(200px, 22vw, 280px)', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 0 0 24px' : '0 0 0 48px', position: 'relative', zIndex: 3 }}>
          <div ref={badgeRef}>
            <Badge n="05" label="The Process" />
          </div>

          {/* Step list */}
          <div style={{ marginTop: 36, position: 'relative' }}>
            {/* Growing vertical line */}
            <div ref={lineRef} style={{ position: 'absolute', left: 9, top: 16, bottom: 16, width: 1, background: `linear-gradient(to bottom, ${C.accent}, #4A90D9, #A78BFA)`, borderRadius: 1, transformOrigin: 'top' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {PHASES.map((ph, i) => (
                <div key={i} ref={stepRefs[i]} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                  <div ref={stepDotRefs[i]} style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${ph.color}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ph.color }} />
                  </div>
                  {!isMobile && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500, color: C.charcoal, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ph.label.replace('\n', ' ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main stage ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Section heading — fades out as phases take over */}
          <div ref={headRef} style={{ position: 'absolute', top: '10%', left: isMobile ? 24 : 48, zIndex: 3, pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.charcoal}`, WebkitTextFillColor: 'transparent', display: 'block' }}>
              human-in-the-loop
            </span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.charcoal, display: 'block' }}>
              R&D
            </span>
          </div>

          {/* ── Per-phase panels ─────────────────────────────────────────── */}
          {PHASES.map((ph, i) => (
            <div key={i} ref={phaseRefs[i]} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 24px 0 24px' : '0 60px 0 48px', pointerEvents: 'none' }}>

              {/* Glow orb */}
              <div ref={orbRefs[i]} style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 'clamp(280px, 45vw, 600px)', height: 'clamp(280px, 45vw, 600px)', borderRadius: '50%', background: `radial-gradient(circle at 40% 40%, ${ph.glow}22 0%, ${ph.glow}06 50%, transparent 72%)`, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

              {/* Ghost number — background */}
              <div ref={numRefs[i]} style={{ position: 'absolute', right: isMobile ? '-0.08em' : '-0.04em', top: '50%', transform: 'translateY(-54%)', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? '52vw' : '38vw', color: `${ph.glow}09`, lineHeight: 1, userSelect: 'none', zIndex: 0, letterSpacing: '-0.06em' }}>
                {ph.num}
              </div>

              {/* Phase content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Phase number chip */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                  <div style={{ width: 32, height: 1.5, background: ph.color, borderRadius: 1 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ph.color }}>phase {ph.num}</span>
                </div>

                {/* Label — clip-path curtain reveal */}
                <div ref={labelRefs[i]} style={{ overflow: 'visible', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? 'clamp(2.4rem, 10vw, 4rem)' : 'clamp(3.5rem, 7vw, 7.5rem)', letterSpacing: '-0.04em', lineHeight: 1.0, textTransform: 'lowercase', color: C.charcoal, margin: 0, whiteSpace: 'pre-line' }}>
                    {ph.label}
                  </h2>
                </div>

                {/* Description */}
                <div ref={descRefs[i]} style={{ maxWidth: 480 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '0.85rem' : '1rem', color: 'rgba(10,14,26,0.55)', lineHeight: 1.8, margin: 0 }}>
                    {ph.sub}
                  </p>
                  {/* Accent underline */}
                  <div style={{ marginTop: 24, width: 48, height: 2, background: ph.color, borderRadius: 1 }} />
                </div>
              </div>
            </div>
          ))}
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
const GAP = 28;

const ShowCard = ({ card, index, isActive = true, fullWidth = false }: { card: typeof CARDS[0]; index: number; isActive?: boolean; fullWidth?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const rxS = useSpring(rx, { stiffness: 220, damping: 28 });
  const ryS = useSpring(ry, { stiffness: 220, damping: 28 });
  const onMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !isActive) return;
    const r = cardRef.current.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); setHovered(false); };
  return (
    <motion.div
      animate={{ opacity: fullWidth ? 1 : (isActive ? 1 : 0.3), scale: fullWidth ? 1 : (isActive ? 1 : 0.93) }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      style={{ width: fullWidth ? '100%' : CARD_W, flexShrink: 0 }}
    >
      <div style={{ perspective: 1000 }}>
        <motion.div ref={cardRef} onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={onLeave}
          style={{ rotateX: rxS, rotateY: ryS, background: C.mid, borderRadius: 56, padding: '52px 44px', height: fullWidth ? 'auto' : 470, minHeight: fullWidth ? 300 : undefined, display: 'flex', flexDirection: 'column', border: `1px solid ${hovered && isActive ? card.color : 'rgba(255,255,255,0.06)'}`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
        >
          <motion.div style={{ position: 'absolute', top: -20, right: -20, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${card.color}25 0%, transparent 70%)`, filter: 'blur(40px)' }}
            animate={{ scale: hovered && isActive ? 1.5 : 1, opacity: hovered && isActive ? 1 : 0.3 }} transition={{ duration: 0.45 }}
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
    </motion.div>
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

const PAIRS = [
  [PEOPLE[0],  PEOPLE[1]],
  [PEOPLE[2],  PEOPLE[3]],
  [PEOPLE[4],  PEOPLE[5]],
  [PEOPLE[6],  PEOPLE[7]],
  [PEOPLE[8],  PEOPLE[9]],
  [PEOPLE[10], PEOPLE[11]],
] as const;

const PAIR_WIN = [
  [0.04, 0.09, 0.16, 0.21],
  [0.21, 0.26, 0.33, 0.38],
  [0.38, 0.43, 0.50, 0.55],
  [0.55, 0.60, 0.67, 0.72],
  [0.72, 0.77, 0.84, 0.89],
  [0.89, 0.94, 0.98, 1.00],
];

const RolePairCard = ({ person, isMobile }: { person: typeof PEOPLE[0]; isMobile: boolean }) => {
  const c = DEPT_COLORS[person.dept];
  return (
    <div style={{ background: 'rgba(10,42,102,0.26)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${c}`, borderRadius: 20, padding: isMobile ? '18px 20px' : '26px 36px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: isMobile ? 8 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 10, color: c, letterSpacing: '0.3em' }}>{person.id}</span>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: isMobile ? '1.05rem' : 'clamp(1.3rem, 2.2vw, 1.85rem)', color: '#fff', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>{person.role}</h3>
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: c, background: `${c}1A`, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0, alignSelf: 'center' }}>{person.dept}</span>
      </div>
      {!isMobile && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, margin: '0 0 14px 0' }}>{person.desc}</p>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {person.skills.map(s => (
          <span key={s} style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, padding: '3px 10px' }}>{s}</span>
        ))}
      </div>
    </div>
  );
};

// kept for legacy mobile usage - not rendered in new layout
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
        borderTop: '1px solid rgba(255,255,255,0.09)',
        position: 'relative',
        background: hovered ? 'rgba(255,199,44,0.08)' : 'rgba(10,42,102,0.18)',
        backdropFilter: 'blur(6px)',
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
        color: DEPT_COLORS[person.dept],
        transition: 'color 0.28s',
      }}>
        {person.id}
      </span>

      {/* Role + dept badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: isMobile ? '0.9rem' : '1rem',
          color: '#fff',
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
          color: 'rgba(255,255,255,0.55)',
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
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.18)',
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
  const sRef    = useRef<HTMLElement>(null);
  const bgRef   = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headRef  = useRef<HTMLDivElement>(null);
  const lineRef  = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const pairRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const role1Refs = useRef<(HTMLDivElement | null)[]>([]);
  const role2Refs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Background parallax ──────────────────────────────────────────────
      gsap.fromTo(bgRef.current, { y: '-8%' }, {
        y: '8%', ease: 'none',
        scrollTrigger: { trigger: sRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });

      // ── Main scroll timeline ─────────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.8 },
        defaults: { ease: 'none' },
      });

      // Entry
      gsap.set([badgeRef.current, headRef.current], { y: 52, opacity: 0 });
      tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 0.04 }, 0);
      tl.to(headRef.current,  { y: 0, opacity: 1, duration: 0.04 }, 0.015);

      // Progress line grows top → bottom over entire scroll
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' });
      tl.to(lineRef.current, { scaleY: 1, duration: 0.92 }, 0.04);

      // ── Per-pair animations ──────────────────────────────────────────────
      PAIRS.forEach((pair, i) => {
        const [es, ee, xs, xe] = PAIR_WIN[i];
        const eD = ee - es;
        const xD = xe - xs;
        const pairColor = DEPT_COLORS[pair[0].dept];

        gsap.set(pairRefs.current[i],  { opacity: 0 });
        gsap.set(role1Refs.current[i], { x: -60, opacity: 0 });
        gsap.set(role2Refs.current[i], { x:  60, opacity: 0 });
        gsap.set(ghostRefs.current[i], { scale: 1.22, opacity: 0 });
        gsap.set(dotRefs.current[i * 2],     { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65 });
        gsap.set(dotRefs.current[i * 2 + 1], { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65 });

        // Enter
        tl.to(pairRefs.current[i],  { opacity: 1, duration: eD * 0.2 }, es);
        tl.to(ghostRefs.current[i], { scale: 1, opacity: 1, duration: eD * 0.75, ease: 'power2.out' }, es);
        tl.to(role1Refs.current[i], { x: 0, opacity: 1, duration: eD * 0.65, ease: 'power3.out' }, es + eD * 0.12);
        tl.to(role2Refs.current[i], { x: 0, opacity: 1, duration: eD * 0.65, ease: 'power3.out' }, es + eD * 0.30);
        tl.to(dotRefs.current[i * 2],     { backgroundColor: pairColor, scale: 1.25, duration: eD * 0.3 }, es + eD * 0.12);
        tl.to(dotRefs.current[i * 2 + 1], { backgroundColor: pairColor, scale: 1.25, duration: eD * 0.3 }, es + eD * 0.30);

        // Exit (skip for last pair)
        if (xs < 0.97) {
          tl.to(role1Refs.current[i], { x: -48, opacity: 0, duration: xD * 0.5, ease: 'power2.in' }, xs);
          tl.to(role2Refs.current[i], { x:  48, opacity: 0, duration: xD * 0.5, ease: 'power2.in' }, xs + xD * 0.12);
          tl.to(ghostRefs.current[i], { scale: 0.82, opacity: 0, duration: xD * 0.55 }, xs);
          tl.to(pairRefs.current[i],  { opacity: 0, duration: xD * 0.12 }, xs + xD * 0.88);
          tl.to(dotRefs.current[i * 2],     { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65, duration: xD * 0.3 }, xs);
          tl.to(dotRefs.current[i * 2 + 1], { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65, duration: xD * 0.3 }, xs + xD * 0.1);
        }
      });
    }, sRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="sec-people" ref={sRef} style={{ background: C.charcoal, height: '750vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        <SectionTag name="our people" />

        {/* Background */}
        <div ref={bgRef} style={{ position: 'absolute', inset: '-12%', zIndex: 0, pointerEvents: 'none', willChange: 'transform' }}>
          <img src="/bg_tech_towers.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(100deg, ${C.charcoal} 0%, ${C.charcoal}F0 30%, ${C.charcoal}BB 55%, ${C.charcoal}77 75%, ${C.charcoal}44 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to bottom, ${C.charcoal} 0%, transparent 8%, transparent 92%, ${C.charcoal} 100%)` }} />

        {/* ── Left rail ────────────────────────────────────────────────────── */}
        <div style={{ width: isMobile ? 72 : 'clamp(190px, 21vw, 270px)', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 0 0 20px' : '0 0 0 48px', position: 'relative', zIndex: 3 }}>
          <div ref={badgeRef}>
            <Badge n="07" label="Our People" />
          </div>

          <div style={{ marginTop: 32, position: 'relative' }}>
            {/* Growing progress line */}
            <div ref={lineRef} style={{ position: 'absolute', left: 8, top: 10, bottom: 10, width: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {PEOPLE.map((person, i) => (
                <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: i % 2 === 0 ? '9px 0 4px 0' : '4px 0 9px 0' }}>
                  <div
                    ref={el => { dotRefs.current[i] = el; }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${DEPT_COLORS[person.dept]}55`, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                  {!isMobile && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {person.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main stage ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 2 }}>
          {/* Section heading — entry state, fades out once pairs begin */}
          <div ref={headRef} style={{ position: 'absolute', top: '10%', left: isMobile ? 20 : 48, zIndex: 3, pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.base}`, WebkitTextFillColor: 'transparent', display: 'block' }}>the</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.base, display: 'block' }}>people</span>
          </div>

          {/* ── Pair panels ──────────────────────────────────────────────── */}
          {PAIRS.map((pair, i) => {
            const pairColor = DEPT_COLORS[pair[0].dept];
            return (
              <div key={i} ref={el => { pairRefs.current[i] = el; }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 20px' : '0 48px', gap: 16, pointerEvents: 'none' }}
              >
                {/* Ghost dept text */}
                <div ref={el => { ghostRefs.current[i] = el; }}
                  style={{ position: 'absolute', right: '-0.04em', top: '50%', transform: 'translateY(-52%)', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? '52vw' : '34vw', color: `${pairColor}07`, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.06em', zIndex: 0, pointerEvents: 'none' }}
                >
                  {pair[0].dept.toUpperCase()}
                </div>

                {/* Role cards — left / right split */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 14 : 24, alignItems: 'flex-start' }}>
                  <div ref={el => { role1Refs.current[i] = el; }} style={{ flex: 1, minWidth: 0 }}>
                    <RolePairCard person={pair[0]} isMobile={isMobile} />
                  </div>
                  <div ref={el => { role2Refs.current[i] = el; }} style={{ flex: 1, minWidth: 0 }}>
                    <RolePairCard person={pair[1]} isMobile={isMobile} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── CHAPTERS ──────────────────────────────────────────────────────────────────
const CHAPTERS = [
  { num: '2021', id: 'sec-ch1', tag: 'The Beginning', title: '2021', sub: 'Where it all started',                color: '#FFC72C',
    body: 'Placeholder — content covering Phitopolis\'s founding year will live here. The vision, the first team members, and the early decisions that set the direction for everything that followed.' },
  { num: '2022', id: 'sec-ch2', tag: 'Taking Shape',  title: '2022', sub: 'Building the foundation',             color: '#60A5FA',
    body: 'Placeholder — content covering 2022\'s milestones will live here. Early client engagements, team growth, and the first solutions that proved the model worked.' },
  { num: '2023', id: 'sec-ch3', tag: 'Momentum',      title: '2023', sub: 'Accelerating the mission',            color: '#34D399',
    body: 'Placeholder — content covering 2023\'s growth will live here. Expanded capabilities, deeper partnerships, and the projects that put Phitopolis on the map.' },
  { num: '2024', id: 'sec-ch4', tag: 'Scaling Up',    title: '2024', sub: 'Reaching new heights',                color: '#A78BFA',
    body: 'Placeholder — content covering 2024\'s expansion will live here. Larger engagements, new service lines, and a growing team aligned around AI-first delivery.' },
  { num: '2025', id: 'sec-ch5', tag: 'Full Stride',   title: '2025', sub: 'Operating at full capacity',          color: '#F59E0B',
    body: 'Placeholder — content covering 2025\'s achievements will live here. Flagship deployments, measurable client impact, and the refinement of what makes Phitopolis different.' },
  { num: '2026', id: 'sec-ch6', tag: 'AI Day',        title: '2026', sub: 'Five years in, the work continues',   color: '#F472B6',
    body: 'Placeholder — content covering where Phitopolis stands today will live here. Five years of learning, shipping, and building — and a clear view of what comes next.' },
];

const ChapterGroup = () => {
  const containerRef  = useRef<HTMLElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const panelRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef   = useRef<HTMLDivElement>(null);
  const dotRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const yearLabelRef  = useRef<HTMLDivElement>(null);
  const isMobile      = useIsMobile();
  const N = CHAPTERS.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial states — panels 1-5 start hidden off-right ───────────────
      for (let i = 1; i < N; i++) {
        gsap.set(textRefs.current[i], { x: 80, opacity: 0 });
        gsap.set(imgRefs.current[i],  { x: 60, opacity: 0, scale: 0.9 });
      }
      gsap.set(dotRefs.current[0], { backgroundColor: CHAPTERS[0].color, scale: 1.5 });
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left center' });

      // ── Main timeline — drives horizontal track + all content ────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });

      // Horizontal track slides left
      tl.to(trackRef.current, {
        x: () => -(trackRef.current!.scrollWidth - window.innerWidth),
        duration: 1,
      }, 0);

      // Progress bar grows with scroll
      tl.to(progressRef.current, { scaleX: 1, duration: 1 }, 0);

      // Per-panel: text + image enter/exit + dot activation
      CHAPTERS.forEach((ch, i) => {
        const c  = i / (N - 1);  // center position: 0, 0.2, 0.4, 0.6, 0.8, 1
        const eD = 0.08;          // enter duration fraction
        const xD = 0.08;          // exit duration fraction

        // Text: slide in from right (skip first — already visible)
        if (i > 0) {
          tl.to(textRefs.current[i], { x: 0, opacity: 1, duration: eD }, c - eD);
        }
        // Text: slide out to left (skip last — stays visible)
        if (i < N - 1) {
          tl.to(textRefs.current[i], { x: -80, opacity: 0, duration: xD }, c + 0.04);
        }

        // Image: scale + fade in
        if (i > 0) {
          tl.to(imgRefs.current[i], { x: 0, opacity: 1, scale: 1, duration: eD * 1.2 }, c - eD * 1.1);
        }
        // Image: scale + fade out
        if (i < N - 1) {
          tl.to(imgRefs.current[i], { x: -60, opacity: 0, scale: 0.9, duration: xD }, c + 0.05);
        }

        // Year label updates (immediate snap at panel center)
        if (i > 0) {
          tl.to(yearLabelRef.current, { opacity: 0, duration: 0.02 }, c - 0.03);
          tl.call(() => {
            if (yearLabelRef.current) yearLabelRef.current.textContent = ch.num;
          }, [], c - 0.01);
          tl.to(yearLabelRef.current, { opacity: 1, duration: 0.02 }, c);
        }

        // Dots: illuminate active, dim previous
        if (i > 0) {
          tl.to(dotRefs.current[i],     { backgroundColor: ch.color, scale: 1.5, duration: 0.04 }, c - 0.02);
          tl.to(dotRefs.current[i - 1], { backgroundColor: 'rgba(255,255,255,0.12)', scale: 1, duration: 0.04 }, c - 0.02);
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="sec-timeline" ref={containerRef}
      style={{ height: '700vh', position: 'relative', background: C.charcoal }}
    >
      <SectionTag name="our journey" />

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Top/bottom edge fades */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', background: `linear-gradient(to bottom, ${C.charcoal} 0%, transparent 5%, transparent 92%, ${C.charcoal} 100%)` }} />

        {/* ── Horizontal track ─────────────────────────────────────────────── */}
        <div ref={trackRef} style={{
          display: 'flex',
          width: `${N * 100}vw`,
          height: '100%',
          willChange: 'transform',
        }}>
          {CHAPTERS.map((ch, i) => (
            <div key={ch.id} ref={el => { panelRefs.current[i] = el; }}
              style={{
                width: '100vw', height: '100%', flexShrink: 0, position: 'relative',
                display: 'flex', alignItems: 'center',
                padding: isMobile ? '80px 24px 120px' : `0 clamp(48px, 6vw, 96px)`,
                overflow: 'hidden',
              }}
            >
              {/* Per-panel ambient glow */}
              <div style={{
                position: 'absolute', width: '58vw', height: '58vw', borderRadius: '50%',
                background: `radial-gradient(circle, ${ch.color}0B 0%, transparent 68%)`,
                right: '-8vw', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
              }} />

              {/* ── Content row ───────────────────────────────────────────── */}
              <div style={{
                width: '100%', maxWidth: 1400, margin: '0 auto',
                display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center', gap: isMobile ? 44 : 'clamp(48px, 7vw, 88px)',
                position: 'relative', zIndex: 1,
              }}>
                {/* Text block */}
                <div ref={el => { textRefs.current[i] = el; }}
                  style={{ flex: '0 0 auto', width: isMobile ? '100%' : '44%' }}
                >
                  {/* Ghost year */}
                  <div style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: 'clamp(3.5rem, 9vw, 7rem)', color: `${ch.color}10`,
                    lineHeight: 1, letterSpacing: '-0.05em', marginBottom: -4, userSelect: 'none',
                  }}>
                    {ch.num}
                  </div>
                  <Badge n={ch.num} label={ch.tag} />
                  <div style={{ overflow: 'hidden', marginTop: 4 }}>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                      fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', color: C.base,
                      letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, textTransform: 'lowercase',
                    }}>
                      {ch.title}
                    </h2>
                  </div>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)', color: ch.color,
                    margin: '16px 0 0', letterSpacing: '-0.01em',
                  }}>
                    {ch.sub}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.8rem, 1vw, 0.92rem)',
                    color: 'rgba(255,255,255,0.36)', lineHeight: 1.9, margin: '18px 0 0', maxWidth: 440,
                  }}>
                    {ch.body}
                  </p>
                </div>

                {/* Image placeholder */}
                <div ref={el => { imgRefs.current[i] = el; }}
                  style={{
                    flex: 1, minHeight: isMobile ? 220 : 'clamp(300px, 40vh, 480px)',
                    borderRadius: 24, border: `1px dashed ${ch.color}28`,
                    background: `linear-gradient(135deg, ${ch.color}06 0%, transparent 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden', willChange: 'transform',
                  }}
                >
                  {(['tl', 'tr', 'bl', 'br'] as const).map(corner => (
                    <div key={corner} style={{
                      position: 'absolute', width: 22, height: 22,
                      ...(corner.includes('t') ? { top: 18 } : { bottom: 18 }),
                      ...(corner.includes('l') ? { left: 18 } : { right: 18 }),
                      borderTop:    corner.includes('t') ? `1.5px solid ${ch.color}50` : 'none',
                      borderBottom: corner.includes('b') ? `1.5px solid ${ch.color}50` : 'none',
                      borderLeft:   corner.includes('l') ? `1.5px solid ${ch.color}50` : 'none',
                      borderRight:  corner.includes('r') ? `1.5px solid ${ch.color}50` : 'none',
                    }} />
                  ))}
                  <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ opacity: 0.2 }}>
                      <circle cx="26" cy="26" r="11" stroke={ch.color} strokeWidth="1" strokeDasharray="3 4" />
                      <line x1="26" y1="2"  x2="26" y2="15" stroke={ch.color} strokeWidth="1" />
                      <line x1="26" y1="37" x2="26" y2="50" stroke={ch.color} strokeWidth="1" />
                      <line x1="2"  y1="26" x2="15" y2="26" stroke={ch.color} strokeWidth="1" />
                      <line x1="37" y1="26" x2="50" y2="26" stroke={ch.color} strokeWidth="1" />
                    </svg>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.28em',
                      textTransform: 'uppercase', color: ch.color, opacity: 0.28, marginTop: 12,
                    }}>
                      asset pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom timeline nav ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 32, left: 0, right: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          pointerEvents: 'none',
        }}>
          {/* Active year label */}
          <div ref={yearLabelRef} style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800,
            fontSize: isMobile ? '0.9rem' : '1.05rem', color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.06em', marginBottom: 4,
          }}>
            {CHAPTERS[0].num}
          </div>

          {/* Year dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 18 : 32 }}>
            {CHAPTERS.map((ch, i) => (
              <div key={ch.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div ref={el => { dotRefs.current[i] = el; }}
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}
                />
                {!isMobile && (
                  <span style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: 8, color: 'rgba(255,255,255,0.22)',
                    letterSpacing: '0.08em',
                  }}>
                    {ch.num}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Progress track */}
          <div style={{
            width: isMobile ? 180 : 280, height: 1,
            background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden',
          }}>
            <div ref={progressRef} style={{ height: '100%', background: 'rgba(255,255,255,0.28)', transformOrigin: 'left center' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

const Showcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef(null);
  const inView = useInView(leftRef, { once: true, margin: '-60px' });
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 180, damping: 28, mass: 0.8 });
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const isAdvancingRef = useRef(false);

  // Sync track position whenever activeIdx changes
  useEffect(() => {
    x.set(-(activeIdx * (CARD_W + GAP)));
  }, [activeIdx]);

  // Reset to card 0 if the section is re-entered from the top
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v <= 0.015 && activeIdxRef.current !== 0) {
      activeIdxRef.current = 0;
      setActiveIdx(0);
      isAdvancingRef.current = false;
    }
  });

  // Per-card wheel navigation — capture phase runs before SectionTransition's bubble listener
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      // Only intercept while section is in its sticky state
      if (rect.top > 2 || rect.bottom < window.innerHeight - 2) return;

      const dir = Math.sign(e.deltaY);
      if (dir === 0) return;
      const cur = activeIdxRef.current;

      if (dir > 0 && cur < CARDS.length - 1) {
        e.preventDefault();
        if (isAdvancingRef.current) return;
        isAdvancingRef.current = true;
        const next = cur + 1;
        activeIdxRef.current = next;
        setActiveIdx(next);
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo({ top: sec.offsetTop + (next / (CARDS.length - 1)) * scrollable, behavior: 'smooth' });
        setTimeout(() => { isAdvancingRef.current = false; }, 700);
      } else if (dir < 0 && cur > 0) {
        e.preventDefault();
        if (isAdvancingRef.current) return;
        isAdvancingRef.current = true;
        const prev = cur - 1;
        activeIdxRef.current = prev;
        setActiveIdx(prev);
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo({ top: sec.offsetTop + (prev / (CARDS.length - 1)) * scrollable, behavior: 'smooth' });
        setTimeout(() => { isAdvancingRef.current = false; }, 700);
      }
      // At first/last card: don't preventDefault → SectionTransition handles section navigation
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const activeCard = CARDS[activeIdx];

  if (isMobile) {
    return (
      <section id="sec-showcase" style={{ background: C.base, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 24px', position: 'relative' }}>
        <SectionTag name="showcase" />
        <div ref={leftRef}>
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
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        <SectionTag name="showcase" />

        {/* ── Left panel: heading + card meta + progress ── */}
        <motion.div ref={leftRef}
          initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}
          style={{ width: 'clamp(280px, 34vw, 440px)', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px', borderRight: '1px solid rgba(0,0,0,0.06)', position: 'relative', zIndex: 2 }}
        >
          <Badge n="06" label="Innovation Hub" />
          <SplitHeading outline="ai projects" solid="at work" inView={inView} color={C.charcoal} fontSize="clamp(1.9rem, 2.8vw, 3rem)" />

          {/* Current card details */}
          <AnimatePresence mode="wait">
            <motion.div key={activeIdx}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              style={{ marginTop: 32 }}
            >
              <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 100, background: `${activeCard.color}18`, color: activeCard.color, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
                {activeCard.tag}
              </span>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1rem, 1.5vw, 1.45rem)', color: C.charcoal, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.015em' }}>
                {activeCard.label}
              </h3>
              <p style={{ color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', lineHeight: 1.75 }}>
                {activeCard.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Counter + dots + scroll bar */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', color: C.charcoal, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {String(activeIdx + 1).padStart(2, '0')}
              </span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '1rem', color: C.muted }}>
                / {String(CARDS.length).padStart(2, '0')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {CARDS.map((_, i) => (
                <div key={i} style={{ height: 4, borderRadius: 2, background: i === activeIdx ? activeCard.color : 'rgba(0,0,0,0.12)', transition: 'width 0.35s ease, background 0.35s ease', width: i === activeIdx ? 28 : 6 }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: C.muted, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>scroll to explore</span>
              <div style={{ flex: 1, height: 1.5, background: 'rgba(0,0,0,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', background: C.accent, scaleX: scrollYProgress, transformOrigin: 'left' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Right panel: card track ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 40px 0 52px' }}>
          <motion.div style={{ x: xSpring, display: 'flex', gap: GAP, willChange: 'transform' }}>
            {CARDS.map((card, i) => <ShowCard key={i} card={card} index={i} isActive={i === activeIdx} />)}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── CLOSING CTA ───────────────────────────────────────────────────────────────
const Closing = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="sec-closing" ref={ref} style={{ background: C.charcoal, minHeight: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
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
  const [ready, setReady] = useState(false);
  const handlePreloaderComplete = useCallback(() => setReady(true), []);
  useEffect(() => {
    document.title = 'Phitopolis | AI Day 2026';
    document.body.style.cursor = 'none';
    document.body.style.backgroundColor = C.charcoal;

    // Hide scrollbar — navigation is handled via wheel interceptor
    const style = document.createElement('style');
    style.id = 'ai-day-scroll';
    style.textContent = `
      html::-webkit-scrollbar { display: none; }
      html { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.cursor = '';
      document.body.style.backgroundColor = '';
      document.getElementById('ai-day-scroll')?.remove();
    };
  }, []);

  return (
    <>
      <GrainOverlay />
      <Preloader onComplete={handlePreloaderComplete} />
      <div>
        <ScrollProgressBar />
        <CustomCursor />
        <SectionTransition />
        <FloatNav />
        <Hero ready={ready} />
        <Statement />
        <Vision />
        <MarqueeSection />
        <ServicesScrollStory />
        <TechStack />
        <Stats />
        <Process />
        <OurPeople />
        <ChapterGroup />
        <Showcase />
        <Closing />
      </div>
    </>
  );
}
