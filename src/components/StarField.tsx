'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Star {
  id: number;
  left: number;      // vw %
  top: number;        // vh % (only used for twinkle-only stars)
  size: number;        // px
  opacityMin: number;
  opacityMax: number;
  duration: number;    // seconds
  delay: number;       // seconds
  fall: boolean;
  fallDuration: number;
  tint: string;
}

const TINTS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#E0E7FF', '#FCE7F3', '#DBEAFE'];

function generateStars(count: number, fallRatio: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const fall = Math.random() < fallRatio;
    stars.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6,
      opacityMin: 0.15 + Math.random() * 0.2,
      opacityMax: 0.6 + Math.random() * 0.4,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      fall,
      fallDuration: 18 + Math.random() * 28,
      tint: TINTS[Math.floor(Math.random() * TINTS.length)],
    });
  }
  return stars;
}

/**
 * Subtle animated star/particle background. Purely decorative — fixed position,
 * pointer-events disabled, so it never intercepts clicks or scrolling. Rendered
 * only on the client (after mount) to avoid SSR/CSR hydration mismatches from
 * random star placement, and respects prefers-reduced-motion via CSS.
 */
export const StarField: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 70% fixed twinkling stars, 30% slowly falling + twinkling stars
  const stars = useMemo(() => (mounted ? generateStars(110, 0.3) : []), [mounted]);

  if (!mounted) return <div className="star-field" aria-hidden="true" />;

  return (
    <div className="star-field" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.fall ? 'star star-fall' : 'star star-twinkle-only'}
          style={{
            left: `${s.left}%`,
            top: s.fall ? '-5vh' : `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.tint,
            // @ts-ignore custom properties
            '--star-min-o': s.opacityMin,
            '--star-max-o': s.opacityMax,
            animationDuration: s.fall ? `${s.fallDuration}s, ${s.duration}s` : `${s.duration}s`,
            animationDelay: s.fall ? `${s.delay}s, ${s.delay}s` : `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
