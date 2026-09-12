'use client';

import React from 'react';
import { ImageMetadata } from '../../../types/image';
import { ShieldCheck, HardDrive, FileText, Maximize2, FileCheck, Layers } from 'lucide-react';
// Icons imported above are used per-row in infoRows for a consistent, restrained data table.

interface ImageInfoToolProps {
  metadata: ImageMetadata;
}

export const ImageInfoTool: React.FC<ImageInfoToolProps> = ({ metadata }) => {
  const infoRows = [
    {
      label: 'Filename',
      value: metadata.filename,
      icon: FileText,
      mono: true,
    },
    {
      label: 'File Type / Format',
      value: metadata.fileType.toUpperCase() || 'IMAGE',
      icon: FileCheck,
      mono: true,
    },
    {
      label: 'File Size',
      value: metadata.formattedSize,
      icon: HardDrive,
      mono: true,
    },
    {
      label: 'Dimensions',
      value: `${metadata.width} × ${metadata.height} px`,
      icon: Maximize2,
      mono: true,
    },
    {
      label: 'Aspect Ratio',
      value: metadata.aspectRatio,
      icon: Layers,
      mono: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1">Image info</h3>
        <p className="text-xs text-paper-500">Properties read locally from the file.</p>
      </div>

      {/* Metadata Table Card */}
      <div className="rounded-lg bg-ink-950 border border-line-800 divide-y divide-line-800 glass-shine">
        {infoRows.map((row) => {
          const IconComp = row.icon;
          return (
            <div key={row.label} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <IconComp className="w-3.5 h-3.5 text-paper-500" strokeWidth={1.75} />
                <span className="text-xs font-medium text-paper-400">{row.label}</span>
              </div>
              <span className={`text-xs text-paper-100 text-right truncate max-w-[200px] sm:max-w-[260px] ${
                row.mono ? 'font-mono' : ''
              }`}>
                {row.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Local Metadata Guarantee Card */}
      <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/20 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
        <div>
          <p className="font-medium text-paper-100 mb-0.5">Local only</p>
          <p className="text-paper-400 leading-relaxed">
            All properties are read inside your browser. Nothing leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
};
