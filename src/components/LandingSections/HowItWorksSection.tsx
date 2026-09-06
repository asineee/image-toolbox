'use client';

import React from 'react';
import { Upload, Sliders, Download, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Upload,
      title: 'Choose an Image',
      desc: 'Drag & drop any JPG, PNG, or WebP photo into the studio or select one from your local files.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      num: '02',
      icon: Sliders,
      title: 'Configure & Preview',
      desc: 'Adjust dimensions, set compression quality, change format, rotate or flip with real-time visual preview.',
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
    },
    {
      num: '03',
      icon: Download,
      title: 'Download Locally',
      desc: 'Click download to save your transformed file immediately back to your computer or mobile device.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          How Image Toolbox Works
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
          3 simple steps to transform photos securely in your web browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div
              key={step.num}
              className="p-6 rounded-3xl bg-dark-800/50 border border-gray-800/80 hover:border-gray-700 transition-all relative group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${step.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <span className="font-mono text-2xl font-extrabold text-gray-600 group-hover:text-white transition-colors">
                  {step.num}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
