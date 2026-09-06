'use client';

import React, { memo } from 'react';
import { CropSettings, CropRect } from '../../../types/image';
import { Crop, Check, RefreshCw, X } from 'lucide-react';

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
        <h3 className="text-base font-bold text-white mb-1">Crop Image</h3>
        <p className="text-xs text-gray-400">Drag to adjust the selection box on the image, then click Apply Crop.</p>
      </div>

      {/* Selected Crop Dimensions Readout */}
      <div className="p-4 rounded-2xl bg-dark-900/90 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Target Crop Size</span>
          <span className="text-cyan-400 font-mono font-bold">{cropW} × {cropH} px</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800/80">
          <span className="text-gray-400 font-medium">Position Offset</span>
          <span className="text-gray-200 font-mono">X: {cropX}px, Y: {cropY}px</span>
        </div>

        {cropSettings.active && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800/80">
            <span className="text-gray-400 font-medium">Crop Status</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              Crop Applied
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onApplyCrop}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Apply Crop</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onResetCropRect}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Selection</span>
          </button>

          <button
            onClick={onCancelCrop}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-medium text-rose-400 hover:text-rose-300 transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
});

CropTool.displayName = 'CropTool';
