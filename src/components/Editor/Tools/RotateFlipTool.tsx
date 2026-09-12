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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-paper-100 mb-1">Rotate & flip</h3>
          <p className="text-xs text-paper-500">Reorient in 90° steps or mirror on an axis.</p>
        </div>

        <button
          onClick={resetOrientation}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-paper-400 hover:text-paper-100 bg-ink-950 border border-line-800 rounded-md transition-colors font-medium shrink-0 glass-shine"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Rotation Action Buttons */}
      <div>
        <span className="block text-xs font-medium text-paper-500 mb-2">Rotate</span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={rotateLeft}
            className="flex items-center justify-center gap-2 p-3.5 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <RotateCcw className="w-4 h-4 text-paper-400" strokeWidth={1.75} />
            <span>Left 90°</span>
          </button>
          <button
            onClick={rotateRight}
            className="flex items-center justify-center gap-2 p-3.5 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <RotateCw className="w-4 h-4 text-paper-400" strokeWidth={1.75} />
            <span>Right 90°</span>
          </button>
        </div>
      </div>

      {/* Flip Action Buttons */}
      <div>
        <span className="block text-xs font-medium text-paper-500 mb-2">Flip</span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={toggleFlipHorizontal}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-md border text-xs font-medium transition-colors glass-shine ${
              settings.flipHorizontal
                ? 'bg-accent/5 border-accent text-paper-100'
                : 'bg-ink-950 hover:bg-ink-800 border-line-800 text-paper-300'
            }`}
          >
            <FlipHorizontal className={`w-4 h-4 ${settings.flipHorizontal ? 'text-accent' : 'text-paper-400'}`} strokeWidth={1.75} />
            <span>Horizontal</span>
          </button>
          <button
            onClick={toggleFlipVertical}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-md border text-xs font-medium transition-colors glass-shine ${
              settings.flipVertical
                ? 'bg-accent/5 border-accent text-paper-100'
                : 'bg-ink-950 hover:bg-ink-800 border-line-800 text-paper-300'
            }`}
          >
            <FlipVertical className={`w-4 h-4 ${settings.flipVertical ? 'text-accent' : 'text-paper-400'}`} strokeWidth={1.75} />
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Active State Status Indicator */}
      <div className="p-3.5 rounded-lg bg-ink-950 border border-line-800 flex items-center justify-between text-xs font-mono glass-shine">
        <span className="text-paper-500">Angle: <span className="text-paper-100">{settings.rotation}°</span></span>
        <span className="text-paper-500">
          Flipped: <span className="text-paper-100">{settings.flipHorizontal || settings.flipVertical ? 'Yes' : 'No'}</span>
        </span>
      </div>
    </div>
  );
});

RotateFlipTool.displayName = 'RotateFlipTool';
