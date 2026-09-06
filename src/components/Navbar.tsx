'use client';

import React from 'react';
import { ShieldCheck, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  hasImage: boolean;
  onReset?: () => void;
  onNewImage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ hasImage, onReset, onNewImage }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-900/80 border-b border-gray-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewImage}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-cyan-400 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
                IMAGE TOOLBOX
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-brand-400 bg-brand-950/80 border border-brand-800/50 px-2 py-0.5 rounded-full uppercase">
                v1.0
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">In-Browser Image Studio</p>
          </div>
        </div>

        {/* Center Privacy Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Private by design • Your images stay on your device</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {hasImage ? (
            <>
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-gray-700/60 rounded-lg transition-colors"
                  title="Reset edits to original image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Edits</span>
                </button>
              )}

              {onNewImage && (
                <button
                  onClick={onNewImage}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-lg shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Choose Another Image</span>
                </button>
              )}
            </>
          ) : (
            <a
              href="#privacy-section"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 md:hidden" />
              <span>How Privacy Works</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
