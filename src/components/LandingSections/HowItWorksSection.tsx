'use client';

import React from 'react';
import { Upload, SlidersHorizontal, Download } from 'lucide-react';
import { Reveal } from '../Reveal';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Upload,
      title: 'Choose an image',
      desc: 'Drag and drop a JPG, PNG, or WebP file, or pick one from your device.',
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      title: 'Adjust and preview',
      desc: 'Crop, resize, compress, or convert — see the result update in real time.',
    },
    {
      num: '03',
      icon: Download,
      title: 'Download the result',
      desc: 'Save the finished file straight to your device. Nothing is kept anywhere.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-line-800">
      <Reveal className="mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          How it <span className="text-gradient-cool">works</span>
        </h2>
        <p className="text-base text-paper-400 max-w-md">Three steps, entirely inside your browser tab.</p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.num} delayMs={idx * 90} className="group p-6 rounded-2xl surface hover:border-line-600 hover:shadow-glow-white transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 border border-line-800 flex items-center justify-center text-accent-soft group-hover:from-violet-500/30 group-hover:via-fuchsia-500/30 group-hover:to-blue-500/30 transition-colors">
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-xs text-paper-500">{step.num}</span>
              </div>

              <h3 className="text-base font-semibold text-paper-100 mb-2">{step.title}</h3>
              <p className="text-sm text-paper-400 leading-relaxed">{step.desc}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
