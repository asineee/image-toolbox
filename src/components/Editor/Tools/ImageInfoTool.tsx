'use client';

import React, { useState, useEffect } from 'react';
import { ImageMetadata } from '../../../types/image';
import { ShieldCheck, HardDrive, FileText, Maximize2, FileCheck, Layers, Check, Pencil } from 'lucide-react';
// Icons imported above are used per-row in infoRows for a consistent, restrained data table.

interface ImageInfoToolProps {
  metadata: ImageMetadata;
  onRename?: (newFilename: string) => void;
}

export const ImageInfoTool: React.FC<ImageInfoToolProps> = ({ metadata, onRename }) => {
  // Split the current filename into base name + extension so renaming can
  // never drop or change the file's extension.
  const lastDotIndex = metadata.filename.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? metadata.filename.substring(lastDotIndex) : '';
  const baseName = lastDotIndex > 0 ? metadata.filename.substring(0, lastDotIndex) : metadata.filename;

  const [nameInput, setNameInput] = useState(baseName);

  // Keep the input in sync when the filename changes from outside this
  // component (a new image is uploaded, edits are reset, etc.).
  useEffect(() => {
    setNameInput(baseName);
  }, [baseName]);

  const trimmedInput = nameInput.trim();
  const isDirty = trimmedInput !== '' && trimmedInput !== baseName;

  const handleSave = () => {
    if (!trimmedInput || !onRename) return;
    onRename(`${trimmedInput}${extension}`);
  };

  const infoRows = [
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

        {/* Filename row — editable */}
        <div className="p-3.5 bg-accent/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <FileText className="w-3.5 h-3.5 text-paper-500" strokeWidth={1.75} />
              <span className="text-xs font-medium text-paper-400">Filename</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
              <label
                htmlFor="image-info-filename-input"
                className="group flex items-center gap-1.5 min-w-0 max-w-[210px] sm:max-w-[270px] w-full sm:w-auto bg-ink-900/80 border border-line-700 rounded-md pl-2 pr-2 py-1.5 sm:py-1 cursor-text hover:border-accent/50 hover:bg-ink-900 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/40 focus-within:bg-ink-900 transition-colors"
              >
                <Pencil
                  className="w-3 h-3 text-accent/70 group-focus-within:text-accent shrink-0"
                  strokeWidth={2}
                />
                <input
                  id="image-info-filename-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                  placeholder="Click to rename"
                  spellCheck={false}
                  aria-label="Filename (editable)"
                  className="w-full min-w-0 bg-transparent text-xs font-mono text-paper-100 text-right focus:outline-none truncate placeholder:text-paper-500 placeholder:font-sans"
                />
                <span className="text-xs font-mono text-paper-500 shrink-0">{extension}</span>
              </label>
              {isDirty && (
                <button
                  onClick={handleSave}
                  title="Save filename"
                  className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-accent/15 hover:bg-accent/25 text-accent text-[11px] font-semibold transition-colors"
                >
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                  <span>Save</span>
                </button>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-[10.5px] text-paper-500 text-right sm:text-right">
            Tap the name to rename it — extension stays the same.
          </p>
        </div>

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
