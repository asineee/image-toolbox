'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-paper-500">

        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-black text-[10px] tracking-tighter">IT</span>
          </div>
          <span className="font-medium text-paper-300">Image Toolbox</span>
        </div>

        <div className="flex items-center gap-1.5 text-paper-500">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-soft" />
          <span>All processing happens locally in your browser</span>
        </div>

        <div className="text-paper-500">
          © {new Date().getFullYear()} Image Toolbox
        </div>

      </div>
    </footer>
  );
};
