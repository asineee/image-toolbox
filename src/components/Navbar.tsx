'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Layers, RotateCcw, Undo2, Redo2, Plus } from 'lucide-react';

interface NavbarProps {
  hasImage: boolean;
  onReset?: () => void;
  onNewImage?: () => void;
  onOpenBatch?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasImage,
  onReset,
  onNewImage,
  onOpenBatch,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 px-4 lg:px-8 border-b transition-all duration-300 glass-shine ${
        scrolled
          ? 'py-2.5 bg-black/80 backdrop-blur-md border-line-800'
          : 'py-4 bg-black/40 backdrop-blur-sm border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand */}
        <button
          onClick={onNewImage}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-blue-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-glow-sm">
            <span className="text-white font-black text-sm tracking-tighter">IT</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-semibold text-[15px] text-paper-100 tracking-tight">Image Toolbox</div>
          </div>
        </button>

        {/* Center Privacy Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-paper-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
          <span>Processed on your device — nothing is uploaded</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenBatch && !hasImage && (
            <button
              onClick={onOpenBatch}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-paper-300 hover:text-paper-100 border border-line-800 hover:border-ink-500 rounded-md transition-colors glass-shine"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch</span>
            </button>
          )}

          {hasImage ? (
            <>
              <div className="flex items-center gap-0.5 border border-line-800 rounded-md p-0.5 glass-shine">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-1.5 rounded text-paper-400 hover:text-paper-100 hover:bg-ink-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-paper-400 transition-colors"
                  title="Undo last edit"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-1.5 rounded text-paper-400 hover:text-paper-100 hover:bg-ink-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-paper-400 transition-colors"
                  title="Redo edit"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {onReset && (
                <button
                  onClick={onReset}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-paper-300 hover:text-paper-100 border border-line-800 hover:border-ink-500 rounded-md transition-colors glass-shine"
                  title="Reset edits to original image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {onNewImage && (
                <button
                  onClick={onNewImage}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-md transition-all shadow-glow-sm hover:shadow-glow glass-shine"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>New Image</span>
                </button>
              )}
            </>
          ) : (
            <a
              href="#privacy-section"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-paper-400 hover:text-paper-100 transition-colors"
            >
              <span>Privacy</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
