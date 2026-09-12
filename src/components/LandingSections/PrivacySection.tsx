'use client';

import React from 'react';
import { ShieldCheck, Lock, Server, CheckCircle, XCircle } from 'lucide-react';
import { Reveal } from '../Reveal';

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-line-800">
      <div className="max-w-5xl mx-auto">

        <Reveal className="mb-16 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-soft mb-4">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Privacy guarantee</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Your images stay <span className="text-gradient">on your device.</span>
          </h2>

          <p className="text-base text-paper-400 leading-relaxed">
            Every operation runs locally in your browser using the HTML5 Canvas API. Nothing is uploaded to, or stored on, a server — ever.
          </p>
        </Reveal>

        {/* Architecture Comparison */}
        <Reveal delayMs={100} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          <div className="p-6 rounded-2xl border border-accent/30 bg-ink-900/70 backdrop-blur-sm shadow-glow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-accent/30 flex items-center justify-center text-accent-soft">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-paper-100">Image Toolbox</h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-paper-300 bg-black/60 p-4 rounded-lg border border-line-800">
              <div className="flex items-center gap-2.5 text-paper-100">
                <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Your device</span>
              </div>
              <div className="pl-6 text-paper-500">↓</div>
              <div className="flex items-center gap-2.5 text-paper-100">
                <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Local browser canvas</span>
              </div>
              <div className="pl-6 text-paper-500">↓</div>
              <div className="flex items-center gap-2.5 text-paper-100">
                <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Instant local download</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-paper-400 leading-relaxed">
              No network round trip. Your files never exist anywhere but your own memory.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-line-800 bg-ink-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-ink-800 border border-line-800 flex items-center justify-center text-paper-500">
                <Server className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-paper-400">Typical web converters</h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-paper-500 bg-black/60 p-4 rounded-lg border border-line-800">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-3.5 h-3.5 text-signal-red/70 shrink-0" />
                <span>Your device</span>
              </div>
              <div className="pl-6 text-paper-500">↓ uploads over the internet</div>
              <div className="flex items-center gap-2.5">
                <XCircle className="w-3.5 h-3.5 text-signal-red/70 shrink-0" />
                <span>Remote server storage</span>
              </div>
              <div className="pl-6 text-paper-500">↓ processed remotely</div>
              <div className="flex items-center gap-2.5">
                <XCircle className="w-3.5 h-3.5 text-signal-red/70 shrink-0" />
                <span>Downloaded back to you</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-paper-500 leading-relaxed">
              Your files pass through third-party infrastructure you can't see or control.
            </p>
          </div>

        </Reveal>

        {/* Trust Pillars */}
        <Reveal delayMs={180} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Zero uploads', desc: 'Files never leave memory' },
            { title: 'No account', desc: 'No login, no tracking' },
            { title: 'Fully local', desc: 'Driven by Canvas 2D' },
            { title: 'Instant', desc: 'No network round trip' },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-xl surface hover:shadow-glow-white transition-all text-center">
              <span className="block text-sm font-semibold text-paper-100 mb-1">{item.title}</span>
              <span className="text-xs text-paper-500">{item.desc}</span>
            </div>
          ))}
        </Reveal>

      </div>
    </section>
  );
};
