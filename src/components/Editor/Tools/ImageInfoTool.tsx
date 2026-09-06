'use client';

import React from 'react';
import { ImageMetadata } from '../../../types/image';
import { ShieldCheck, HardDrive, FileText, Maximize2, FileCheck, Layers } from 'lucide-react';

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
        <h3 className="text-base font-bold text-white mb-1">Image Metadata</h3>
        <p className="text-xs text-gray-400">Inspected properties read locally from your browser image file.</p>
      </div>

      {/* Metadata Table Card */}
      <div className="rounded-2xl bg-dark-900/90 border border-gray-800 divide-y divide-gray-800/80 overflow-hidden">
        {infoRows.map((row) => {
          const IconComp = row.icon;
          return (
            <div key={row.label} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark-800 border border-gray-700/60 flex items-center justify-center text-cyan-400">
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-gray-300">{row.label}</span>
              </div>
              <span className={`text-xs text-white text-right truncate max-w-[200px] sm:max-w-[260px] ${
                row.mono ? 'font-mono font-medium' : ''
              }`}>
                {row.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Local Metadata Guarantee Card */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-0.5">Local Metadata Only</p>
          <p className="text-emerald-400/90 leading-relaxed">
            All image properties are extracted locally inside your web browser. No metadata or file details leave your device.
          </p>
        </div>
      </div>
    </div>
  );
};
