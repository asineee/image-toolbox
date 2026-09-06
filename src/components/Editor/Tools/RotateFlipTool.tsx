'use client';

import React, { memo } from 'react';
import { RotateFlipSettings } from '../../../types/image';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

interface RotateFlipToolProps {
  settings: RotateFlipSettings;
  onChange: (newSettings: RotateFlipSettings) => void;
}

export const RotateFlipTool: React.FC<RotateFlipToolProps> = memo(({
  settings,
  onChange,
}) => {
  const rotateLeft = () => {
    const newRot = (settings.rotation - 90 + 360) % 360;
    onChange({ ...settings, rotation: newRot });
  };

  const rotateRight = () => {
    const newRot = (settings.rotation + 90) % 360;
    onChange({ ...settings, rotation: newRot });
  };

  const toggleFlipHorizontal = () => {
    onChange({ ...settings, flipHorizontal: !settings.flipHorizontal });
  };

  const toggleFlipVertical = () => {
    onChange({ ...settings, flipVertical: !settings.flipVertical });
  };

  const resetOrientation = () => {
    onChange({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Rotate & Flip</h3>
          <p className="text-xs text-gray-400">Reorient image orientation in 90-degree steps or flip axes.</p>
        </div>
        
        <button
          onClick={resetOrientation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-400 hover:text-brand-300 bg-dark-900 border border-gray-800 rounded-lg transition-colors font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Rotation Action Buttons */}
      <div>
        <span className="block text-xs font-semibold text-gray-300 mb-2">Rotate Image</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={rotateLeft}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Rotate Left 90°</span>
          </button>
          <button
            onClick={rotateRight}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <span>Rotate Right 90°</span>
          </button>
        </div>
      </div>

      {/* Flip Action Buttons */}
      <div>
        <span className="block text-xs font-semibold text-gray-300 mb-2">Flip Axis</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={toggleFlipHorizontal}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              settings.flipHorizontal
                ? 'bg-brand-950 border-brand-500 text-white shadow-sm'
                : 'bg-dark-900 hover:bg-dark-700 border-gray-800 text-gray-200'
            }`}
          >
            <FlipHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Flip Horizontal</span>
          </button>
          <button
            onClick={toggleFlipVertical}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              settings.flipVertical
                ? 'bg-brand-950 border-brand-500 text-white shadow-sm'
                : 'bg-dark-900 hover:bg-dark-700 border-gray-800 text-gray-200'
            }`}
          >
            <FlipVertical className="w-4 h-4 text-emerald-400" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Active State Status Indicator */}
      <div className="p-3.5 rounded-xl bg-dark-900/80 border border-gray-800 flex items-center justify-between text-xs font-mono">
        <span className="text-gray-400">Current Angle: <strong className="text-white">{settings.rotation}°</strong></span>
        <span className="text-gray-400">
          Flipped: <strong className="text-white">{settings.flipHorizontal || settings.flipVertical ? 'Yes' : 'No'}</strong>
        </span>
      </div>
    </div>
  );
});

RotateFlipTool.displayName = 'RotateFlipTool';
