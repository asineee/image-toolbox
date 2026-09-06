'use client';

import React from 'react';
import { ShieldCheck, Image as ImageIcon } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-gray-800/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-cyan-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight">IMAGE TOOLBOX</span>
            <p className="text-[11px] text-gray-400">In-Browser Private Image Studio</p>
          </div>
        </div>

        {/* Center Privacy Note */}
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>All image processing is performed locally in your browser.</span>
        </div>

        {/* Copyright */}
        <div className="text-gray-400 text-center md:text-right">
          <p>© {new Date().getFullYear()} Image Toolbox. All rights reserved.</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Built with Next.js 14, React 18 & TypeScript.</p>
        </div>

      </div>
    </footer>
  );
};
