
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [onLight, setOnLight] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX); my.set(e.clientY);
      // detect background under cursor
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      let light = false;
      for (const el of els) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          // parse rgb values
          const m = bg.match(/\d+/g);
          if (m) {
            const brightness = (parseInt(m[0]) * 299 + parseInt(m[1]) * 587 + parseInt(m[2]) * 114) / 1000;
            light = brightness > 160;
          }
          break;
        }
      }
      setOnLight(light);
    };
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

  const cursorColor = onLight ? C.charcoal : C.accent;

  return (
    <>
      {/* Main dot — instant tracking, no delay */}
      <motion.div
        animate={{
          width:   variant === 'hover' ? 14 : 7,
          height:  variant === 'hover' ? 14 : 7,
          opacity: variant === 'drag'  ? 0  : 1,
          background: cursorColor,
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

// ── SUB-SECTION SNAP — wheel/touch/key snapping within Values & Services ──────
const SUB_SNAP_SECTIONS: Record<string, number[]> = {
};

const SubSectionSnap = () => {
  useEffect(() => {
    const locked = { current: false };
    let touchStartY = 0;

    const sectionProgress = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const max = el.offsetHeight - window.innerHeight;
      return max > 0 ? Math.max(0, Math.min(1, (window.scrollY - el.offsetTop) / max)) : 1;
    };

    // Returns which snap section the user is currently scrolled within, or null
    const activeSnapId = (): string | null => {
      for (const id of Object.keys(SUB_SNAP_SECTIONS)) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight - window.innerHeight;
        if (window.scrollY >= top - 50 && window.scrollY <= bottom + 50) return id;
      }
      return null;
    };

    const snapTo = (id: string, dir: 1 | -1) => {
      if (locked.current) return;
      const p = sectionProgress(id);
      const snaps = SUB_SNAP_SECTIONS[id];
      const target = dir > 0
        ? snaps.find(s => s > p + 0.05)
        : [...snaps].reverse().find(s => s < p - 0.05);
      if (target === undefined) return;
      const el = document.getElementById(id);
      if (!el) return;
      locked.current = true;
      window.scrollTo({ top: el.offsetTop + (el.offsetHeight - window.innerHeight) * target, behavior: 'smooth' });
      setTimeout(() => { locked.current = false; }, 900);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;
      const id = activeSnapId();
      if (!id) return;
      if (locked.current) return;
      e.preventDefault();
      snapTo(id, e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 60) return;
      const id = activeSnapId();
      if (!id) return;
      snapTo(id, diff > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      const id = activeSnapId();
      if (!id) return;
      const isDown = ['ArrowDown', 'PageDown'].includes(e.key);
      const isUp   = ['ArrowUp',   'PageUp'  ].includes(e.key);
      if (!isDown && !isUp) return;
      e.preventDefault();
      snapTo(id, isDown ? 1 : -1);
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
    };
  }, []);

  return null;
};

// ── FLOATING STRING ───────────────────────────────────────────────────────────
const FloatingString = ({ years, scrollProgressRef }: { years: string[]; scrollProgressRef: React.MutableRefObject<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    let rawCursorY = window.innerHeight / 2;
    let springY   = window.innerHeight / 2;
    let springVel = 0;
    let idlePhase     = 0;
    let lastMoveTime  = performance.now();

    // Ring buffer
    const HISTORY = 180;
    const TRAVEL_FRAMES = 36;
    const cursorHistory = new Float32Array(HISTORY).fill(0);
    let histHead = 0;

    // Per-year smooth dot progresses (1 = right end, 0 = left end)
    const N = years.length;
    const chapterSpan = 1 / Math.max(1, N - 1);
    const smoothProgresses = new Float32Array(N).fill(1);
    const entryTimes = new Array<number>(N).fill(-1); // -1 = not entered yet

    const onMouseMove = (e: MouseEvent) => { rawCursorY = e.clientY; lastMoveTime = performance.now(); };
    window.addEventListener('mousemove', onMouseMove);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Helper: sample string Y at a given progress value
    const sampleY = (tp: number, centerY: number) => {
      const delay  = (1 - tp) * TRAVEL_FRAMES;
      const dFloor = Math.floor(delay);
      const dFrac  = delay - dFloor;
      const iA     = (histHead - 1 - dFloor     + HISTORY * 4) % HISTORY;
      const iB     = (histHead - 1 - dFloor - 1 + HISTORY * 4) % HISTORY;
      const disp   = cursorHistory[iA] * (1 - dFrac) + cursorHistory[iB] * dFrac;
      const taper  = 0.2 + 0.8 * tp;
      return centerY + disp * taper;
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Idle oscillation: fades in after 0.8s of no cursor movement
      const idleElapsed = performance.now() - lastMoveTime;
      const idleFactor  = Math.min(1, Math.max(0, (idleElapsed - 800) / 600));
      idlePhase += 0.022; // oscillation speed
      const idleOffset = Math.sin(idlePhase) * 100 * idleFactor;

      // Spring physics — follows cursor + idle bob
      springVel += (rawCursorY + idleOffset - springY) * 0.055;
      springVel *= 0.82;
      springY   += springVel;
      const displace = (springY - window.innerHeight / 2) / (window.innerHeight / 2) * h * 0.42;
      cursorHistory[histHead] = displace;
      histHead = (histHead + 1) % HISTORY;

      const centerY = h / 2;
      const segments = 120;
      const dotR = 3;
      const stringW = w * 0.75 - dotR;

      // Draw string
      const leftDisplace = cursorHistory[(histHead - 1 - TRAVEL_FRAMES + HISTORY * 4) % HISTORY] * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, centerY + leftDisplace);
      let lastY = centerY + leftDisplace;
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments;
        const x = progress * stringW;
        const delay  = (1 - progress) * TRAVEL_FRAMES;
        const dFloor = Math.floor(delay);
        const dFrac  = delay - dFloor;
        const idxA   = (histHead - 1 - dFloor     + HISTORY * 4) % HISTORY;
        const idxB   = (histHead - 1 - dFloor - 1 + HISTORY * 4) % HISTORY;
        const cDisp  = cursorHistory[idxA] * (1 - dFrac) + cursorHistory[idxB] * dFrac;
        const taper  = 0.2 + 0.8 * progress;
        lastY = centerY + cDisp * taper;
        ctx.lineTo(x, lastY);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Permanent dot at right end
      ctx.beginPath();
      ctx.arc(stringW, lastY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();

      // Per-year traveling dots
      const scrollProg = scrollProgressRef.current;
      ctx.font = '11px "Outfit", sans-serif';
      ctx.textBaseline = 'bottom';

      for (let i = 0; i < N; i++) {
        const chapterStart = i * chapterSpan;
        const localProg    = Math.max(0, Math.min(1, (scrollProg - chapterStart) / chapterSpan));
        const target       = 1 - localProg;

        // Chapter not yet reached — reset so it slides in fresh next time
        if (scrollProg < chapterStart - 0.001) {
          smoothProgresses[i] = 1;
          entryTimes[i] = -1;
          continue;
        }

        // Record when this chapter was first entered
        if (entryTimes[i] < 0) entryTimes[i] = performance.now();
        const entryAlpha = Math.min(1, (performance.now() - entryTimes[i]) / 300);

        // Faster lerp when scrolling back (target > current) so it snaps back quickly
        const lerpRate = target > smoothProgresses[i] ? 0.10 : 0.04;
        smoothProgresses[i] += (target - smoothProgresses[i]) * lerpRate;
        const tp      = smoothProgresses[i];
        const travelX = tp * stringW;
        const travelY = sampleY(tp, centerY);

        // Fade in on entry, fade out near left edge
        const alpha = Math.min(tp / 0.12, 1) * entryAlpha;
        if (alpha < 0.01) continue;

        // Hollow dot: fill interior with background to mask the string, then stroke
        ctx.beginPath();
        ctx.arc(travelX, travelY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,42,102,${alpha.toFixed(3)})`; // C.charcoal bg
        ctx.fill();
        ctx.strokeStyle = `rgba(255,199,44,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = `rgba(255,199,44,${(0.9 * alpha).toFixed(3)})`;
        const lw = ctx.measureText(years[i]).width;
        ctx.fillText(years[i], travelX - lw / 2, travelY - dotR - 4);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouseMove); };
  }, []);

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

// ── FLOATING SECTION NAV ──────────────────────────────────────────────────────
const FLOAT_SECTIONS = [
  { id: 'sec-hero',      label: 'Intro' },
  { id: 'sec-statement', label: 'Story' },
  { id: 'sec-process',   label: 'Values' },
  { id: 'sec-services',  label: 'Services' },
  { id: 'sec-techstack', label: 'Tech Stack' },
  { id: 'sec-people',    label: 'People' },
  { id: 'sec-vision',    label: 'Vision' },
  { id: 'sec-timeline',  label: '2021–2026' },
  { id: 'sec-end',       label: 'End' },
];

const FloatNav = () => {
  const [active, setActive] = useState('sec-hero');
  const [onLight, setOnLight] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) return;
    const update = () => {
      const mid = window.scrollY + window.innerHeight * 0.45;
      let cur = FLOAT_SECTIONS[0].id;
      for (const s of FLOAT_SECTIONS) { const el = document.getElementById(s.id); if (el && el.offsetParent !== null && el.offsetTop <= mid) cur = s.id; }
      setActive(cur);
      // detect background brightness behind nav dots
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const els = document.elementsFromPoint(x, y);
        let light = false;
        for (const el of els) {
          if (el === navRef.current || navRef.current.contains(el)) continue;
          const bg = getComputedStyle(el).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            const m = bg.match(/\d+/g);
            if (m) {
              const brightness = (parseInt(m[0]) * 299 + parseInt(m[1]) * 587 + parseInt(m[2]) * 114) / 1000;
              light = brightness > 160;
            }
            break;
          }
        }
        setOnLight(light);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [isMobile]);
  if (isMobile) return null;
  const activeColor = onLight ? C.charcoal : C.accent;
  const inactiveColor = onLight ? 'rgba(10,42,102,0.25)' : 'rgba(255,199,44,0.28)';
  return (
    <div ref={navRef} style={{ position: 'fixed', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {FLOAT_SECTIONS.map(s => (
        <motion.button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
          whileHover={{ scale: 1.6 }} title={s.label}
          style={{ width: active === s.id ? 10 : 6, height: active === s.id ? 10 : 6, borderRadius: '50%', background: active === s.id ? activeColor : inactiveColor, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
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

const MarqueeSection = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bandRef.current || !wrapRef.current) return;
    gsap.set(bandRef.current, { scale: 2, rotate: -3 });
    const tl = gsap.to(bandRef.current, {
      scale: 1.25,
      rotate: -3,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: wrapRef.current,
        start: 'top 60%',
        end: 'top 20%',
        scrub: 0.6,
      },
    });
    return () => { tl.scrollTrigger?.kill(); };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', zIndex: 10, background: `linear-gradient(to bottom, ${C.base} 50%, ${C.charcoal} 50%)` }}>
      <div ref={bandRef} style={{ background: C.accent, padding: '48px 0', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', transformOrigin: 'center center' }}>
        <SectionTag name="marquee" dark />
        <MarqueeTrack items={MARQUEE_ROW1} basePPS={85} />
        <MarqueeTrack items={MARQUEE_ROW2} basePPS={70} reverse />
      </div>
    </div>
  );
};

// ── TECH STACK MARQUEE ────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  ai:    '#FFC72C',
  dev:   '#A78BFA',
  infra: '#60A5FA',
  data:  '#34D399',
};

// Simple Icons slugs — https://simpleicons.org (verified working)
const SI: Record<string, string> = {
  'Anthropic Claude':  'anthropic',
  'LangChain':         'langchain',
  'Hugging Face':      'huggingface',
  'PyTorch':           'pytorch',
  'TensorFlow':        'tensorflow',
  'Ollama':            'ollama',
  'CrewAI':            'crewai',
  'MLflow':            'mlflow',
  'Weights & Biases':  'weightsandbiases',
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
  'Airflow':           'apacheairflow',
  // Languages & Frameworks
  'Go':            'go',
  'Rust':          'rust',
  'Java':          'openjdk',
  'Vue.js':        'vuedotjs',
  'Angular':       'angular',
  'Svelte':        'svelte',
  'Django':        'django',
  'Spring Boot':   'springboot',
  'Flutter':       'flutter',
  'Laravel':       'laravel',
  '.NET':          'dotnet',
  // Additional Cloud & Infra
  'AWS':           'amazonaws',
  'Azure':         'microsoftazure',
  'GitHub Actions':'githubactions',
  'Ansible':       'ansible',
  // Additional Data & Storage
  'Elasticsearch': 'elasticsearch',
  'Cassandra':     'apachecassandra',
  'ClickHouse':    'clickhouse',
  'dbt':           'dbt',
  'RabbitMQ':      'rabbitmq',
  'Supabase':      'supabase',
  'Firebase':      'firebase',
  'DynamoDB':      'amazondynamodb',
  // Additional AI / ML
  'OpenAI':        'openai',
  'Jupyter':       'jupyter',
  'ONNX':          'onnx',
  'Pandas':        'pandas',
  'NumPy':         'numpy',
  // Additional Languages & Frameworks
  'JavaScript':    'javascript',
  'Express.js':    'express',
  'React Native':  'reactnative',
  'Swift':         'swift',
  'Kotlin':        'kotlin',
  'Vite':          'vitedotjs',
  'NestJS':        'nestjs',
  'Tailwind CSS':  'tailwindcss',
  // Additional Cloud & Infra
  'Datadog':       'datadog',
  'Helm':          'helm',
  'Sentry':        'sentry',
  // Additional Data & Storage
  'MySQL':         'mysql',
  'Neo4j':         'neo4j',
  'BigQuery':      'googlebigquery',
};

const TECH_ROW1 = [
  { name: 'Anthropic Claude', cat: 'ai' }, { name: 'Docker', cat: 'infra' }, { name: 'PostgreSQL', cat: 'data' }, { name: 'JavaScript', cat: 'dev' },
  { name: 'LangChain', cat: 'ai' }, { name: 'Kubernetes', cat: 'infra' }, { name: 'Redis', cat: 'data' }, { name: 'Express.js', cat: 'dev' },
  { name: 'Hugging Face', cat: 'ai' }, { name: 'Terraform', cat: 'infra' }, { name: 'MongoDB', cat: 'data' }, { name: 'Vue.js', cat: 'dev' },
  { name: 'PyTorch', cat: 'ai' }, { name: 'GCP', cat: 'infra' }, { name: 'Kafka', cat: 'data' }, { name: 'Angular', cat: 'dev' },
  { name: 'TensorFlow', cat: 'ai' }, { name: 'Nginx', cat: 'infra' }, { name: 'Snowflake', cat: 'data' }, { name: 'Svelte', cat: 'dev' },
  { name: 'Django', cat: 'dev' }, { name: 'Prometheus', cat: 'infra' }, { name: 'Apache Spark', cat: 'data' }, { name: 'Laravel', cat: 'dev' },
];

const TECH_ROW2 = [
  { name: 'Ollama', cat: 'ai' }, { name: 'AWS', cat: 'infra' }, { name: 'Airflow', cat: 'data' }, { name: 'Python', cat: 'dev' },
  { name: 'CrewAI', cat: 'ai' }, { name: 'Azure', cat: 'infra' }, { name: 'Elasticsearch', cat: 'data' }, { name: 'FastAPI', cat: 'dev' },
  { name: 'MLflow', cat: 'ai' }, { name: 'GitHub Actions', cat: 'infra' }, { name: 'Cassandra', cat: 'data' }, { name: 'Node.js', cat: 'dev' },
  { name: 'Weights & Biases', cat: 'ai' }, { name: 'Ansible', cat: 'infra' }, { name: 'ClickHouse', cat: 'data' }, { name: 'React', cat: 'dev' },
  { name: 'OpenAI', cat: 'ai' }, { name: 'Grafana', cat: 'infra' }, { name: 'dbt', cat: 'data' }, { name: 'TypeScript', cat: 'dev' },
  { name: 'Datadog', cat: 'infra' }, { name: 'RabbitMQ', cat: 'data' }, { name: 'Celery', cat: 'dev' }, { name: 'Spring Boot', cat: 'dev' },
  { name: '.NET', cat: 'dev' },
];

const TECH_ROW3 = [
  { name: 'Jupyter', cat: 'ai' }, { name: 'Helm', cat: 'infra' }, { name: 'Supabase', cat: 'data' }, { name: 'Next.js', cat: 'dev' },
  { name: 'ONNX', cat: 'ai' }, { name: 'Sentry', cat: 'infra' }, { name: 'Firebase', cat: 'data' }, { name: 'GraphQL', cat: 'dev' },
  { name: 'Pandas', cat: 'ai' }, { name: 'DynamoDB', cat: 'data' }, { name: 'React Native', cat: 'dev' },
  { name: 'NumPy', cat: 'ai' }, { name: 'MySQL', cat: 'data' }, { name: 'Vite', cat: 'dev' },
  { name: 'scikit-learn', cat: 'ai' }, { name: 'Neo4j', cat: 'data' }, { name: 'NestJS', cat: 'dev' },
  { name: 'BigQuery', cat: 'data' }, { name: 'Tailwind CSS', cat: 'dev' },
  { name: 'Go', cat: 'dev' }, { name: 'Rust', cat: 'dev' },
  { name: 'Java', cat: 'dev' }, { name: 'Swift', cat: 'dev' },
  { name: 'Kotlin', cat: 'dev' }, { name: 'Flutter', cat: 'dev' }
];

// Individual item — flat logo + text, no pill container
const TechPill = React.memo(({ tech, activeCat }: { tech: { name: string; cat: string }; activeCat: string | null }) => {
  const slug = SI[tech.name];
  const [imgOk, setImgOk] = useState(true);
  const showLogo = slug && imgOk;
  const dimmed = activeCat !== null && tech.cat !== activeCat;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, flexShrink: 0, padding: '0 48px', opacity: dimmed ? 0.12 : 1, filter: dimmed ? 'grayscale(1)' : 'none', transition: 'opacity 0.35s ease, filter 0.35s ease' }}>
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

const TechMarqueeTrack = ({ items, basePPS = 55, reverse = false, activeCat = null }: { items: { name: string; cat: string }[]; basePPS?: number; reverse?: boolean; activeCat?: string | null }) => {
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
        {doubled.map((tech, i) => <TechPill key={i} tech={tech} activeCat={activeCat} />)}
      </div>
    </div>
  );
};



const TechStack = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [activeCat, setActiveCat] = useState<string | null>(null);
  return (
    <section id="sec-techstack" ref={ref} style={{ background: C.base, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <SectionTag name="tech stack" />
      {/* Section header — always visible, sits above scatter */}
      <div style={{ paddingLeft: 40, paddingRight: 40, marginBottom: 64, position: 'relative', zIndex: 2 }}>
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
              the full arsenal — from model training and orchestration to deployment, data pipelines, and cloud infrastructure. Every tool chosen deliberately, every stack decision backed by real production experience.
            </motion.p>
          </div>
          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 36, flexWrap: 'wrap' }}
          >
            {Object.entries({ 'AI / ML': 'ai', 'Languages & Frameworks': 'dev', 'Cloud & Infra': 'infra', 'Data & Storage': 'data' }).map(([label, cat]) => (
              <button key={cat} onClick={() => setActiveCat(prev => prev === cat ? null : cat)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: activeCat === cat ? CAT_COLORS[cat] : (activeCat ? 'rgba(0,0,0,0.2)' : CAT_COLORS[cat]), transition: 'background 0.3s' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: activeCat === cat ? CAT_COLORS[cat] : (activeCat ? 'rgba(0,0,0,0.3)' : C.muted), letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: activeCat === cat ? 700 : 500, transition: 'color 0.3s' }}>{label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Marquee rows (always visible, pills dim when filter active) */}
      <motion.div key="marquee"
        style={{ display: 'flex', flexDirection: 'column', gap: 36 }}
      >
        <TechMarqueeTrack items={TECH_ROW1} basePPS={28} activeCat={activeCat} />
        <TechMarqueeTrack items={TECH_ROW2} basePPS={22} reverse activeCat={activeCat} />
        <TechMarqueeTrack items={TECH_ROW3} basePPS={34} activeCat={activeCat} />
      </motion.div>
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
    <section id="sec-stats" ref={ref} style={{ background: C.charcoal, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
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
  const lastInteractionRef = useRef<number>(0);      // last mouse/scroll activity

  // Start assembly countdown once the hero is revealed by the preloader
  useEffect(() => {
    if (ready && assembleStartRef.current === Infinity) {
      assembleStartRef.current = performance.now() + 900;
      // Set initial interaction time so idle timer starts after assembly completes (~3700ms)
      lastInteractionRef.current = performance.now() + 900 + 2200 + 600;
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

    // ── Idle explosion state ──
    const IDLE_TIMEOUT = 5000;          // ms before first idle explosion
    const EXPLODE_DURATION = 1800;      // ms for explosion outward
    const EXPLODE_HOLD = 1200;          // ms to hold scattered
    const REFORM_DURATION = 2000;       // ms for particles to reform
    const REFORM_COOLDOWN = 3000;       // ms to stay assembled before next cycle
    let idlePhase: 'assembled' | 'exploding' | 'holding' | 'reforming' = 'assembled';
    let idlePhaseStart = 0;
    let prevMouseX = -9999;
    let prevMouseY = -9999;
    let idleCluster = new Set<number>();   // indices of particles in current explosion cluster
    const CLUSTER_RADIUS = 80;            // px radius around random center to select particles
    let clickTriggered = false;           // true when explosion was triggered by click (don't cancel on mouse move)

    // Build a cluster of particles near a given target position
    const buildClusterAt = (cx: number, cy: number, radius: number) => {
      const cluster = new Set<number>();
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].tx - cx;
        const dy = particles[i].ty - cy;
        if (dx * dx + dy * dy < radius * radius) {
          cluster.add(i);
        }
      }
      return cluster;
    };

    // Build a cluster around a random particle
    const buildRandomCluster = () => {
      if (particles.length === 0) return new Set<number>();
      const seed = particles[Math.floor(Math.random() * particles.length)];
      return buildClusterAt(seed.tx, seed.ty, CLUSTER_RADIUS);
    };

    // Click handler: explode cluster at click position
    const handleClick = (e: MouseEvent) => {
      if (!assembled || particles.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const cluster = buildClusterAt(cx, cy, CLUSTER_RADIUS);
      if (cluster.size < 5) return; // ignore clicks far from logo
      idleCluster = cluster;
      idlePhase = 'exploding';
      idlePhaseStart = performance.now();
      clickTriggered = true;
    };

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

      // ── Idle explosion detection ──
      // Detect mouse movement (don't cancel click-triggered explosions)
      if (Math.abs(mouse.x - prevMouseX) > 2 || Math.abs(mouse.y - prevMouseY) > 2 || scroll > 0.01) {
        lastInteractionRef.current = now;
        if (idlePhase !== 'assembled' && !clickTriggered) {
          idlePhase = 'assembled';
        }
      }
      prevMouseX = mouse.x;
      prevMouseY = mouse.y;

      // Idle explosion state machine (only when scroll is near top and assembly is complete)
      let idleExplodeStrength = 0;
      const timeSinceInteraction = now - lastInteractionRef.current;
      const assemblyDone = elapsed > ASSEMBLE_DURATION + 600; // all particles arrived

      if (assemblyDone && scroll < 0.01 && lastInteractionRef.current > 0) {
        if (idlePhase === 'assembled' && timeSinceInteraction > IDLE_TIMEOUT) {
          idlePhase = 'exploding';
          idlePhaseStart = now;
          clickTriggered = false;
          idleCluster = buildRandomCluster();
        } else if (idlePhase === 'exploding') {
          const t = (now - idlePhaseStart) / EXPLODE_DURATION;
          if (t >= 1) {
            idlePhase = 'holding';
            idlePhaseStart = now;
            idleExplodeStrength = 1;
          } else {
            // Ease-out cubic for smooth explosion
            idleExplodeStrength = 1 - Math.pow(1 - t, 3);
          }
        } else if (idlePhase === 'holding') {
          idleExplodeStrength = 1;
          if (now - idlePhaseStart > EXPLODE_HOLD) {
            idlePhase = 'reforming';
            idlePhaseStart = now;
          }
        } else if (idlePhase === 'reforming') {
          const t = (now - idlePhaseStart) / REFORM_DURATION;
          if (t >= 1) {
            idlePhase = 'assembled';
            clickTriggered = false;
            // Push interaction time forward so cooldown applies before next cycle
            lastInteractionRef.current = now - IDLE_TIMEOUT + REFORM_COOLDOWN;
            idleExplodeStrength = 0;
          } else {
            // Ease-in-out for smooth reformation
            idleExplodeStrength = 1 - (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          }
        }
      }

      // Scroll scatter — stronger as we scroll down
      const scatterStrength = Math.min(scroll * 3, 1); // reaches full scatter at 33% scroll

      // Load-time scatter visibility: full during hold, fades out as logo forms
      const tSinceLoad = now - svgLoadedAtRef.current; // ms since SVG loaded
      const loadFadeIn = Math.min(1, Math.max(0, tSinceLoad / 400));
      const assemblyProgress = Math.min(1, Math.max(0, elapsed / ASSEMBLE_DURATION));
      const loadScatter = loadFadeIn * (1 - assemblyProgress);
      // Scale idle contribution to bg by cluster fraction (partial explosion shouldn't light up all bg dots)
      const clusterFraction = particles.length > 0 ? idleCluster.size / particles.length : 0;
      const bgVisibility = Math.max(scatterStrength, loadScatter, idleExplodeStrength * clusterFraction);

      // Update background ambient dots
      for (const b of bgDots) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x = cw; if (b.x > cw) b.x = 0;
        if (b.y < 0) b.y = ch; if (b.y > ch) b.y = 0;
      }

      for (let pi = 0; pi < particles.length; pi++) {
        const p = particles[pi];
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        // Smooth ease-out cubic
        const ease = 1 - Math.pow(1 - assembleT, 3);

        // Per-particle idle strength: only particles in the cluster are affected
        const pIdleStrength = idleCluster.has(pi) ? idleExplodeStrength : 0;

        // Target is the logo position
        let goalX = p.tx;
        let goalY = p.ty;

        // Combined scatter: scroll OR idle explosion (take the stronger one)
        const combinedScatter = Math.max(scatterStrength, pIdleStrength);

        // On scroll or idle, scatter in each particle's own random direction — chaotic explosion
        if (combinedScatter > 0) {
          // Idle explosion uses a shorter scatter distance for a gentler burst
          const dist = pIdleStrength > scatterStrength ? p.sDist * 0.45 : p.sDist;
          goalX = p.tx + Math.cos(p.sAngle) * combinedScatter * dist;
          goalY = p.ty + Math.sin(p.sAngle) * combinedScatter * dist;
        }

        // During assembly, interpolate from start to goal
        if (assembleT < 1) {
          p.x = p.sx + (goalX - p.sx) * ease;
          p.y = p.sy + (goalY - p.sy) * ease;
        } else {
          // After assembly, use spring physics toward goal
          // Spring force weakens during scatter for a slow drift outward
          const springForce = 0.035 - combinedScatter * 0.031; // 0.035 at rest → 0.004 at full scatter
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
          const damping = 0.88 - combinedScatter * 0.08; // 0.88 at rest → 0.80 at full scatter
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // Logo-network connections: fade in as each pair of neighbors arrives at the logo
      const logoFadeScroll = 1 - scatterStrength;
      if (logoFadeScroll > 0.01 && neighborPairs.length > 0) {
        for (const [i, j] of neighborPairs) {
          // Per-pair fade: if either particle is in idle cluster, fade that connection
          const pairIdleStrength = (idleCluster.has(i) || idleCluster.has(j)) ? idleExplodeStrength : 0;
          const logoFade = 1 - Math.max(scatterStrength, pairIdleStrength);
          if (logoFade < 0.01) continue;
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

      // Scatter connections: expand and brighten as particles explode on scroll or idle
      // For idle, only draw connections between cluster particles
      const hasScrollScatter = scatterStrength > 0.05;
      const hasIdleScatter = idleExplodeStrength > 0.05 && idleCluster.size > 0;
      if (hasScrollScatter || hasIdleScatter) {
        const scatterVisibility = Math.max(scatterStrength, idleExplodeStrength);
        const connectDist = 28 + scatterVisibility * 80;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            // During idle (no scroll), only connect cluster particles to each other
            if (!hasScrollScatter && !(idleCluster.has(i) && idleCluster.has(j))) continue;
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < connectDist * connectDist) {
              const pairStrength = hasScrollScatter ? scatterVisibility : idleExplodeStrength;
              const alpha = (1 - Math.sqrt(d2) / connectDist) * pairStrength * 0.35;
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
    canvas.addEventListener('click', handleClick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
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
        pointerEvents: 'auto',
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
    <section id="sec-hero" ref={containerRef} style={{ height: '100vh', background: C.charcoal, position: 'relative', overflow: 'hidden' }}>
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
        about us
      </motion.div>

      {/* Top-right label */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        style={{ position: 'absolute', top: 44, right: 44, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', zIndex: 10 }}
      >
        phitopolis
      </motion.div>

      {/* Narrator AI placeholder — lower left */}
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

// ── SCROLL-DRIVEN LETTER HEADING ─────────────────────────────────────────────
const HEADING_FONT: React.CSSProperties = {
  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
  fontSize: 'clamp(3rem, 7vw, 7rem)', letterSpacing: '-0.03em', lineHeight: 1.15,
};

const ScrollLetterHeading = ({ triggerRef }: { triggerRef: React.RefObject<HTMLElement | null> }) => {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!line1Ref.current || !line2Ref.current || !triggerRef.current) return;
    const chars1 = line1Ref.current.querySelectorAll<HTMLSpanElement>('.sl-char');
    const chars2 = line2Ref.current.querySelectorAll<HTMLSpanElement>('.sl-char');

    // Line 1: filled → outline (staggered per letter, sharp snap)
    gsap.set(chars1, { webkitTextStroke: `2px ${C.charcoal}`, webkitTextFillColor: C.charcoal });
    const st1 = { trigger: triggerRef.current, start: 'top 70%', end: 'top top', scrub: 0.4 };
    const tl1 = gsap.timeline({ scrollTrigger: st1 });
    chars1.forEach((ch, i) => {
      const pos = i / Math.max(chars1.length - 1, 1);
      tl1.set(ch, { webkitTextFillColor: 'transparent' }, pos);
    });

    // Line 2: outline → filled (staggered per letter, sharp snap)
    gsap.set(chars2, { webkitTextStroke: `2px ${C.charcoal}`, webkitTextFillColor: 'transparent' });
    const st2 = { trigger: triggerRef.current, start: 'top 70%', end: 'top top', scrub: 0.4 };
    const tl2 = gsap.timeline({ scrollTrigger: st2 });
    chars2.forEach((ch, i) => {
      const pos = i / Math.max(chars2.length - 1, 1);
      tl2.set(ch, { webkitTextFillColor: C.charcoal }, pos);
    });

    return () => { tl1.scrollTrigger?.kill(); tl2.scrollTrigger?.kill(); };
  }, [triggerRef]);

  const renderChars = (text: string, uppercase?: boolean) =>
    text.split('').map((ch, i) => (
      <span key={i} className="sl-char" style={{ ...HEADING_FONT, textTransform: uppercase ? 'uppercase' : 'lowercase', display: ch === ' ' ? 'inline' : 'inline-block' }}>
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1em' }}>
      <div ref={line1Ref} style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {renderChars('what do you look for in')}
      </div>
      <div ref={line2Ref} style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {renderChars('an ')}
        {renderChars('IT', true)}
        {renderChars(' partner?')}
      </div>
    </div>
  );
};

// ── FULL-BLEED STATEMENT ──────────────────────────────────────────────────────
const CONCERN_MAP: { section: string; keywords: string[] }[] = [
  { section: 'sec-services',  keywords: ['data', 'analytics', 'software', 'development', 'application', 'service', 'solution', 'build', 'ai', 'machine learning', 'ml', 'research', 'support', 'help', 'assist'] },
  { section: 'sec-techstack', keywords: ['tech', 'technology', 'stack', 'tools', 'framework', 'infrastructure', 'cloud', 'aws', 'react', 'python', 'language'] },
  { section: 'sec-process',   keywords: ['process', 'methodology', 'agile', 'workflow', 'delivery', 'how', 'approach', 'quality', 'values', 'culture', 'principles', 'ethics', 'integrity', 'oriented'] },
  { section: 'sec-people',    keywords: ['team', 'people', 'talent', 'engineer', 'developer', 'staff', 'hire', 'expertise', 'who'] },
  { section: 'sec-stats',     keywords: ['impact', 'results', 'numbers', 'statistics', 'performance', 'track record', 'proven'] },
  { section: 'sec-showcase',  keywords: ['project', 'portfolio', 'work', 'case study', 'example', 'client', 'showcase'] },
  { section: 'sec-timeline',  keywords: ['history', 'journey', 'founded', 'when', 'timeline', 'story', 'growth'] },
  { section: 'sec-vision',    keywords: ['vision', 'mission', 'goal', 'future', 'why', 'purpose'] },
];

const PLACEHOLDER_PROMPTS = [
  'I need help with data analytics...',
  'Tell me about your team...',
  'What technologies do you use?',
  'How does your process work?',
  'Show me your track record...',
];

const Statement = () => {
  const ref = useRef(null);
  const sRef = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const { scrollYProgress } = useScroll({ target: sRef, offset: ['start end', 'end start'] });
  const blobY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const bgY   = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Cycle placeholder text
  useEffect(() => {
    if (focused || query) return;
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_PROMPTS.length), 3000);
    return () => clearInterval(id);
  }, [focused, query]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const input = query.toLowerCase();
    let best = 'sec-vision';
    let bestScore = 0;
    for (const { section, keywords } of CONCERN_MAP) {
      let score = 0;
      for (const kw of keywords) {
        if (input.includes(kw)) score += kw.includes(' ') ? 3 : 1;
      }
      if (score > bestScore) { bestScore = score; best = section; }
    }
    document.getElementById(best)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="sec-statement" ref={sRef} style={{ background: C.base, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <SectionTag name="story" />

      {/* Background image — subtle texture layer */}
      <motion.div style={{ position: 'absolute', inset: '-10%', zIndex: 0, pointerEvents: 'none', y: bgY }}>
        <img
          src="/bg_futuristic_skyline.jpeg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08 }}
        />
      </motion.div>
      {/* Video background — primary background layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: 'translate(-50%, -50%)', objectFit: 'cover', opacity: 0.22 }}
        >
          <source src="/img/story/story-bg-video.mp4" type="video/mp4" />
        </video>
      </div>
      {/* Gradient overlays — lighter veil so both backgrounds remain visible */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(100deg, ${C.base}CC 0%, ${C.base}88 20%, ${C.base}44 50%, ${C.base}22 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `linear-gradient(to bottom, ${C.base} 0%, transparent 12%, transparent 88%, ${C.base} 100%)` }} />

      {/* Parallax background blobs */}
      <motion.div style={{ position: 'absolute', left: '-8%', top: '10%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}16 0%, transparent 70%)`, filter: 'blur(70px)', y: blobY, pointerEvents: 'none', zIndex: 2 }} />
      <motion.div style={{ position: 'absolute', right: '-4%', bottom: '8%', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}10 0%, transparent 70%)`, filter: 'blur(60px)', y: blobY, pointerEvents: 'none', zIndex: 2 }} />

      <motion.div ref={ref} style={{ maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', y: textY, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 3 }}>
        {/* Section label */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}
        >
          <div style={{ width: 40, height: 1, background: C.accent }} />
          <span style={{ color: C.muted, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>our story</span>
        </motion.div>

        {/* Origin paragraph */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)', color: '#777', lineHeight: 1.9, maxWidth: 700, marginBottom: 56 }}
        >
          Phitopolis was built in response to the demand of our partners in the Financial Investment Industry. They needed exacting and powerful technological solutions and harnessed the top talent in the Philippines via Phitopolis.
        </motion.p>

        {/* Story image row — hidden for now */}

        {/* Large heading — scroll-driven per-letter fill↔outline */}
        <ScrollLetterHeading triggerRef={sRef} />

        {/* AI textbox */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.6 }}
          style={{ width: '100%', maxWidth: 580, marginTop: 48 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'white', borderRadius: 14,
            border: `1.5px solid ${focused ? C.accent : 'rgba(10,42,102,0.12)'}`,
            boxShadow: focused ? `0 0 0 4px ${C.accent}18` : '0 2px 12px rgba(10,42,102,0.06)',
            padding: '14px 18px',
            transition: 'border-color 0.25s, box-shadow 0.25s',
          }}>
            {/* Sparkle icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
              <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" fill={C.accent} />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={PLACEHOLDER_PROMPTS[placeholderIdx]}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: C.charcoal,
                letterSpacing: '0.01em',
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 10,
                background: C.accent, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke={C.charcoal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Bottom scroll prompt */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7, delay: 0.9 }}
          style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: C.muted, letterSpacing: '0.04em' }}>
            Or scroll down to learn more about Phitopolis
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
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
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="sec-vision" ref={sRef} style={{ background: C.base, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <SectionTag name="vision" />

      {/* ── Full-bleed organic image ── */}
      <motion.div style={{ position: 'absolute', inset: '-15%', y: imgY, pointerEvents: 'none' }}>
        <motion.div
          initial={{ clipPath: 'ellipse(0% 0% at 72% 50%)' }}
          animate={{ clipPath: inView ? (isMobile ? 'ellipse(130% 52% at 50% 90%)' : 'ellipse(60% 90% at 70% 50%)') : 'ellipse(0% 0% at 72% 50%)' }}
          transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          style={{ width: '100%', height: '100%', backgroundImage: 'url(/vision.png)', backgroundSize: 'cover', backgroundPosition: isMobile ? 'center bottom' : 'center right' }}
        />
      </motion.div>

      {/* ── Gradient overlay for text readability ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isMobile
          ? `linear-gradient(to bottom, transparent, ${C.base} 18%, ${C.base} 58%, transparent 78%)`
          : `linear-gradient(to right, transparent, ${C.base} 12%, ${C.base} 52%, transparent 72%)`
      }} />

      {/* ── Text ── */}
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <Divider inView={inView} color={`rgba(0,0,0,0.1)`} />
        <div style={{ maxWidth: isMobile ? '100%' : '50%' }}>
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
    label: '02 / Engineering',
    title: 'Data & Software Engineering',
    desc:  'Building the full stack — from data pipelines and ML infrastructure to production-grade applications and APIs.',
  },
  {
    image: 'https://phitopolis.com/img/core-competencies/proactive-communication.jpg',
    label: '03 / Operations',
    title: 'Support & Operations',
    desc:  'Dedicated end-to-end assistance — from onboarding and troubleshooting to AI-powered operations and continuous optimization.',
  },
];

// Desktop layout: image at left:25vw, width:44vw, height:88vh — caption right panel 22%
// Mobile layout:  image full-width (left:0, width:100vw, height:72vh) — caption below image
//
// GSAP seed/thumbnail positions derived from container origin + desired screen position:
//   Desktop seed:      screen(48vw, 83vh) → relative(23vw, 77vh) [container origin: 25vw, 6vh]
//   Mobile seed:       screen(50vw, 84vh) → relative(50vw, 84vh) [container origin: 0,  0 ]
//   Desktop nextSlot:  screen(71vw, 75vh) → relative(46vw, 69vh)
//   Mobile nextSlot:   screen(100vw,72vh) → relative(100vw,72vh) [off-screen right]
//   Desktop leftThumb: screen(14vw,  6vh) → relative(-11vw, 0)
//   Mobile leftThumb:  screen(-24vw, 0)   → relative(-24vw, 0)   [off-screen left]
const ServicesScrollStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const img1Ref      = useRef<HTMLDivElement>(null);
  const img2Ref      = useRef<HTMLDivElement>(null);
  const img3Ref      = useRef<HTMLDivElement>(null);
  const cap1Ref      = useRef<HTMLDivElement>(null);
  const cap2Ref      = useRef<HTMLDivElement>(null);
  const cap3Ref      = useRef<HTMLDivElement>(null);
  const isMobile     = useIsMobile();

  useEffect(() => {
    // Layout-dependent GSAP values — recalculate when isMobile changes
    const seed      = isMobile
      ? { x: '50vw',  y: '84vh' }
      : { x: '23vw',  y: '77vh' };
    const nextSlot  = isMobile
      ? { x: '100vw', y: '72vh' }
      : { x: '46vw',  y: '69vh' };
    const leftThumb = isMobile ? '-24vw' : '-11vw';

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current,  { transformOrigin: '50% 0%' });
      gsap.set(img1Ref.current,     { scale: 0.08, ...seed, transformOrigin: '0% 0%', willChange: 'transform', borderRadius: 20 / 0.08 });
      gsap.set(img2Ref.current,     { opacity: 0, scale: 0.22, ...nextSlot, transformOrigin: '0% 0%', willChange: 'transform', borderRadius: 20 / 0.22 });
      gsap.set(img3Ref.current,     { opacity: 0, scale: 0.22, ...nextSlot, transformOrigin: '0% 0%', willChange: 'transform', borderRadius: 20 / 0.22 });
      gsap.set(cap1Ref.current,     { opacity: 0 });
      gsap.set(cap2Ref.current,     { opacity: 0 });
      gsap.set(cap3Ref.current,     { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
        defaults: { ease: 'none' },
      });

      // ── Heading fades out ─────────────────────────────────────────────────────
      tl.to(headingRef.current, { opacity: 0, scale: 0.4, y: '-6vh', duration: 0.11 }, 0.12);

      // ── Image 1: tiny → full → thumbnail → fade ───────────────────────────────
      tl.to(img1Ref.current,   { scale: 1, x: '0vw', y: '0vh', borderRadius: 20, duration: 0.18 }, 0);
      tl.to(img1Ref.current,   { scale: 0.22, x: leftThumb, borderRadius: 20 / 0.22, duration: 0.18 }, 0.30);
      tl.to(img1Ref.current,   { opacity: 0, duration: 0.12 }, 0.60);

      // ── Caption 1 ─────────────────────────────────────────────────────────────
      tl.to(cap1Ref.current,   { opacity: 1, duration: 0.07 }, 0.16);
      tl.to(cap1Ref.current,   { opacity: 0, duration: 0.07 }, 0.30);

      // ── Image 2: appears → full → thumbnail ───────────────────────────────────
      tl.to(img2Ref.current,   { opacity: 1, duration: 0.07 }, 0.26);
      tl.to(img2Ref.current,   { scale: 1, x: '0vw', y: '0vh', borderRadius: 20, duration: 0.18 }, 0.30);
      tl.to(img2Ref.current,   { scale: 0.22, x: leftThumb, borderRadius: 20 / 0.22, duration: 0.12 }, 0.60);

      // ── Caption 2 ─────────────────────────────────────────────────────────────
      tl.to(cap2Ref.current,   { opacity: 1, duration: 0.07 }, 0.45);
      tl.to(cap2Ref.current,   { opacity: 0, duration: 0.07 }, 0.58);

      // ── Image 3: appears small → grows to full ────────────────────────────────
      tl.to(img3Ref.current,   { opacity: 1, duration: 0.07 }, 0.38);
      tl.to(img3Ref.current,   { scale: 1, x: '0vw', y: '0vh', borderRadius: 20, duration: 0.18 }, 0.60);

      // ── Caption 3 — appears as image 3 reaches full size; hold through end ───
      tl.to(cap3Ref.current,   { opacity: 1, duration: 0.07 }, 0.76);
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Caption: right panel on desktop, bottom strip on mobile
  const captionStyle: React.CSSProperties = isMobile ? {
    position: 'absolute',
    bottom: '6vh', left: '6vw', right: '6vw',
    zIndex: 6, pointerEvents: 'none',
  } : {
    position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
    zIndex: 6, maxWidth: '22%', pointerEvents: 'none',
  };

  // Image container: narrower/offset on desktop, full-width on mobile
  const imgWrapStyle: React.CSSProperties = {
    position: 'absolute',
    top:    isMobile ? '0'    : '6vh',
    left:   isMobile ? '0'    : '25vw',
    width:  isMobile ? '100vw': '44vw',
    height: isMobile ? '72vh' : '88vh',
    willChange: 'transform',
    overflow: 'hidden', borderRadius: 20,
  };

  return (
    <section id="sec-services" ref={containerRef} style={{ height: '280vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: C.charcoal }}>
        <SectionTag name="services" />

        {/* ── Heading ── */}
        <div ref={headingRef} style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, textAlign: 'center', pointerEvents: 'none',
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          width: isMobile ? '80vw' : 'auto',
        }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.base}`, WebkitTextFillColor: 'transparent' }}>
            what we{' '}
          </span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.base }}>
            do best.
          </span>
        </div>

        {/* ── Caption 1 ── */}
        <div ref={cap1Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[0].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: isMobile ? 6 : 12 }}>{SCROLL_ITEMS[0].title}</h3>
          {!isMobile && <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[0].desc}</p>}
        </div>

        {/* ── Caption 2 ── */}
        <div ref={cap2Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[1].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: isMobile ? 6 : 12 }}>{SCROLL_ITEMS[1].title}</h3>
          {!isMobile && <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[1].desc}</p>}
        </div>

        {/* ── Caption 3 ── */}
        <div ref={cap3Ref} style={captionStyle}>
          <p style={{ color: C.accent, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{SCROLL_ITEMS[2].label}</p>
          <h3 style={{ color: C.base, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.1rem, 1.8vw, 1.9rem)', letterSpacing: '-0.02em', marginBottom: isMobile ? 6 : 12 }}>{SCROLL_ITEMS[2].title}</h3>
          {!isMobile && <p style={{ color: 'rgba(240,242,250,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', lineHeight: 1.75 }}>{SCROLL_ITEMS[2].desc}</p>}
        </div>

        {/* ── Image 3 (lowest z) ── */}
        <div ref={img3Ref} style={{ ...imgWrapStyle, zIndex: 1 }}>
          <img src={SCROLL_ITEMS[2].image} alt={SCROLL_ITEMS[2].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        {/* ── Image 2 ── */}
        <div ref={img2Ref} style={{ ...imgWrapStyle, zIndex: 2 }}>
          <img src={SCROLL_ITEMS[1].image} alt={SCROLL_ITEMS[1].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        {/* ── Image 1 ── */}
        <div ref={img1Ref} style={{ ...imgWrapStyle, zIndex: 3 }}>
          <img src={SCROLL_ITEMS[0].image} alt={SCROLL_ITEMS[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

      </div>
    </section>
  );
};


// ── 05 PROCESS + SERVICE WHEEL ────────────────────────────────────────────────
const PHASES = [
  {
    num: '01', label: 'Integrity',
    definition: 'We operate with unwavering honesty and transparency in every interaction, ensuring our word is our bond.',
    valueToClient: 'Builds a foundation of trust and predictability — clients can rely on truthful reporting and ethical decision-making, reducing risk and ensuring long-term partnership stability.',
    color: C.accent, glow: '#FFC72C',
    image: '/values/integrity.png',
    imagePos: 'center 40%',
  },
  {
    num: '02', label: 'Accountability',
    definition: 'We take full ownership of our commitments and results, standing behind the quality of our output without excuses.',
    valueToClient: 'Ensures reliability and peace of mind — by owning both successes and challenges, we provide a dependable partner who proactively manages outcomes to meet project milestones.',
    color: '#4A90D9', glow: '#4A90D9',
    image: '/values/accountability.png',
    imagePos: 'center top',
  },
  {
    num: '03', label: 'Forward Thinking',
    definition: 'We don\'t just solve today\'s problems; we anticipate tomorrow\'s challenges through innovation and strategic planning.',
    valueToClient: 'Clients gain a competitive edge by leveraging our proactive approach to technology and market trends, ensuring their business remains resilient and scalable.',
    color: '#A78BFA', glow: '#A78BFA',
    image: '/values/forward-thinking.png',
    imagePos: 'center top',
  },
  {
    num: '04', label: 'Excellence',
    definition: 'In everything we do — we set the highest standards for performance, continuously refining our processes to deliver superior quality.',
    valueToClient: 'Our commitment to excellence translates to reduced errors, higher efficiency, and a final product that exceeds expectations, maximizing the client\'s return on investment.',
    color: '#2ECC71', glow: '#2ECC71',
    image: '/values/excelence.png',
    imagePos: 'center 35%',
  },
];

// Transition windows: [enter-start, enter-end, exit-start, exit-end]
const PHASE_WIN = [
  [0.03, 0.11, 0.24, 0.30],
  [0.30, 0.38, 0.49, 0.55],
  [0.55, 0.63, 0.74, 0.80],
  [0.80, 0.88, 0.96, 1.00],
];

const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // per-phase refs
  const phaseRefs   = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const labelRefs   = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const numRefs     = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const descRefs    = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const orbRefs     = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const stepRefs    = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const stepDotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const badgeRef    = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const ghostWatermarkRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
        defaults: { ease: 'none' },
      });

      // ── Entry: badge + heading slide up ─────────────────────────────────────
      gsap.set(badgeRef.current, { y: 60, opacity: 0 });
      tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 0.06 }, 0);

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

        // — Ghost watermark transitions —
        gsap.set(ghostWatermarkRefs[i].current, { opacity: 0 });
        tl.to(ghostWatermarkRefs[i].current, { opacity: 1, duration: enterDur * 0.4 }, es);
        if (xs < 1) {
          tl.to(ghostWatermarkRefs[i].current, { opacity: 0, duration: (xe - xs) * 0.35 }, xs);
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
    <section id="sec-process" ref={containerRef} style={{ background: C.base, height: '360vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        <SectionTag name="values" />

        {/* ── Background decorations ──────────────────────────────────── */}
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(10,42,102,0.07) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 0, pointerEvents: 'none', background: `linear-gradient(90deg, transparent, ${C.accent}40, transparent)` }} />
        {/* Bottom accent bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, zIndex: 0, pointerEvents: 'none', background: `linear-gradient(90deg, transparent, ${C.accent}30, transparent)` }} />
        {/* Corner marks */}
        <svg style={{ position: 'absolute', top: 28, left: 28, zIndex: 0, pointerEvents: 'none', opacity: 0.08 }} width="72" height="72">
          <path d="M0 72 L0 0 L72 0" stroke="#0A2A66" strokeWidth="1.5" fill="none"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: 28, right: 28, zIndex: 0, pointerEvents: 'none', opacity: 0.08 }} width="72" height="72">
          <path d="M72 0 L72 72 L0 72" stroke="#0A2A66" strokeWidth="1.5" fill="none"/>
        </svg>
        {/* Dynamic ghost watermark — one per phase, animated by GSAP */}
        {PHASES.map((ph, i) => {
          const fontSize = ph.label.includes(' ') ? '15vw' : ph.label.length > 11 ? '20vw' : '28vw';
          return (
            <div key={ph.num} ref={ghostWatermarkRefs[i]} style={{
              position: 'absolute', bottom: '-0.05em', right: '-0.03em', zIndex: 0,
              pointerEvents: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize, WebkitTextStroke: '1px rgba(10,42,102,0.04)',
              WebkitTextFillColor: 'transparent', lineHeight: 1,
              letterSpacing: '-0.05em', userSelect: 'none', opacity: 0,
            }}>
              {ph.label.toLowerCase()}
            </div>
          );
        })}

        {/* ── Left rail ─────────────────────────────────────────────────── */}
        <div style={{ width: isMobile ? 80 : 'clamp(200px, 22vw, 280px)', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '0 0 0 24px' : '0 0 0 48px', position: 'relative', zIndex: 3 }}>
          <div ref={badgeRef} />

          {/* Step list */}
          <div style={{ marginTop: 36, position: 'relative' }}>
            {/* Growing vertical line */}
            <div ref={lineRef} style={{ position: 'absolute', left: 9, top: 16, bottom: 16, width: 1, background: `linear-gradient(to bottom, ${C.accent}, #4A90D9, #A78BFA, #2ECC71)`, borderRadius: 1, transformOrigin: 'top' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {PHASES.map((ph, i) => (
                <div key={i} ref={stepRefs[i]}
                  onClick={() => {
                    if (!containerRef.current) return;
                    const sectionTop = containerRef.current.offsetTop;
                    const sectionHeight = containerRef.current.offsetHeight - window.innerHeight;
                    const midPoint = (PHASE_WIN[i][0] + PHASE_WIN[i][1]) / 2;
                    window.scrollTo({ top: sectionTop + sectionHeight * midPoint, behavior: 'smooth' });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', cursor: 'pointer' }}
                >
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
          <div ref={headRef} style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.charcoal}`, WebkitTextFillColor: 'transparent' }}>
              phitopolis is{' '}
            </span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 5.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.charcoal }}>
              rooted in values.
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
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'clamp(32px, 5vw, 64px)', width: '100%' }}>

                {/* Text */}
                <div style={{ flex: '0 0 auto', width: isMobile ? '100%' : '50%' }}>
                  {/* Label — clip-path curtain reveal */}
                  <div ref={labelRefs[i]} style={{ overflow: 'visible', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? 'clamp(2.4rem, 10vw, 4rem)' : 'clamp(3.5rem, 7vw, 7.5rem)', letterSpacing: '-0.04em', lineHeight: 1.15, textTransform: 'lowercase', color: C.charcoal, margin: 0, whiteSpace: 'pre-line' }}>
                      {ph.label}
                    </h2>
                  </div>

                  {/* Description */}
                  <div ref={descRefs[i]}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '0.85rem' : '1rem', color: 'rgba(10,14,26,0.72)', lineHeight: 1.8, margin: 0 }}>
                      {ph.definition}
                    </p>
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(10,14,26,0.08)' }}>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: ph.color }}>Value to Client</span>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '0.78rem' : '0.88rem', color: 'rgba(10,14,26,0.5)', lineHeight: 1.85, margin: '8px 0 0' }}>
                        {ph.valueToClient}
                      </p>
                    </div>
                    {/* Accent underline */}
                    <div style={{ marginTop: 20, width: 48, height: 2, background: ph.color, borderRadius: 1 }} />
                  </div>
                </div>

                {/* Value image */}
                {!isMobile && (
                  <div style={{ flex: 1, borderRadius: 20, overflow: 'hidden', height: (ph as any).imageHeight ?? 'clamp(240px, 38vh, 420px)', alignSelf: 'center', border: `1px solid ${ph.color}20`, flexShrink: 0, background: (ph as any).imageBg ?? 'transparent' }}>
                    <img
                      src={ph.image}
                      alt={ph.label}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = ph.image.replace('.jpg', '.svg'); }}
                      style={{ width: '100%', height: '100%', objectFit: (ph as any).imageFit ?? 'cover', objectPosition: (ph as any).imagePos ?? 'center', display: 'block' }}
                    />
                  </div>
                )}
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

const ShowCard = ({ card, index, isActive = true, fullWidth = false }: { key?: React.Key; card: typeof CARDS[0]; index: number; isActive?: boolean; fullWidth?: boolean }) => {
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

// ── OUR PEOPLE — HR Demographics ──────────────────────────────────────────────

// Certification badge images — fetched from vendor CDNs, no local assets required for cloud certs
const CERT_CLOUD = [
  // AWS — official hexagonal badges from d1.awsstatic.com
  { name: 'AWS AI Practitioner',            path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/aif-badge-resized.b4fb88afcfb3d7e57012aa2abe67cbcae6021315.png' },
  { name: 'AWS Cloud Practitioner',         path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/clf-badge-resized.2fdbed6fe7b39cf6cef5063f283ddd689cc78caa.png' },
  { name: 'AWS Solutions Architect Assoc',  path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/saa-badge-resized.c20e7aebf85d36eb5203d39969a4bca1164c47d6.png' },
  { name: 'AWS Developer Associate',        path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/dva-badge-resized.d7d49d6e5cda74099c39ca24ef2573994f4b7955.png' },
  { name: 'AWS Solutions Architect Pro',    path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/sap-badge-resized.5b4e271e6559dfa5a4b326685b2f00efd53420ed.png' },
  { name: 'AWS Machine Learning Specialty', path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/mls-badge-resized.e6adaa2cb420c3214ffc9aadf87b65a46eb58c70.png' },
  { name: 'AWS Security Specialty',         path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/scs-badge-resized.f5b59e681f95bdca2713c46d537ff6bddd6b413a.png' },
  { name: 'AWS Data Engineer Associate',    path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/dea-badge-resized.46424d5f94ca6c466febd476c86c5d8fe437db1d.png' },
  { name: 'AWS DevOps Engineer Pro',        path: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/images/certification-badges/dop-badge-resized.8fb9086efd423b597d659ad63b5aa399f7c2a4ed.png' },
  // Microsoft Azure — official SVG badges from learn.microsoft.com
  { name: 'Azure Fundamentals',             path: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg' },
  { name: 'Azure Associate',                path: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg' },
  { name: 'Azure Expert',                   path: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-expert-badge.svg' },
  // Local badges already in public folder
  { name: 'PMP',                            path: '/logos/certs/pmp.webp' },
  { name: 'Red Hat (RHCSA)',                path: '/logos/certs/redhat.webp' },
  { name: 'ITIL',                           path: '/logos/certs/itil.webp' },
  { name: 'ISO 27001',                      path: '/logos/certs/iso27001.webp' },
  { name: 'CFA',                            path: '/logos/certs/cpa.webp' },
];

// Pre-computed scatter positions with rotation — badges cycle through all positions
const CERT_SCATTER_POSITIONS: { top: string; left: string; size: number; opacity: number; rotate: string }[] = [
  { top:  '3%', left: '46%', size: 110, opacity: 0.90, rotate: '-4deg' },
  { top:  '4%', left: '68%', size:  90, opacity: 0.82, rotate:  '6deg' },
  { top:  '2%', left: '82%', size: 100, opacity: 0.86, rotate: '-2deg' },
  { top: '18%', left: '56%', size:  95, opacity: 0.84, rotate:  '8deg' },
  { top: '15%', left: '74%', size: 115, opacity: 0.88, rotate: '-6deg' },
  { top: '20%', left: '88%', size:  85, opacity: 0.78, rotate:  '3deg' },
  { top: '32%', left:  '8%', size: 120, opacity: 0.92, rotate: '-3deg' },
  { top: '28%', left: '32%', size: 100, opacity: 0.86, rotate:  '7deg' },
  { top: '30%', left: '58%', size: 110, opacity: 0.88, rotate: '-5deg' },
  { top: '35%', left: '76%', size:  90, opacity: 0.80, rotate:  '4deg' },
  { top: '40%', left: '89%', size:  95, opacity: 0.82, rotate: '-8deg' },
  { top: '48%', left: '18%', size: 105, opacity: 0.90, rotate:  '5deg' },
  { top: '44%', left: '44%', size: 115, opacity: 0.85, rotate: '-4deg' },
  { top: '50%', left: '64%', size: 100, opacity: 0.88, rotate:  '9deg' },
  { top: '52%', left: '82%', size:  90, opacity: 0.80, rotate: '-6deg' },
  { top: '62%', left:  '6%', size: 110, opacity: 0.87, rotate:  '3deg' },
  { top: '65%', left: '28%', size:  95, opacity: 0.83, rotate: '-7deg' },
  { top: '60%', left: '52%', size: 120, opacity: 0.90, rotate:  '5deg' },
  { top: '68%', left: '72%', size: 100, opacity: 0.82, rotate: '-3deg' },
  { top: '76%', left: '16%', size: 105, opacity: 0.88, rotate:  '8deg' },
  { top: '78%', left: '42%', size:  90, opacity: 0.80, rotate: '-5deg' },
  { top: '74%', left: '64%', size: 115, opacity: 0.85, rotate:  '4deg' },
  { top: '82%', left: '85%', size:  95, opacity: 0.78, rotate: '-2deg' },
  { top: '85%', left: '30%', size: 100, opacity: 0.83, rotate:  '6deg' },
];

type SchoolItem = { name: string; abbr: string; note: string; logo: string | null; stackedLogos?: string[] };
type CourseItem = { name: string; pct: number; color: string };
type CertItem   = { name: string; sub: string; logo: string | null };
type HRSlide =
  | { id: string; type: 'schools';  heading: string; sub: string; color: string; items: SchoolItem[] }
  | { id: string; type: 'courses';  heading: string; sub: string; color: string; items: CourseItem[] }
  | { id: string; type: 'certs';    heading: string; sub: string; color: string; items: CertItem[]   };

const HR_SLIDES: HRSlide[] = [
  {
    id: '01', type: 'schools', color: '#FFC72C',
    heading: 'Schools & Education',
    sub: 'Recruiting from the top universities in the Philippines and Asia',
    items: [
      { name: 'University of the Philippines',         abbr: 'UP',      note: 'CS · Engineering · Sciences',   logo: '/logos/schools/up.png' },
      { name: 'Ateneo de Manila University',           abbr: 'ADMU',    note: 'CS · Math · Engineering',       logo: '/logos/schools/admu.png' },
      { name: 'De La Salle University',                abbr: 'DLSU',    note: 'CS · Engineering · Sciences',   logo: '/logos/schools/dlsu.png' },
      { name: 'Mapúa University',                      abbr: 'Mapúa',   note: 'CS · Engineering',              logo: '/logos/schools/mapua.webp' },
      { name: 'University of Santo Tomas',             abbr: 'UST',     note: 'Engineering · Finance',         logo: '/logos/schools/ust.webp' },
      { name: 'Polytechnic University of the Philippines', abbr: 'PUP', note: 'CS · Finance · Sciences',       logo: '/logos/schools/pup.webp' },
      { name: 'Adamson University',                    abbr: 'Adamson', note: 'CS · Accountancy',              logo: '/logos/schools/adamson.webp' },
      { name: 'University of Mindanao',                abbr: 'UMind',   note: 'Business · Engineering',        logo: '/logos/schools/mindanao.webp' },
      { name: 'Masters / Advanced / International',    abbr: 'Intl',    note: 'CS · Math · Business',          logo: null, stackedLogos: ['/logos/schools/aim.webp', '/logos/schools/brunel.webp', '/logos/schools/sophia.webp'] },
    ],
  },
  {
    id: '02', type: 'courses', color: '#A78BFA',
    heading: 'Courses & Disciplines',
    sub: 'A multi-disciplined team covering every layer of the stack',
    items: [
      { name: 'Computer Science',          pct: 45, color: '#A78BFA' },
      { name: 'Sciences',                  pct: 12, color: '#FFC72C' },
      { name: 'Mathematics & Statistics',  pct: 10, color: '#34D399' },
      { name: 'Engineering',               pct: 10, color: '#60A5FA' },
      { name: 'Business and Management',   pct:  8, color: '#F472B6' },
      { name: 'Finance and Economics',     pct:  5, color: '#FB923C' },
      { name: 'Accountancy',               pct:  5, color: '#E879F9' },
    ],
  },
  {
    id: '03', type: 'certs', color: '#34D399',
    heading: 'Certifications',
    sub: 'Certified across the stack. Upskilling never stops.',
    items: [
      { name: 'AWS Solutions Architect',     sub: 'Associate',                        logo: '/logos/certs/aws-certs/solutions-architect.png' },
      { name: 'AWS Developer',              sub: 'Associate',                        logo: '/logos/certs/aws-certs/developer.png' },
      { name: 'Red Hat (RHCSA)',            sub: 'Linux System Administrator',        logo: '/logos/certs/redhat.webp' },
      { name: 'AWS DevOps Engineer',        sub: 'Professional',                     logo: '/logos/certs/aws-certs/dev-ops-engineer-pro.png' },
      { name: 'AWS Cloud Ops Engineer',     sub: 'Associate',                        logo: '/logos/certs/aws-certs/cloud-ops-engineer.png' },
      { name: 'PMP',                        sub: 'Project Management Professional',   logo: '/logos/certs/pmp.webp' },
      { name: 'AWS Cloud Practitioner',     sub: 'Foundational',                     logo: '/logos/certs/aws-certs/cloud-practitioner.png' },
      { name: 'AWS AI Practitioner',        sub: 'Foundational',                     logo: '/logos/certs/aws-certs/ai-practitioner.png' },
      { name: 'ITIL',                       sub: 'Foundation & Practitioner',         logo: '/logos/certs/itil.webp' },
      { name: 'AWS Solutions Architect',     sub: 'Professional',                     logo: '/logos/certs/aws-certs/solutions-architect-pro.png' },
      { name: 'AWS Data Engineer',          sub: 'Associate',                        logo: '/logos/certs/aws-certs/data-engineer.png' },
      { name: 'ISO 27001',                  sub: 'Lead Implementer & Internal Auditor', logo: '/logos/certs/iso27001.webp' },
      { name: 'AWS Machine Learning',       sub: 'Specialty',                        logo: '/logos/certs/aws-certs/machine-learning.png' },
      { name: 'AWS ML Engineer',            sub: 'Associate',                        logo: '/logos/certs/aws-certs/machine-learning-engineer.png' },
      { name: 'CFA / CPA',                  sub: 'Finance & Accounting Professionals', logo: '/logos/certs/cpa.webp' },
      { name: 'AWS Gen AI Developer',       sub: 'Associate',                        logo: '/logos/certs/aws-certs/generative-ai-developer.png' },
      { name: 'AWS Security',              sub: 'Specialty',                        logo: '/logos/certs/aws-certs/security.png' },
      { name: 'AWS Advanced Networking',    sub: 'Specialty',                        logo: '/logos/certs/aws-certs/advanced-networking.png' },
    ],
  },
];

const HR_WIN = [
  [0.05, 0.15, 0.32, 0.40],
  [0.40, 0.50, 0.67, 0.75],
  [0.75, 0.85, 0.96, 1.00],
];

const OurPeople = () => {
  const sRef     = useRef<HTMLElement>(null);
  const bgRef    = useRef<HTMLDivElement>(null);

  const scrollToCoursesSlide = useCallback(() => {
    const section = document.getElementById('sec-people');
    if (!section) return;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    // Courses slide (HR_WIN[1]) enters at 40% — target ~52% for stable visibility
    window.scrollTo({ top: sectionTop + sectionHeight * 0.52, behavior: 'smooth' });
  }, []);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headRef  = useRef<HTMLDivElement>(null);
  const lineRef  = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const slideRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs     = useRef<(HTMLDivElement | null)[]>([]);
  // Bar fill refs for the Courses slide (7 disciplines)
  const barFillRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null, null]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bgRef.current, { y: '-8%' }, {
        y: '8%', ease: 'none',
        scrollTrigger: { trigger: sRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
        defaults: { ease: 'none' },
      });

      gsap.set([badgeRef.current, headRef.current], { y: 52, opacity: 0 });
      tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 0.04 }, 0);
      tl.to(headRef.current,  { y: 0, opacity: 1, duration: 0.04 }, 0.015);
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' });
      tl.to(lineRef.current, { scaleY: 1, duration: 0.92 }, 0.04);

      HR_SLIDES.forEach((slide, i) => {
        const [es, ee, xs, xe] = HR_WIN[i];
        const eD = ee - es;
        const xD = xe - xs;

        gsap.set(slideRefs.current[i],   { opacity: 0 });
        gsap.set(contentRefs.current[i], { x: -60, opacity: 0 });
        gsap.set(ghostRefs.current[i],   { scale: 1.22, opacity: 0 });
        gsap.set(dotRefs.current[i],     { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65 });

        tl.to(slideRefs.current[i],   { opacity: 1, duration: eD * 0.2 }, es);
        tl.to(ghostRefs.current[i],   { scale: 1, opacity: 1, duration: eD * 0.75, ease: 'power2.out' }, es);
        tl.to(contentRefs.current[i], { x: 0, opacity: 1, duration: eD * 0.65, ease: 'power3.out' }, es + eD * 0.12);
        tl.to(dotRefs.current[i],     { backgroundColor: slide.color, scale: 1.25, duration: eD * 0.3 }, es + eD * 0.12);

        if (xs < 0.97) {
          tl.to(contentRefs.current[i], { x: -48, opacity: 0, duration: xD * 0.5, ease: 'power2.in' }, xs);
          tl.to(ghostRefs.current[i],   { scale: 0.82, opacity: 0, duration: xD * 0.55 }, xs);
          tl.to(slideRefs.current[i],   { opacity: 0, duration: xD * 0.12 }, xs + xD * 0.88);
          tl.to(dotRefs.current[i],     { backgroundColor: 'rgba(255,255,255,0.1)', scale: 0.65, duration: xD * 0.3 }, xs);
        }
      });

      // ── Courses bar fill animations (slide index 1) ───────────────────────
      const [ces, cee, cxs, cxe] = HR_WIN[1];
      const ceD = cee - ces;
      const cxD = cxe - cxs;
      const courseItems = (HR_SLIDES[1] as HRSlide & { type: 'courses'; items: CourseItem[] }).items;
      courseItems.forEach((course, j) => {
        gsap.set(barFillRefs.current[j], { width: '0%' });
        tl.to(barFillRefs.current[j], {
          width: `${course.pct}%`,
          duration: ceD * 0.55,
          ease: 'power2.out',
        }, ces + ceD * 0.18 + j * 0.008);
        if (cxs < 0.97) {
          tl.to(barFillRefs.current[j], { width: '0%', duration: cxD * 0.35 }, cxs);
        }
      });
    }, sRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="sec-people" ref={sRef} style={{ background: C.charcoal, height: '280vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        <SectionTag name="demographics" />

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
            <div ref={lineRef} style={{ position: 'absolute', left: 8, top: 10, bottom: 10, width: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {HR_SLIDES.map((slide, i) => (
                <div key={slide.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
                  <div ref={el => { dotRefs.current[i] = el; }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${slide.color}55`, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                  {!isMobile && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {slide.heading}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main stage ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 2 }}>
          <div ref={headRef} style={{ position: 'absolute', top: '10%', left: isMobile ? 20 : 48, zIndex: 3, pointerEvents: 'none', display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', WebkitTextStroke: `2px ${C.base}`, WebkitTextFillColor: 'transparent' }}>our</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 4.5rem)', letterSpacing: '-0.03em', textTransform: 'lowercase', color: C.base }}>people</span>
          </div>

          {HR_SLIDES.map((slide, i) => (
            <div key={slide.id} ref={el => { slideRefs.current[i] = el; }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: isMobile ? 'clamp(110px,22vh,180px) 20px 0' : 'clamp(120px,20vh,190px) 48px 0', pointerEvents: 'none' }}
            >
              {/* Ghost slide number */}
              <div ref={el => { ghostRefs.current[i] = el; }}
                style={{ position: 'absolute', right: '-0.04em', top: '50%', transform: 'translateY(-52%)', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? '52vw' : '34vw', color: `${slide.color}07`, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.06em', zIndex: 0, pointerEvents: 'none' }}
              >
                {slide.id}
              </div>

              {/* Slide content */}
              <div ref={el => { contentRefs.current[i] = el; }} style={{ position: 'relative', zIndex: 1, maxWidth: isMobile ? '100%' : '70vw' }}>
                {/* Heading */}
                <>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: slide.color }}>{slide.id}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2.2rem)' : 'clamp(1.7rem, 3vw, 2.8rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 6px', lineHeight: 1.1, textTransform: 'lowercase' as const }}>
                    {slide.heading}
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.5 }}>{slide.sub}</p>
                </>

                {/* ── Schools grid ─────────────────────────────────────────── */}
                {slide.type === 'schools' && (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 10 }}>
                    {(slide.items as SchoolItem[]).map((s, idx) => (
                      <div key={s.abbr} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 14px 12px', overflow: s.stackedLogos ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {/* Accent glow */}
                        <div style={{ position: 'absolute', top: -24, left: -24, width: 80, height: 80, borderRadius: '50%', background: `${slide.color}1A`, filter: 'blur(20px)', pointerEvents: 'none' }} />
                        {/* Rank badge */}
                        <div style={{ position: 'absolute', top: 10, right: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        {/* Logo */}
                        {s.stackedLogos ? (
                          /* ── Stacked logos (AIM / Brunel / Sophia) ── */
                          <div style={{ position: 'relative', width: 60, height: 34, marginBottom: 10, flexShrink: 0, pointerEvents: 'auto' }}>
                            {s.stackedLogos.map((src, si) => (
                              <div key={si}
                                style={{
                                  position: 'absolute',
                                  left: si * 16,
                                  top: 0,
                                  width: 34, height: 34,
                                  zIndex: s.stackedLogos!.length - si,
                                  borderRadius: 9,
                                  background: 'rgba(255,255,255,0.95)',
                                  border: `2px solid rgba(10,42,102,0.25)`,
                                  boxShadow: `${si > 0 ? '-3px' : '0px'} 0 8px rgba(0,0,0,0.28)`,
                                  overflow: 'hidden',
                                  padding: 4,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
                                  transformOrigin: 'center center',
                                  cursor: 'default',
                                }}
                                onMouseEnter={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.transform = 'scale(2.1)';
                                  el.style.zIndex = '99';
                                  el.style.boxShadow = '0 10px 24px rgba(0,0,0,0.45)';
                                }}
                                onMouseLeave={e => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.transform = 'scale(1)';
                                  el.style.zIndex = String(s.stackedLogos!.length - si);
                                  el.style.boxShadow = `${si > 0 ? '-3px' : '0px'} 0 8px rgba(0,0,0,0.28)`;
                                }}
                              >
                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{ width: 54, height: 54, borderRadius: 12, background: 'rgba(255,255,255,0.92)', border: `1px solid ${slide.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, padding: 7, flexShrink: 0, transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', pointerEvents: 'auto' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                          >
                            {s.logo ? (
                              <>
                                <img
                                  src={s.logo} alt={s.abbr}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    const el = e.currentTarget;
                                    el.style.display = 'none';
                                    (el.nextElementSibling as HTMLElement).style.display = 'flex';
                                  }}
                                />
                                <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '0.9rem', color: slide.color }}>{s.abbr}</span>
                              </>
                            ) : (
                              <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '0.85rem', color: slide.color, textAlign: 'center', lineHeight: 1.2 }}>{s.abbr}</span>
                            )}
                          </div>
                        )}
                        {/* Name */}
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: isMobile ? '0.66rem' : '0.73rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.35, marginBottom: 6 }}>{s.name}</div>
                        {/* Discipline tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
                          {s.note.split(' · ').map(tag => (
                            <span key={tag} onClick={scrollToCoursesSlide} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.58rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '2px 8px', letterSpacing: '0.04em', cursor: 'pointer', pointerEvents: 'auto', transition: 'background 0.15s, color 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,199,44,0.15)'; (e.currentTarget as HTMLElement).style.color = '#FFC72C'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
                            >{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Courses bar chart ─────────────────────────────────────── */}
                {slide.type === 'courses' && (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 24, alignItems: 'start' }}>
                    {/* Bar chart column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {(slide.items as CourseItem[]).map((c, j) => (
                        <div key={c.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>{c.name}</span>
                            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: c.color, letterSpacing: '-0.02em' }}>{c.pct}%</span>
                          </div>
                          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                            {/* width starts at 0%; GSAP animates to c.pct% on scroll */}
                            <div ref={el => { if (i === 1) barFillRefs.current[j] = el; }}
                              style={{ height: '100%', width: '0%', background: `linear-gradient(90deg, ${c.color}99, ${c.color})`, borderRadius: 5, position: 'relative' }}>
                              {/* Glow cap */}
                              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: c.color, boxShadow: `0 0 8px 2px ${c.color}88` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Summary stat card */}
                    {!isMobile && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: slide.color, letterSpacing: '-0.04em', lineHeight: 1 }}>37%</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>QS Top 1000 school educated</div>
                        </div>
                        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#60A5FA', letterSpacing: '-0.04em', lineHeight: 1 }}>100%</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>equal opportunity employer</div>
                        </div>
                        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#34D399', letterSpacing: '-0.04em', lineHeight: 1 }}>15%</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>internationally educated</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Certifications grid ───────────────────────────────────── */}
                {slide.type === 'certs' && (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)', gap: 10 }}>
                    {(slide.items as CertItem[]).map((cert, idx) => (
                      <div key={`${cert.name}-${idx}`} style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                        {/* Top accent line */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${slide.color}, transparent)`, borderRadius: '16px 16px 0 0' }} />
                        {/* Icon area */}
                        <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
                          {cert.logo ? (
                            <img src={cert.logo} alt={cert.name} width={60} height={60} style={{ objectFit: 'contain', display: 'block' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 14, color: slide.color }}>{cert.name.slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.82rem', color: '#fff', lineHeight: 1.25, marginBottom: 4 }}>{cert.name}</div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{cert.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CHAPTERS ──────────────────────────────────────────────────────────────────
const CHAPTERS = [
  { num: '2019', id: 'sec-ch0a', tag: 'The Beginning', title: 'Where it all started', sub: 'Where it all started', color: '#E879F9',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2020/06/Cheers-1024x683.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2020/06/Mgmt-1024x683.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2020/06/karaoke-1024x683.jpg',
    ],
    body: 'Phitopolis was founded, establishing a top-tier tech R&D firm in Manila with backing from global investors. A small but focused team set out to prove that world-class engineering could be built right here.' },
  { num: '2020', id: 'sec-ch0b', tag: 'Pandemic', title: 'Pandemic', sub: 'Adapting under pressure', color: '#38BDF8',
    images: [
      '/2020/1.png',
      '/2020/2.jpg',
    ],
    body: 'Transitioned our technical team to strategic remote work setups to ensure safety and continuity. The disruption forced us to rethink how distributed teams collaborate — and we came out stronger for it.' },
  { num: '2021', id: 'sec-ch1', tag: 'New Normal',  title: 'Adjusting to the new normal', sub: 'Distributed, but never disconnected', color: '#FFC72C',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2021/10/Image-from-iOS-4-768x576.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2021/10/Image-from-iOS-8-768x1024.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2021/12/DSCF0257-768x512.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2021/10/Image-from-iOS-7-768x1024.jpg',
    ],
    body: 'Solidified our distributed workflow while continuing to provide fascinating work and reliable support for our global clients. Culture and quality remained non-negotiable, regardless of where the team sat.' },
  { num: '2022', id: 'sec-ch2', tag: 'Momentum',    title: 'Gaining momentum',            sub: 'Engineering at scale',               color: '#60A5FA',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2022/03/Image-from-iOS-21-768x576.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2022/08/Image-from-iOS-33-1-768x512.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2022/12/Image-from-iOS-1-768x576.jpg',
    ],
    body: 'Expanded our teams in Manila and strengthened our core engineering capabilities as global demand for tech solutions surged. New practices, new hires, and a growing appetite for harder problems.' },
  { num: '2023', id: 'sec-ch3', tag: 'Acceleration', title: 'Accelerating the mission',   sub: 'Deeper, faster, further',            color: '#34D399',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2023/03/46E1B7F6-6580-4DCC-AB2A-C3E634F57080-2-2048x2048.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2023/04/IMG_9159-1-1-2048x1336.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2023/05/IMG_1945-1-1-2048x1536.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2023/08/IMG_5547-2-2048x1536.jpg',
    ],
    body: 'Scaled operations and integrated more advanced technologies into our development and research pipelines to meet growing client needs. The work got harder — and the team rose to match it.' },
  { num: '2024', id: 'sec-ch4', tag: 'New Heights',  title: 'Reaching new heights',        sub: 'Milestones that matter',             color: '#A78BFA',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2024/01/hike-with-mike-blog-1.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2024/04/group-pic-final-2048x1687.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2024/05/2Q-CSR_001-min-1-2048x1536.png',
      'https://phitopolis.com/blog/wp-content/uploads/2024/08/HPC-With-Tom_001.png',
    ],
    body: 'Achieved major milestones in project deliveries and significantly grew our workforce, firmly establishing our reputation. Five years in, Phitopolis had become the partner clients came back to.' },
  { num: '2025', id: 'sec-ch5', tag: 'Expansion',    title: 'Expansion',                   sub: 'New frontiers, new possibilities',   color: '#F59E0B',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2025/01/image8.png',
      'https://phitopolis.com/blog/wp-content/uploads/2025/03/DLSU-Job-Expo_001.png',
      'https://phitopolis.com/blog/wp-content/uploads/2025/05/05-2025_Enrique_Summer_Outing-7049.jpeg-2048x1536.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2025/08/3029999c-3cc5-4a42-8e66-c1d181babbc3.png',
    ],
    body: 'Broadened our market presence and explored new technological frontiers, laying the groundwork for substantial future scale. The pipeline of ideas grew as fast as the team delivering them.' },
  { num: '2026', id: 'sec-ch6', tag: 'AI Day',       title: 'New challenges, the work continues', sub: 'Tomorrow\'s technology, available today', color: '#F472B6',
    images: [
      'https://phitopolis.com/blog/wp-content/uploads/2026/02/5-2048x870.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2026/02/Image-2-2048x1536.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2026/03/Jogging-768x539.jpg',
      'https://phitopolis.com/blog/wp-content/uploads/2026/03/3-768x485.png',
    ],
    body: 'Looking ahead with a renewed commitment to making tomorrow\'s technology available today through relentless innovation. The mission is clearer than ever — and the best work is still ahead of us.' },
];

// Unique scatter layouts per year — desktop polaroid placement
// Each array maps to images[0], [1], [2], [3] of that chapter
const CHAPTER_SCATTER: Record<string, { top?: string; bottom?: string; left?: string; right?: string; width: string; rotate: string; zIndex: number }[]> = {
  // 2019 — 3 images: triangle spread, large but clear of text (left edge ≥ 46%)
  '2019': [
    { top: '-2%',    left: '48%',   width: '36%', rotate: '-7deg',  zIndex: 2 },
    { top: '20%',    right: '2%',   width: '34%', rotate:  '6deg',  zIndex: 3 },
    { bottom: '2%',  left: '50%',   width: '38%', rotate: '-3deg',  zIndex: 1 },
  ],
  // 2020 — 2 images: two large photos dominating the right half
  '2020': [
    { top: '4%',     left: '46%',   width: '44%', rotate: '-9deg',  zIndex: 2 },
    { top: '18%',    right: '0%',   width: '44%', rotate:  '7deg',  zIndex: 3 },
  ],
  // 2021 — spread across right half
  '2021': [
    { top: '14%',    left: '46%',   width: '30%', rotate: '-4deg',  zIndex: 2 },
    { top: '-4%',    right: '4%',   width: '24%', rotate:  '9deg',  zIndex: 3 },
    { bottom: '8%',  left: '50%',   width: '27%', rotate: '-8deg',  zIndex: 1 },
    { bottom: '-3%', right: '9%',   width: '22%', rotate:  '6deg',  zIndex: 3 },
  ],
  // 2022 — 3 images: diagonal cascade, large but clear of text
  '2022': [
    { top: '0%',     left: '46%',   width: '36%', rotate: '-10deg', zIndex: 1 },
    { top: '22%',    left: '54%',   width: '38%', rotate:  '-1deg', zIndex: 2 },
    { bottom: '3%',  right: '2%',   width: '36%', rotate:   '8deg', zIndex: 3 },
  ],
  // 2023 — fan spread, slightly more open but still compressed
  '2023': [
    { top: '4%',     left: '46%',   width: '32%', rotate: '-21deg', zIndex: 1 },
    { top: '14%',    left: '54%',   width: '30%', rotate:  '-7deg', zIndex: 2 },
    { top: '24%',    left: '61%',   width: '27%', rotate:   '6deg', zIndex: 3 },
    { top: '34%',    right: '2%',   width: '23%', rotate:  '20deg', zIndex: 4 },
  ],
  // 2024 — cluster pile, spread slightly but anchored right of text
  '2024': [
    { top: '14%',    left: '46%',   width: '36%', rotate: '-3deg',  zIndex: 1 },
    { top: '4%',     left: '55%',   width: '29%', rotate: '14deg',  zIndex: 2 },
    { top: '36%',    left: '48%',   width: '27%', rotate: '-16deg', zIndex: 3 },
    { top: '10%',    right: '2%',   width: '25%', rotate:  '8deg',  zIndex: 4 },
  ],
  // 2025 — wide scatter, images pushed to the four corners of the right side
  '2025': [
    { top: '-6%',    left: '46%',   width: '27%', rotate: '-7deg',  zIndex: 2 },
    { top: '28%',    right: '4%',   width: '32%', rotate: '10deg',  zIndex: 1 },
    { bottom: '10%', left: '48%',   width: '25%', rotate: '-11deg', zIndex: 3 },
    { bottom: '-5%', right: '14%',  width: '26%', rotate:  '3deg',  zIndex: 2 },
  ],
  // 2026 — curated trio with a small peeker in the corner
  '2026': [
    { top: '6%',     left: '46%',   width: '34%', rotate: '-5deg',  zIndex: 2 },
    { top: '38%',    right: '3%',   width: '29%', rotate:  '8deg',  zIndex: 3 },
    { bottom: '4%',  left: '50%',   width: '31%', rotate: '-3deg',  zIndex: 1 },
    { top: '-3%',    right: '5%',   width: '18%', rotate: '15deg',  zIndex: 4 },
  ],
};

type ScatterPos = { top?: string; bottom?: string; left?: string; right?: string; width: string; rotate: string; zIndex: number };

const ScatterPhoto = ({ src, alt, pos }: { src: string; alt: string; pos: ScatterPos }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
        width: pos.width,
        aspectRatio: '4 / 3',
        borderRadius: 8,
        border: `3px solid rgba(255,255,255,${hovered ? 1 : 0.82})`,
        boxShadow: hovered ? '0 20px 56px rgba(0,0,0,0.7)' : '0 8px 32px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        transform: hovered ? `rotate(${pos.rotate}) scale(1.07)` : `rotate(${pos.rotate})`,
        zIndex: hovered ? 10 : pos.zIndex,
        transition: 'transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s ease, border-color 0.15s ease',
        cursor: 'pointer',
        pointerEvents: 'auto',
        willChange: 'transform',
      }}
    >
      <img
        src={src}
        alt={alt}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = src.replace('.jpg', '.svg'); }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
};

const ChapterGroup = () => {
  const containerRef  = useRef<HTMLElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const panelRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef   = useRef<HTMLDivElement>(null);
  const dotRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const yearLabelRef      = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const dotProgressRef    = useRef(1); // 1 = right end, 0 = left end
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
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
            const p = self.progress;
            const chapterSpan = 1 / (N - 1);                                       // 0.2 per chapter
            const chapterIdx  = Math.min(N - 2, Math.floor(p / chapterSpan));      // 0-4
            const localProg   = (p - chapterIdx * chapterSpan) / chapterSpan;      // 0-1 within chapter
            dotProgressRef.current = 1 - Math.max(0, Math.min(1, localProg));      // 1=right, 0=left
          },
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
      style={{ height: '480vh', position: 'relative', background: C.charcoal }}
    >
      <SectionTag name="our journey" />

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Floating string */}
        <FloatingString years={CHAPTERS.map(c => c.num)} scrollProgressRef={scrollProgressRef} />

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

              {/* ── Scattered polaroid images — desktop; sits behind content row ── */}
              {!isMobile && (
                <div ref={el => { imgRefs.current[i] = el; }}
                  style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
                >
                  {(CHAPTER_SCATTER[ch.num] ?? []).map((pos, j) => j < ch.images.length && (
                    <ScatterPhoto
                      key={j}
                      src={ch.images[j]}
                      alt={`${ch.title} — ${j + 1}`}
                      pos={pos}
                    />
                  ))}
                </div>
              )}

              {/* ── Content row ───────────────────────────────────────────── */}
              <div style={{
                width: '100%', maxWidth: 1400, margin: '0 auto',
                display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center', gap: isMobile ? 44 : 'clamp(48px, 7vw, 88px)',
                position: 'relative', zIndex: 2,
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
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)', color: ch.color,
                    margin: '12px 0 0', letterSpacing: '-0.01em',
                  }}>
                    {ch.title}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.8rem, 1vw, 0.92rem)',
                    color: 'rgba(255,255,255,0.36)', lineHeight: 1.9, margin: '18px 0 0', maxWidth: 440,
                  }}>
                    {ch.body}
                  </p>
                </div>

                {/* Mobile: simple 2-image row fallback */}
                {isMobile && (
                  <div ref={el => { imgRefs.current[i] = el; }}
                    style={{ display: 'flex', gap: 8, width: '100%' }}
                  >
                    {ch.images.slice(0, 2).map((src, j) => (
                      <div key={j} style={{ flex: 1, aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}>
                        <img
                          src={src}
                          alt={`${ch.title} — ${j + 1}`}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = src.replace('.jpg', '.svg'); }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
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

  // Per-card wheel navigation (capture phase)
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
      // At first/last card: don't preventDefault → natural scroll takes over
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const activeCard = CARDS[activeIdx];

  if (isMobile) {
    return (
      <section id="sec-showcase" style={{ background: C.base, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 24px', position: 'relative', overflow: 'hidden' }}>
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
            {CARDS.map((card, i) => <ShowCard key={String(i)} card={card} index={i} isActive={i === activeIdx} />)}
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
    <section id="sec-closing" ref={ref} style={{ background: C.charcoal, height: '100vh', padding: 'clamp(80px, 10vw, 120px) 40px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
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

        {/* Technology partnerships + corporate reference strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.0, duration: 0.7 }}
          style={{ marginTop: 64, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 32 }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 24 }}>
            technology partnerships
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 28 }}>
            {([
              { name: 'AWS',       slug: 'amazonaws' },
              { name: 'Google',    slug: 'googlecloud' },
              { name: 'Anthropic', slug: 'anthropic' },
              { name: 'Azure',     slug: 'microsoftazure' },
              { name: 'NVIDIA',    slug: 'nvidia' },
              { name: 'Red Hat',   slug: 'redhat' },
            ] as { name: string; slug: string }[]).map(p => (
              <img
                key={p.slug}
                src={`https://cdn.simpleicons.org/${p.slug}`}
                alt={p.name}
                width={28}
                height={28}
                style={{ objectFit: 'contain', opacity: 0.28, filter: 'brightness(10)' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 36px', alignItems: 'center' }}>
            {(['© 2026 Phitopolis Inc.', 'Makati, Philippines', 'Est. 2021', 'AI-First Engineering'] as string[]).map(txt => (
              <span key={txt} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em' }}>
                {txt}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── END PARTICLE LOGO — idle explosions + click + cursor repulsion ────────────
const EndParticleLogo = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let mounted = true;
    const mouse = { x: -9999, y: -9999 };

    type Particle = {
      x: number; y: number;
      tx: number; ty: number;
      sx: number; sy: number;
      vx: number; vy: number;
      r: number; color: string;
      blink: number; blinkSpeed: number;
      delay: number;
      sAngle: number; sDist: number;
    };

    let particles: Particle[] = [];
    let neighborPairs: [number, number][] = [];
    let assembled = false;
    const ASSEMBLE_DURATION = 2200;
    const LOGO_CONNECT_DIST = 12;
    const LOGO_SIZE = Math.min(240, Math.max(130, window.innerWidth * 0.16));
    const startTime = performance.now();

    // Multi-click explosion support
    const EXPLODE_DURATION = 1800;
    const EXPLODE_HOLD = 800;
    const REFORM_DURATION = 2000;
    const CLUSTER_RADIUS = 50;
    type Explosion = { indices: Set<number>; start: number; phase: 'exploding' | 'holding' | 'reforming'; phaseStart: number };
    let explosions: Explosion[] = [];

    const handleClick = (e: MouseEvent) => {
      if (!assembled || particles.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      const indices = new Set<number>();
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].tx - cx, dy = particles[i].ty - cy;
        if (dx * dx + dy * dy < CLUSTER_RADIUS * CLUSTER_RADIUS) indices.add(i);
      }
      if (indices.size < 5) return;
      explosions.push({ indices, start: performance.now(), phase: 'exploding', phaseStart: performance.now() });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    const img = new Image();
    img.src = '/phitopolis_logo_white_vector.svg';
    img.onload = () => {
      if (!mounted) return;
      const aspect = img.naturalHeight / img.naturalWidth;
      const w = Math.round(LOGO_SIZE), h = Math.round(LOGO_SIZE * aspect);
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const oc = off.getContext('2d')!;
      oc.drawImage(img, 0, 0, w, h);
      const imgData = oc.getImageData(0, 0, w, h);
      const d = imgData.data;

      const step = 3;
      const edgePixels: { x: number; y: number; isGold: boolean }[] = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] < 100) continue;
          let edge = false;
          for (const [ex, ey] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
            const nx = x + ex, ny = y + ey;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h || d[(ny * w + nx) * 4 + 3] < 100) { edge = true; break; }
          }
          if (!edge) continue;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          edgePixels.push({ x, y, isGold: r > 180 && g > 140 && b < 100 });
        }
      }
      const interiorPixels: { x: number; y: number; isGold: boolean }[] = [];
      for (let y = 0; y < h; y += 5) {
        for (let x = 0; x < w; x += 5) {
          const idx = (y * w + x) * 4;
          if (d[idx + 3] < 100) continue;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          interiorPixels.push({ x, y, isGold: r > 180 && g > 140 && b < 100 });
        }
      }

      const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      shuffle(edgePixels); shuffle(interiorPixels);
      const maxParticles = 700;
      const edgeCount = Math.min(edgePixels.length, Math.round(maxParticles * 0.7));
      const interiorCount = Math.min(interiorPixels.length, maxParticles - edgeCount);
      const selected = [...edgePixels.slice(0, edgeCount), ...interiorPixels.slice(0, interiorCount)];

      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      const ox = (cw - w) / 2, oy = (ch - h) / 2;

      particles = selected.map((p) => {
        const sAngle = Math.random() * Math.PI * 2;
        const sDist = 400 + Math.random() * 600;
        const sx = ox + p.x + Math.cos(sAngle) * sDist;
        const sy = oy + p.y + Math.sin(sAngle) * sDist;
        return {
          x: sx, y: sy, tx: ox + p.x, ty: oy + p.y, sx, sy,
          vx: 0, vy: 0,
          r: p.isGold ? (0.8 + Math.random() * 1.2) : (0.6 + Math.random() * 1.0),
          color: p.isGold ? 'rgba(255,199,44,' : 'rgba(10,42,102,',
          blink: Math.random() * Math.PI * 2, blinkSpeed: 0.6 + Math.random() * 2.0,
          delay: Math.random() * 600, sAngle, sDist,
        };
      });

      neighborPairs = [];
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].tx - particles[j].tx, dy = particles[i].ty - particles[j].ty;
          if (dx * dx + dy * dy < LOGO_CONNECT_DIST * LOGO_CONNECT_DIST) neighborPairs.push([i, j]);
        }
      }
      assembled = true;
    };

    const tick = (now: number) => {
      if (!mounted) return;
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      if (!assembled || particles.length === 0) { raf = requestAnimationFrame(tick); return; }

      const elapsed = now - startTime;
      const t = now * 0.001;

      // Update explosion state machines and compute per-particle strength
      const particleExplode = new Float32Array(particles.length); // default 0
      for (let ei = explosions.length - 1; ei >= 0; ei--) {
        const ex = explosions[ei];
        let strength = 0;
        if (ex.phase === 'exploding') {
          const tt = (now - ex.phaseStart) / EXPLODE_DURATION;
          if (tt >= 1) { ex.phase = 'holding'; ex.phaseStart = now; strength = 1; }
          else strength = 1 - Math.pow(1 - tt, 3);
        } else if (ex.phase === 'holding') {
          strength = 1;
          if (now - ex.phaseStart > EXPLODE_HOLD) { ex.phase = 'reforming'; ex.phaseStart = now; }
        } else if (ex.phase === 'reforming') {
          const tt = (now - ex.phaseStart) / REFORM_DURATION;
          if (tt >= 1) { explosions.splice(ei, 1); continue; }
          else strength = 1 - (tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2);
        }
        // Apply max strength per particle across all active explosions
        for (const idx of ex.indices) {
          if (strength > particleExplode[idx]) particleExplode[idx] = strength;
        }
      }

      // Update particles
      for (let pi = 0; pi < particles.length; pi++) {
        const p = particles[pi];
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        const ease = 1 - Math.pow(1 - assembleT, 3);
        const pExplode = particleExplode[pi];

        let goalX = p.tx, goalY = p.ty;
        if (pExplode > 0) {
          const dist = p.sDist * 0.45;
          goalX = p.tx + Math.cos(p.sAngle) * pExplode * dist;
          goalY = p.ty + Math.sin(p.sAngle) * pExplode * dist;
        }

        if (assembleT < 1) {
          p.x = p.sx + (goalX - p.sx) * ease;
          p.y = p.sy + (goalY - p.sy) * ease;
        } else {
          const springForce = 0.035 - pExplode * 0.031;
          p.vx += (goalX - p.x) * springForce;
          p.vy += (goalY - p.y) * springForce;
          // Cursor repulsion
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          const repelRadius = 60;
          if (d2 < repelRadius * repelRadius && d2 > 0) {
            const dd = Math.sqrt(d2), f = (repelRadius - dd) / repelRadius;
            p.vx += (dx / dd) * f * 3.5; p.vy += (dy / dd) * f * 3.5;
          }
          const damping = 0.88 - pExplode * 0.08;
          p.vx *= damping; p.vy *= damping;
          p.x += p.vx; p.y += p.vy;
        }
      }

      // Logo-network connections
      if (neighborPairs.length > 0) {
        for (const [i, j] of neighborPairs) {
          const pairExplode = Math.max(particleExplode[i], particleExplode[j]);
          const logoFade = 1 - pairExplode;
          if (logoFade < 0.01) continue;
          const pi = particles[i], pj = particles[j];
          const ti = Math.min(1, Math.max(0, (elapsed - pi.delay) / ASSEMBLE_DURATION));
          const tj = Math.min(1, Math.max(0, (elapsed - pj.delay) / ASSEMBLE_DURATION));
          const arrivalA = Math.min(ti, tj);
          if (arrivalA < 0.02) continue;
          const tdx = pi.tx - pj.tx, tdy = pi.ty - pj.ty;
          const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
          const alpha = arrivalA * logoFade * (1 - tDist / LOGO_CONNECT_DIST) * 0.42;
          if (alpha < 0.01) continue;
          ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(10,42,102,${alpha.toFixed(3)})`; ctx.lineWidth = 0.4; ctx.stroke();
        }
      }

      // Draw particles
      for (const p of particles) {
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        const fadeIn = Math.min(1, assembleT * 2);
        const blinkAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.blinkSpeed + p.blink));
        const alpha = fadeIn * blinkAlpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha.toFixed(3) + ')'; ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  );
};

// ── SPECIAL END SLIDE — white with particle logo ──────────────────────────────
const SpecialEndSlide = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (inView) return;
      const rect = el.getBoundingClientRect();
      // Trigger when the section's top is at or above the viewport midpoint
      if (rect.top <= window.innerHeight / 2) setInView(true);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [inView]);
  return (
    <section id="sec-end" ref={ref}
      style={{ background: '#FFFFFF', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
    >
      <EndParticleLogo active={inView} />
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

    // Hide scrollbar + CSS scroll snap for section navigation
    const style = document.createElement('style');
    style.id = 'ai-day-scroll';
    style.textContent = `
      html::-webkit-scrollbar { display: none; }
      html { scrollbar-width: none; -ms-overflow-style: none; scroll-snap-type: y proximity; }
      #sec-hero, #sec-statement, #sec-vision, #sec-techstack, #sec-stats, #sec-closing, #sec-end { scroll-snap-align: start; }
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
        <SubSectionSnap />
        <FloatNav />
        <Hero ready={ready} />
        <Statement />
        <Process />
        <MarqueeSection />
        <ServicesScrollStory />
        <TechStack />
        <div style={{ display: 'none' }}><Stats /></div>
        <OurPeople />
        <Vision />
        <ChapterGroup />
        {false && <Showcase />}
        {false && <Closing />}
        <SpecialEndSlide />
      </div>
    </>
  );
}
