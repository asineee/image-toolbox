'use client';

import React, { memo } from 'react';
import { CropSettings, CropRect } from '../../../types/image';
import { Check, RefreshCw, X } from 'lucide-react';

interface CropToolProps {
  cropSettings: CropSettings;
  imageWidth: number;
  imageHeight: number;
  onApplyCrop: () => void;
  onResetCropRect: () => void;
  onCancelCrop: () => void;
}

export const CropTool: React.FC<CropToolProps> = memo(({
  cropSettings,
  imageWidth,
  imageHeight,
  onApplyCrop,
  onResetCropRect,
  onCancelCrop,
}) => {
  const rect = cropSettings.rect || { x: 0, y: 0, width: 1, height: 1 };
  const cropW = Math.round(rect.width * imageWidth);
  const cropH = Math.round(rect.height * imageHeight);
  const cropX = Math.round(rect.x * imageWidth);
  const cropY = Math.round(rect.y * imageHeight);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1">Crop image</h3>
        <p className="text-xs text-paper-500">Drag the selection box on the image, then apply.</p>
      </div>

      <div className="rounded-lg bg-ink-950 border border-line-800 divide-y divide-line-800 glass-shine">
        <div className="flex items-center justify-between text-xs p-3.5">
          <span className="text-paper-400">Target size</span>
          <span className="text-paper-100 font-mono font-medium">{cropW} × {cropH} px</span>
        </div>

        <div className="flex items-center justify-between text-xs p-3.5">
          <span className="text-paper-400">Position</span>
          <span className="text-paper-300 font-mono">X: {cropX}px, Y: {cropY}px</span>
        </div>

        {cropSettings.active && (
          <div className="flex items-center justify-between text-xs p-3.5">
            <span className="text-paper-400">Status</span>
            <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[11px] font-medium">
              Crop applied
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onApplyCrop}
          className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-sm hover:shadow-glow glass-shine"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          <span>Apply crop</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onResetCropRect}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-ink-800 hover:bg-ink-700 border border-line-800 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset selection</span>
          </button>

          <button
            onClick={onCancelCrop}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-ink-800 hover:bg-ink-700 border border-line-800 text-xs font-medium text-signal-red hover:text-signal-red/80 transition-colors glass-shine"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel crop</span>
          </button>
        </div>
      </div>
    </div>
  );
});

CropTool.displayName = 'CropTool';
