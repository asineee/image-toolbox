'use client';

import React from 'react';
import { DropZone } from './DropZone';
import { 
  ShieldCheck, 
  Maximize2, 
  FileArchive, 
  FileType, 
  RotateCw, 
  FlipHorizontal, 
  Info,
  Zap
} from 'lucide-react';

interface LandingHeroProps {
  onImageSelected: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  onOpenBatch?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onImageSelected, onFilesSelected, onOpenBatch }) => {
  const tools = [
    {
      icon: Maximize2,
      name: 'Resize',
      desc: 'Modify width & height while locking aspect ratio.',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      icon: FileArchive,
      name: 'Compress',
      desc: 'Reduce file size with fine quality controls.',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      icon: FileType,
      name: 'Convert',
      desc: 'Seamlessly switch between JPG, PNG, and WebP.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: RotateCw,
      name: 'Rotate',
      desc: 'Rotate images in 90-degree steps left or right.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      icon: FlipHorizontal,
      name: 'Flip',
      desc: 'Mirror images horizontally or vertically.',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      icon: Info,
      name: 'Image Info',
      desc: 'Inspect dimensions, file size, format & aspect ratio.',
      color: 'from-indigo-500/20 to-brand-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      icon: Zap,
      name: 'Batch Processing',
      desc: 'Process multiple images simultaneously.',
      color: 'from-brand-500/20 to-cyan-500/10 border-brand-500/30 text-cyan-400',
    },
  ];

  return (
    <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle Background Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center">
        
        {/* Privacy Promise Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/90 border border-gray-700/80 text-xs font-semibold text-gray-200 mb-6 shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Private by design • Your images stay on your device</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Powerful image tools.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400">
            Right in your browser.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Resize, compress, convert and edit your images without sending them to a server.
        </p>

        {/* Upload Card */}
        <DropZone onImageSelected={onImageSelected} onFilesSelected={onFilesSelected} />

        {/* Quick Batch Access Action */}
        {onOpenBatch && (
          <div className="mt-4 text-center">
            <button
              onClick={onOpenBatch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/80 hover:bg-dark-800 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:text-white transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or process multiple images together with Batch Processing →</span>
            </button>
          </div>
        )}

        {/* Tools Feature Grid */}
        <div className="mt-24 text-left">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Included Studio Tools</h2>
              <p className="text-sm text-gray-400 mt-1">All operations execute locally in your browser session.</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-400 font-medium bg-brand-950/60 border border-brand-800/50 px-3 py-1.5 rounded-lg">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero Upload Delay</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const IconComp = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="p-5 rounded-2xl bg-dark-800/50 border border-gray-800/80 hover:border-gray-700/80 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{tool.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
