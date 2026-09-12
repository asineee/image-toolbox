'use client';

import React, { memo } from 'react';
import { ConvertSettings, TargetFormat } from '../../../types/image';
import { Check } from 'lucide-react';

interface ConvertToolProps {
  currentFormat: TargetFormat;
  settings: ConvertSettings;
  onChange: (newSettings: ConvertSettings) => void;
}

export const ConvertTool: React.FC<ConvertToolProps> = memo(({
  settings,
  onChange,
}) => {
  const formats: {
    id: TargetFormat;
    name: string;
    ext: string;
    desc: string;
    bestFor: string;
  }[] = [
    {
      id: 'image/webp',
      name: 'WebP Image',
      ext: 'WEBP',
      desc: 'Modern web image format providing superior lossy and lossless compression.',
      bestFor: 'Modern websites, web performance, small file size',
    },
    {
      id: 'image/jpeg',
      name: 'JPEG Image',
      ext: 'JPG',
      desc: 'Universal photo format supported by all browsers, apps, and operating systems.',
      bestFor: 'Photographs, general sharing, email attachments',
    },
    {
      id: 'image/png',
      name: 'PNG Image',
      ext: 'PNG',
      desc: 'Lossless compression format with transparency background support.',
      bestFor: 'Logos, graphics with transparent background, sharp text',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1">Format conversion</h3>
        <p className="text-xs text-paper-500">Convert to another image format, entirely in your browser.</p>
      </div>

      <div className="space-y-2.5">
        {formats.map((fmt) => {
          const isSelected = settings.format === fmt.id;
          return (
            <div
              key={fmt.id}
              onClick={() => onChange({ format: fmt.id })}
              className={`p-4 rounded-xl border cursor-pointer transition-all glass-shine ${
                isSelected
                  ? 'bg-accent/5 border-accent shadow-glow-sm'
                  : 'bg-ink-950/60 border-line-800 hover:border-line-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                    isSelected ? 'bg-accent text-white' : 'bg-ink-800 text-paper-300 border border-line-800'
                  }`}>
                    {fmt.ext}
                  </span>
                  <span className="text-sm font-medium text-paper-100">{fmt.name}</span>
                </div>

                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                  isSelected ? 'bg-accent border-accent text-white' : 'border-line-800'
                }`}
                  style={{ width: '1.125rem', height: '1.125rem' }}
                >
                  {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
              </div>

              <p className="text-xs text-paper-500 mb-2">{fmt.desc}</p>

              <div className="text-[11px] text-paper-500">
                Best for: <span className="text-paper-400">{fmt.bestFor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ConvertTool.displayName = 'ConvertTool';
