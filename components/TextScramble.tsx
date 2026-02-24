import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const CHARS = '!<>-_\\/[]{}=+*^?#@$%';

interface TextScrambleProps {
  text: string;
  className?: string;
}

const TextScramble: React.FC<TextScrambleProps> = ({ text, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-60px 0px' });

  const [chars, setChars] = useState(() =>
    text.split('').map(c => ({ char: CHARS[0], final: c === ' ' || c === "'" || c === '.' || c === ',' || c === '!' || c === '?' }))
  );

  const hasAnimated = useRef(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const letters = text.split('');
    const totalFrames = Math.max(55, letters.length * 2.5);
    let frame = 0;

    const queue = letters.map((c, i) => ({
      char: c,
      endFrame: Math.floor((i / letters.length) * totalFrames * 0.65 + totalFrames * 0.35),
    }));

    const maxEnd = Math.max(...queue.map(q => q.endFrame));

    const animate = () => {
      frame++;
      const updated = queue.map(({ char, endFrame }) => {
        const isSpecial = char === ' ' || char === "'" || char === '.' || char === ',' || char === '!' || char === '?';
        if (isSpecial) return { char, final: true };
        if (frame >= endFrame) return { char, final: true };
        return { char: CHARS[Math.floor(Math.random() * CHARS.length)], final: false };
      });
      setChars(updated);

      if (frame <= maxEnd) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setChars(letters.map(c => ({ char: c, final: true })));
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [isInView]);

  return (
    <span ref={ref} className={className}>
      {chars.map((item, i) =>
        item.char === ' ' ? (
          <React.Fragment key={i}>{' '}</React.Fragment>
        ) : (
          <span
            key={i}
            style={item.final ? {} : { color: 'rgba(255, 199, 44, 0.65)', fontFamily: 'monospace' }}
          >
            {item.char}
          </span>
        )
      )}
    </span>
  );
};

export default TextScramble;
