'use client';

import React from 'react';
import { DropZone } from './DropZone';
import { Reveal } from './Reveal';
import {
  Maximize2,
  FileArchive,
  FileType,
  RotateCw,
  Crop,
  Info,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface LandingHeroProps {
  onImageSelected: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  onOpenBatch?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onImageSelected, onFilesSelected, onOpenBatch }) => {
  const tools = [
    {
      icon: Crop,
      name: 'Crop',
      desc: 'Select and cut the exact frame you need, with live pixel dimensions.',
    },
    {
      icon: Maximize2,
      name: 'Resize',
      desc: 'Set precise width and height, or scale by percentage with ratio locked.',
    },
    {
      icon: RotateCw,
      name: 'Rotate & flip',
      desc: 'Straighten orientation in 90° steps or mirror on either axis.',
    },
    {
      icon: FileArchive,
      name: 'Compress',
      desc: 'Dial in quality against file size with a live before/after readout.',
    },
    {
      icon: FileType,
      name: 'Convert',
      desc: 'Move between JPG, PNG, and WebP without losing transparency.',
    },
    {
      icon: Info,
      name: 'Image info',
      desc: 'Inspect dimensions, format, size, and aspect ratio at a glance.',
    },
    {
      icon: ShieldCheck,
      name: 'Metadata cleaner',
      desc: 'Strip camera, timestamp, and GPS data before you share a photo.',
    },
    {
      icon: Layers,
      name: 'Batch processing',
      desc: 'Apply one operation across many images and export as a ZIP.',
    },
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto">

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">

          {/* Left: Headline + copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-paper-300 mb-7 px-3 py-1.5 rounded-full surface">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span>Nothing you upload ever leaves your browser</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="text-paper-100">Edit images </span>
              <span className="text-gradient">without sending</span>
              <span className="text-paper-100"> them anywhere.</span>
            </h1>

            <p className="text-base sm:text-lg text-paper-400 leading-relaxed max-w-md mb-10">
              Crop, resize, compress, and convert photos entirely inside your browser tab. No accounts, no cloud storage, no waiting on uploads.
            </p>

            <div>
              <DropZone onImageSelected={onImageSelected} onFilesSelected={onFilesSelected} />
              {onOpenBatch && (
                <button
                  onClick={onOpenBatch}
                  className="mt-4 text-xs text-paper-400 hover:text-paper-100 underline underline-offset-2 transition-colors"
                >
                  Or process several images at once with batch mode
                </button>
              )}
            </div>
          </div>

          {/* Right column on desktop: tool list preview */}
          <div className="hidden lg:block pt-2">
            <div className="rounded-2xl overflow-hidden divide-y divide-line-800 surface shadow-glow-white">
              {tools.slice(0, 5).map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.name} className="flex items-start gap-3 p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-ink-800 border border-line-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent-soft" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-paper-100">{tool.name}</div>
                      <div className="text-xs text-paper-500 mt-0.5">{tool.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full tool grid */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Every <span className="text-gradient-cool">tool</span>, in one place
            </h2>
            <span className="text-xs text-paper-500 font-mono hidden sm:block">{tools.length} tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="group p-6 rounded-2xl surface hover:border-line-600 hover:shadow-glow-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 border border-line-800 flex items-center justify-center mb-4 group-hover:from-violet-500/30 group-hover:via-fuchsia-500/30 group-hover:to-blue-500/30 transition-colors">
                    <Icon className="w-5 h-5 text-accent-soft" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-paper-100 mb-1.5">{tool.name}</h3>
                  <p className="text-xs text-paper-500 leading-relaxed">{tool.desc}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

      </div>
    </section>
  );
};
