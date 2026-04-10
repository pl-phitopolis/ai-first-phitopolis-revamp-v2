import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';

const CHARS = '!<>-_\\/[]{}=+*^?#@$%';

interface TextScrambleProps {
  text: string;
  className?: string;
}

const TextScramble: React.FC<TextScrambleProps> = ({ text, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  // once: false so we can loop; re-trigger while still in view
  const isInView = useInView(ref as React.RefObject<Element>, { once: false, margin: '-40px 0px' });

  const [chars, setChars] = useState(() =>
    text.split('').map(c => ({ char: CHARS[0], final: c === ' ' }))
  );

  const rafRef    = useRef<number | null>(null);
  const loopRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inViewRef = useRef(false);

  // Keep inViewRef in sync for use inside closures
  useEffect(() => { inViewRef.current = isInView; }, [isInView]);

  const runScramble = useCallback(() => {
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    if (loopRef.current) clearTimeout(loopRef.current);

    const letters = text.split('');
    // Increased: 10× frames (was 5×); wider settle range keeps more chars scrambling longer
    const totalFrames = Math.max(200, letters.length * 10);
    let frame = 0;

    const queue = letters.map((c, i) => ({
      char: c,
      // Settle range 60 %–100 % (was 35 %–100 %) → more chars scrambling simultaneously
      endFrame: Math.floor((i / letters.length) * totalFrames * 0.4 + totalFrames * 0.6),
    }));

    const maxEnd = Math.max(...queue.map(q => q.endFrame));

    const tick = () => {
      frame++;
      setChars(queue.map(({ char, endFrame }) => {
        if (char === ' ') return { char, final: true };
        if (frame >= endFrame) return { char, final: true };
        return { char: CHARS[Math.floor(Math.random() * CHARS.length)], final: false };
      }));

      if (frame <= maxEnd) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setChars(letters.map(c => ({ char: c, final: true })));
        // Re-scramble every 4.5 s while still in view
        loopRef.current = setTimeout(() => {
          if (inViewRef.current) runScramble();
        }, 4500);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [text]);

  useEffect(() => {
    if (isInView) {
      runScramble();
    } else {
      if (rafRef.current)  cancelAnimationFrame(rafRef.current);
      if (loopRef.current) clearTimeout(loopRef.current);
    }
    return () => {
      if (rafRef.current)  cancelAnimationFrame(rafRef.current);
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [isInView, runScramble]);

  return (
    <span ref={ref} className={className} style={{ display: 'block', position: 'relative', overflow: 'visible', paddingBottom: '0.25em' }}>
      {/* Invisible placeholder keeps correct dimensions */}
      <span style={{ visibility: 'hidden' }} aria-hidden="true">{text}</span>
      {/* Animated overlay */}
      <span style={{ position: 'absolute', inset: 0 }}>
        {chars.map((item, i) =>
          item.char === ' ' ? (
            <React.Fragment key={i}>{' '}</React.Fragment>
          ) : (
            <span
              key={i}
              style={item.final ? {} : { color: 'rgba(255, 199, 44, 0.65)' }}
            >
              {item.char}
            </span>
          )
        )}
      </span>
    </span>
  );
};

export default TextScramble;
