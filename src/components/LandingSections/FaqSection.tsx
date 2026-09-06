'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are my images uploaded to any server?',
      a: 'No. All image processing is performed locally in your browser using client-side browser APIs. Images are never uploaded to or stored on our server.',
    },
    {
      q: 'What formats are supported?',
      a: 'Image Toolbox supports JPG/JPEG, PNG, WebP, GIF, and BMP image files. You can convert seamlessly between JPG, PNG, and WebP formats.',
    },
    {
      q: 'Is Image Toolbox free to use?',
      a: 'Yes! Image Toolbox is 100% free with no hidden paywalls, no watermark additions, and no mandatory account registration.',
    },
    {
      q: 'What happens to my images after I close the page?',
      a: 'Because images are stored only temporarily in your browser session memory, closing the browser tab or refreshing completely wipes any loaded images from memory.',
    },
    {
      q: 'Does it work on mobile phones and tablets?',
      a: 'Yes. Image Toolbox features a modern responsive design optimized for iOS, Android, tablets, and desktop computers.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-gray-800/80">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Got questions? We have answers.
        </h2>
        <p className="text-sm text-gray-400">Everything you need to know about Image Toolbox.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className="rounded-2xl bg-dark-800/60 border border-gray-800/80 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-cyan-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-gray-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
