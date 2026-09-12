'use client';

import { useEffect, useRef } from 'react';

/**
 * Drives the cursor-reactive "liquid glass" reflection. A single delegated
 * mousemove listener on window walks the full ancestor chain under the
 * cursor (not just the nearest match) and updates --mx/--my — each relative
 * to that element's own box — on every glass surface in that chain.
 *
 * This matters for nested glass (e.g. a gradient button inside a glass
 * panel): updating only the innermost match would leave the outer panel's
 * highlight frozen in place the moment the cursor entered the button (CSS
 * :hover stays true on ancestors while a descendant is hovered, so its glow
 * stays visible but stops tracking) — producing a "stuck" light. Updating
 * every matching ancestor together means the highlight keeps following the
 * live cursor position on every layer it's currently over, so it reads as
 * one continuous reflection passing across nested glass rather than a light
 * jumping or duplicating.
 *
 * Purely decorative — never intercepts clicks, never touches app state or
 * image-processing logic.
 */
export const GlassCursor: React.FC = () => {
  const chainRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId = 0;
    let clientX = 0;
    let clientY = 0;

    const isGlass = (node: Element): boolean =>
      node.classList.contains('surface') ||
      node.classList.contains('surface-solid') ||
      node.classList.contains('glass-shine');

    const apply = () => {
      rafId = 0;
      for (const el of chainRef.current) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${clientX - rect.left}px`);
        el.style.setProperty('--my', `${clientY - rect.top}px`);
      }
    };

    const onMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;

      // Walk the full ancestor chain (not just the nearest match) so every
      // nested glass layer the cursor is currently over gets updated.
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const chain: HTMLElement[] = [];

      if (path.length) {
        for (const node of path) {
          if (node instanceof HTMLElement && isGlass(node)) {
            chain.push(node);
          }
        }
      } else {
        // Fallback for environments without composedPath support
        let node = e.target as HTMLElement | null;
        while (node) {
          if (isGlass(node)) chain.push(node);
          node = node.parentElement;
        }
      }

      chainRef.current = chain;
      if (!chain.length) return;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
};
