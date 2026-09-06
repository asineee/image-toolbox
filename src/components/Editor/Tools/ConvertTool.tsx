'use client';

import React, { memo } from 'react';
import { ConvertSettings, TargetFormat } from '../../../types/image';
import { FileType, Check, Info } from 'lucide-react';

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
        <h3 className="text-base font-bold text-white mb-1">Format Conversion</h3>
        <p className="text-xs text-gray-400">Convert your image format directly in your browser without uploading.</p>
      </div>

      <div className="space-y-3">
        {formats.map((fmt) => {
          const isSelected = settings.format === fmt.id;
          return (
            <div
              key={fmt.id}
              onClick={() => onChange({ format: fmt.id })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-brand-950/60 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-dark-900/60 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                    isSelected ? 'bg-brand-500 text-white' : 'bg-dark-800 text-gray-300 border border-gray-700'
                  }`}>
                    {fmt.ext}
                  </span>
                  <span className="text-sm font-bold text-white">{fmt.name}</span>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-700'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-2">{fmt.desc}</p>
              
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                <Info className="w-3 h-3 shrink-0" />
                <span>Best for: {fmt.bestFor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ConvertTool.displayName = 'ConvertTool';
