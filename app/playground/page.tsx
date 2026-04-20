import React, { useRef, useEffect } from 'react';

export default function PlaygroundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
      r: number;
      color: string;
      blink: number;
      blinkSpeed: number;
      delay: number;
      sAngle: number;
      sDist: number;
    };

    let particles: Particle[] = [];
    let neighborPairs: [number, number][] = [];
    let assembled = false;
    const ASSEMBLE_DURATION = 2200;
    const LOGO_CONNECT_DIST = 12;
    const LOGO_SIZE = Math.min(480, Math.max(260, window.innerWidth * 0.32));

    // Idle explosion state
    const IDLE_TIMEOUT = 5000;
    const EXPLODE_DURATION = 1800;
    const EXPLODE_HOLD = 1200;
    const REFORM_DURATION = 2000;
    const REFORM_COOLDOWN = 3000;
    const CLUSTER_RADIUS = 80;
    let prevMouseX = -9999;
    let prevMouseY = -9999;
    type IdleCluster = { indices: Set<number>; delay: number };
    // Each explosion is independent and runs its own lifecycle
    type Explosion = {
      clusters: IdleCluster[];
      allIndices: Set<number>;
      phase: 'exploding' | 'holding' | 'reforming';
      phaseStart: number;
      fromClick: boolean;
    };
    let explosions: Explosion[] = [];
    let lastInteraction = 0;

    const assembleStart = performance.now() + 400;

    const buildClusterAt = (cx: number, cy: number, radius: number) => {
      const cluster = new Set<number>();
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].tx - cx;
        const dy = particles[i].ty - cy;
        if (dx * dx + dy * dy < radius * radius) cluster.add(i);
      }
      return cluster;
    };

    const buildRandomClusters = (): IdleCluster[] => {
      if (particles.length === 0) return [];
      const count = Math.random() < 0.5 ? 1 : 2;
      const clusters: IdleCluster[] = [];
      const seeds: { tx: number; ty: number }[] = [];
      for (let c = 0; c < count; c++) {
        for (let attempts = 0; attempts < 20; attempts++) {
          const s = particles[Math.floor(Math.random() * particles.length)];
          const tooClose = seeds.some(prev => {
            const dx = prev.tx - s.tx; const dy = prev.ty - s.ty;
            return dx * dx + dy * dy < (CLUSTER_RADIUS * 1.5) ** 2;
          });
          if (!tooClose || attempts === 19) {
            seeds.push(s);
            const indices = buildClusterAt(s.tx, s.ty, CLUSTER_RADIUS);
            const delay = c === 0 ? 0 : 300 + Math.random() * 400;
            clusters.push({ indices, delay });
            break;
          }
        }
      }
      return clusters;
    };

    const handleClick = (e: MouseEvent) => {
      if (!assembled || particles.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const cluster = buildClusterAt(cx, cy, CLUSTER_RADIUS);
      if (cluster.size < 5) return;
      explosions.push({
        clusters: [{ indices: cluster, delay: 0 }],
        allIndices: cluster,
        phase: 'exploding',
        phaseStart: performance.now(),
        fromClick: true,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    // Load SVG and sample pixels (same approach as hero ParticleLogo)
    const img = new Image();
    img.src = '/phitopolis_logo_white_vector.svg';
    img.onload = () => {
      if (!mounted) return;
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
          if (d[idx + 3] < 100) continue;
          let edge = false;
          for (const [ex, ey] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
            const nx = x + ex, ny = y + ey;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h || d[(ny * w + nx) * 4 + 3] < 100) {
              edge = true;
              break;
            }
          }
          if (!edge) continue;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const isGold = r > 180 && g > 140 && b < 100;
          edgePixels.push({ x, y, isGold });
        }
      }

      // Interior points for density
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

      const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      shuffle(edgePixels);
      shuffle(interiorPixels);
      const maxParticles = 700;
      const edgeCount = Math.min(edgePixels.length, Math.round(maxParticles * 0.7));
      const interiorCount = Math.min(interiorPixels.length, maxParticles - edgeCount);
      const selected = [...edgePixels.slice(0, edgeCount), ...interiorPixels.slice(0, interiorCount)];

      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      const ox = (cw - w) / 2;
      const oy = (ch - h) / 2;

      particles = selected.map((p) => {
        const sAngle = Math.random() * Math.PI * 2;
        const sDist = 600 + Math.random() * 1000;
        const sx = ox + p.x + Math.cos(sAngle) * sDist;
        const sy = oy + p.y + Math.sin(sAngle) * sDist;
        return {
          x: sx, y: sy,
          tx: ox + p.x, ty: oy + p.y,
          sx, sy,
          vx: 0, vy: 0,
          r: p.isGold ? (0.8 + Math.random() * 1.2) : (0.6 + Math.random() * 1.0),
          // On white bg: gold stays gold, non-gold becomes deep blue
          color: p.isGold ? 'rgba(255,199,44,' : 'rgba(10,42,102,',
          blink: Math.random() * Math.PI * 2,
          blinkSpeed: 0.6 + Math.random() * 2.0,
          delay: Math.random() * 600,
          sAngle,
          sDist,
        };
      });

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

      assembled = true;
      lastInteraction = performance.now() + ASSEMBLE_DURATION + 600;
    };

    // Background ambient dots
    type BgDot = { x: number; y: number; vx: number; vy: number; r: number; blink: number; blinkSpeed: number };
    let bgDots: BgDot[] = [];
    const initBgDots = () => {
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      bgDots = Array.from({ length: 120 }, () => ({
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
      const elapsed = now - assembleStart;

      // Idle detection — mouse movement cancels non-click idle explosions
      if (Math.abs(mouse.x - prevMouseX) > 2 || Math.abs(mouse.y - prevMouseY) > 2) {
        lastInteraction = now;
        explosions = explosions.filter(ex => ex.fromClick);
      }
      prevMouseX = mouse.x;
      prevMouseY = mouse.y;

      // Advance each explosion's state machine independently
      for (const ex of explosions) {
        if (ex.phase === 'exploding') {
          const maxDelay = ex.clusters.reduce((m, c) => Math.max(m, c.delay), 0);
          if (now - ex.phaseStart >= EXPLODE_DURATION + maxDelay) {
            ex.phase = 'holding';
            ex.phaseStart = now;
          }
        } else if (ex.phase === 'holding') {
          if (now - ex.phaseStart > EXPLODE_HOLD) {
            ex.phase = 'reforming';
            ex.phaseStart = now;
          }
        } else if (ex.phase === 'reforming') {
          // finished explosions get removed below
        }
      }

      // Remove finished explosions and reset idle cooldown
      const before = explosions.length;
      explosions = explosions.filter(ex => {
        if (ex.phase === 'reforming' && (now - ex.phaseStart) / REFORM_DURATION >= 1) return false;
        return true;
      });
      if (explosions.length < before) {
        lastInteraction = now - IDLE_TIMEOUT + REFORM_COOLDOWN;
      }

      // Spawn idle explosion when nothing is active and idle timeout passed
      const assemblyDone = elapsed > ASSEMBLE_DURATION + 600;
      if (assemblyDone && explosions.length === 0 && lastInteraction > 0 && now - lastInteraction > IDLE_TIMEOUT) {
        const clusters = buildRandomClusters();
        const allIndices = new Set<number>();
        for (const c of clusters) for (const idx of c.indices) allIndices.add(idx);
        explosions.push({ clusters, allIndices, phase: 'exploding', phaseStart: now, fromClick: false });
      }

      // Compute per-particle explosion strength across all active explosions
      // and collect all active explosion indices for scatter connections
      const particleStrength = new Float32Array(particles.length); // defaults to 0
      let allActiveIndices = new Set<number>();
      let maxExplodeStrength = 0;

      for (const ex of explosions) {
        const cStrengths: number[] = [];
        if (ex.phase === 'exploding') {
          for (const cluster of ex.clusters) {
            const ct = Math.max(0, now - ex.phaseStart - cluster.delay) / EXPLODE_DURATION;
            cStrengths.push(ct >= 1 ? 1 : (ct <= 0 ? 0 : 1 - Math.pow(1 - ct, 3)));
          }
        } else if (ex.phase === 'holding') {
          for (let i = 0; i < ex.clusters.length; i++) cStrengths.push(1);
        } else if (ex.phase === 'reforming') {
          const t = (now - ex.phaseStart) / REFORM_DURATION;
          const s = t >= 1 ? 0 : 1 - (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          for (let i = 0; i < ex.clusters.length; i++) cStrengths.push(s);
        }
        const exMax = cStrengths.length > 0 ? Math.max(...cStrengths) : 0;
        if (exMax > maxExplodeStrength) maxExplodeStrength = exMax;
        for (const idx of ex.allIndices) allActiveIndices.add(idx);
        // Per-particle: take the max across each cluster it belongs to
        for (let ci = 0; ci < ex.clusters.length; ci++) {
          for (const idx of ex.clusters[ci].indices) {
            if (cStrengths[ci] > particleStrength[idx]) particleStrength[idx] = cStrengths[ci];
          }
        }
      }

      // Load-time scatter visibility
      const assemblyProgress = Math.min(1, Math.max(0, elapsed / ASSEMBLE_DURATION));
      const loadScatter = 1 - assemblyProgress;
      const clusterFraction = particles.length > 0 ? allActiveIndices.size / particles.length : 0;
      const bgVisibility = Math.max(loadScatter, maxExplodeStrength * clusterFraction);

      // Update background dots
      for (const b of bgDots) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x = cw; if (b.x > cw) b.x = 0;
        if (b.y < 0) b.y = ch; if (b.y > ch) b.y = 0;
      }

      // Update particles
      for (let pi = 0; pi < particles.length; pi++) {
        const p = particles[pi];
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        const ease = 1 - Math.pow(1 - assembleT, 3);

        const pIdleStrength = particleStrength[pi];

        let goalX = p.tx;
        let goalY = p.ty;

        if (pIdleStrength > 0) {
          const dist = p.sDist * 0.45;
          goalX = p.tx + Math.cos(p.sAngle) * pIdleStrength * dist;
          goalY = p.ty + Math.sin(p.sAngle) * pIdleStrength * dist;
        }

        if (assembleT < 1) {
          p.x = p.sx + (goalX - p.sx) * ease;
          p.y = p.sy + (goalY - p.sy) * ease;
        } else {
          const springForce = 0.035 - pIdleStrength * 0.031;
          p.vx += (goalX - p.x) * springForce;
          p.vy += (goalY - p.y) * springForce;

          // Cursor attraction (magnet) — disabled while any explosion is active
          if (explosions.length === 0) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const d2 = dx * dx + dy * dy;
            const magnetRadius = 120;
            if (d2 < magnetRadius * magnetRadius && d2 > 0) {
              const d = Math.sqrt(d2);
              const f = (magnetRadius - d) / magnetRadius;
              p.vx += (dx / d) * f * 3.5;
              p.vy += (dy / d) * f * 3.5;
            }
          }

          const damping = 0.88 - pIdleStrength * 0.08;
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // Logo-network connections
      if (neighborPairs.length > 0) {
        for (const [i, j] of neighborPairs) {
          const pairStrength = Math.max(particleStrength[i], particleStrength[j]);
          const fade = 1 - pairStrength;
          if (fade < 0.01) continue;
          const pi = particles[i], pj = particles[j];
          const ti = Math.min(1, Math.max(0, (elapsed - pi.delay) / ASSEMBLE_DURATION));
          const tj = Math.min(1, Math.max(0, (elapsed - pj.delay) / ASSEMBLE_DURATION));
          const arrivalA = Math.min(ti, tj);
          if (arrivalA < 0.02) continue;
          const tdx = pi.tx - pj.tx, tdy = pi.ty - pj.ty;
          const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
          const alpha = arrivalA * fade * (1 - tDist / LOGO_CONNECT_DIST) * 0.42;
          if (alpha < 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(10,42,102,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      // Background dot ↔ particle connections
      if (bgVisibility > 0.05) {
        const bgConnectDist = 110;
        for (const p of particles) {
          for (const b of bgDots) {
            const dx = p.x - b.x, dy = p.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bgConnectDist * bgConnectDist) {
              const dist = Math.sqrt(d2);
              const alpha = (1 - dist / bgConnectDist) * bgVisibility * 0.2;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(10,42,102,${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // Draw background dots
      const t = now * 0.001;
      if (bgVisibility > 0) {
        for (const b of bgDots) {
          const blinkAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * b.blinkSpeed + b.blink));
          const alpha = bgVisibility * blinkAlpha * 0.55;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(10,42,102,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // Draw particles
      for (const p of particles) {
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const assembleT = Math.min(1, particleElapsed / ASSEMBLE_DURATION);
        const fadeIn = elapsed < 0 ? 1 : Math.min(1, assembleT * 2);
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
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
      />
    </div>
  );
}
