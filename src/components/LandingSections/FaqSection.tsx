'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '../Reveal';

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
      a: 'Yes. Image Toolbox is free with no hidden paywalls, no watermarks, and no mandatory account registration.',
    },
    {
      q: 'What happens to my images after I close the page?',
      a: 'Because images are stored only temporarily in your browser session memory, closing the tab or refreshing completely clears any loaded images.',
    },
    {
      q: 'Does it work on mobile phones and tablets?',
      a: 'Yes. Image Toolbox is fully responsive and optimized for iOS, Android, tablets, and desktop browsers.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-line-800">
      <Reveal className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Common <span className="text-gradient">questions</span>
        </h2>
        <p className="text-base text-paper-400">Everything you might want to know before you start.</p>
      </Reveal>

      <Reveal delayMs={80} className="rounded-2xl overflow-hidden divide-y divide-line-800 surface">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={faq.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-medium text-sm text-paper-100 hover:bg-white/[0.03] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-accent-soft shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm text-paper-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </Reveal>
    </section>
  );
};
