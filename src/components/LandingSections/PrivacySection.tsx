'use client';

import React from 'react';
import { ShieldCheck, Lock, Server, Cpu, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/40 border-t border-b border-gray-800/80 relative">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy Guarantee</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Your images stay on your device.
          </h2>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            All image processing is performed locally in the user&apos;s browser using client-side browser APIs. Images are never uploaded to or stored on our server.
          </p>
        </div>

        {/* Architecture Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Image Toolbox Local Architecture (Check) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-dark-800/90 to-dark-900 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Image Toolbox Model</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                RECOMMENDED
              </span>
            </div>

            {/* Architecture Steps */}
            <div className="space-y-4 font-mono text-xs text-gray-300 bg-dark-950/80 p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Your Device</span>
              </div>
              <div className="pl-7 text-gray-500">↓</div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Local Browser (HTML5 Canvas)</span>
              </div>
              <div className="pl-7 text-gray-500">↓</div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Instant In-Memory Download</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-300 leading-relaxed">
              No server connection required for processing. Zero network latency, maximum privacy, and complete security for personal or confidential media.
            </p>
          </div>

          {/* Traditional Cloud Server Model (X) */}
          <div className="p-8 rounded-3xl bg-dark-800/40 border border-gray-800 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-300">Traditional Web Converters</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold text-xs">
                RISKY
              </span>
            </div>

            {/* Traditional Architecture Steps */}
            <div className="space-y-4 font-mono text-xs text-gray-400 bg-dark-950/60 p-5 rounded-2xl border border-gray-800/60">
              <div className="flex items-center gap-3 text-gray-400">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Your Device</span>
              </div>
              <div className="pl-7 text-gray-600">↓ (Uploads over Internet)</div>
              <div className="flex items-center gap-3 text-gray-400">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Remote Server Filesystem</span>
              </div>
              <div className="pl-7 text-gray-600">↓ (Remote Processing & Storage)</div>
              <div className="flex items-center gap-3 text-gray-400">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Download back from Remote Server</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-400 leading-relaxed">
              Exposes your files to third-party cloud storage, remote databases, potential data leaks, and bandwidth limits.
            </p>
          </div>

        </div>

        {/* Key Trust Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { title: 'Zero File Uploads', desc: 'Files never leave memory' },
            { title: 'No Account Needed', desc: 'No login or tracking' },
            { title: '100% Browser Local', desc: 'Driven by Canvas 2D' },
            { title: 'Ultra Fast', desc: 'Instant local rendering' },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-dark-800/40 border border-gray-800">
              <span className="block text-sm font-bold text-white mb-1">{item.title}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
