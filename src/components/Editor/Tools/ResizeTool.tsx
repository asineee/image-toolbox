'use client';

import React, { useState, useEffect, useRef, ChangeEvent, memo } from 'react';
import { ResizeSettings } from '../../../types/image';
import { Lock, Unlock, RefreshCw } from 'lucide-react';

interface ResizeToolProps {
  originalWidth: number;
  originalHeight: number;
  settings: ResizeSettings;
  onChange: (newSettings: ResizeSettings) => void;
}

export const ResizeTool: React.FC<ResizeToolProps> = memo(({
  originalWidth,
  originalHeight,
  settings,
  onChange,
}) => {
  const [widthInput, setWidthInput] = useState<string>(String(settings.width || ''));
  const [heightInput, setHeightInput] = useState<string>(String(settings.height || ''));
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local inputs when settings change from outside (e.g. presets or reset)
  useEffect(() => {
    setWidthInput(String(settings.width || ''));
    setHeightInput(String(settings.height || ''));
  }, [settings.width, settings.height]);

  const scheduleChange = (newSettings: ResizeSettings) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(newSettings);
    }, 250);
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setWidthInput(valStr);

    const val = parseInt(valStr, 10);
    if (!val || val <= 0) return;

    if (settings.maintainAspectRatio && settings.aspectRatio > 0) {
      const newHeight = Math.max(1, Math.round(val / settings.aspectRatio));
      setHeightInput(String(newHeight));
      scheduleChange({
        ...settings,
        width: val,
        height: newHeight,
      });
    } else {
      scheduleChange({
        ...settings,
        width: val,
      });
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setHeightInput(valStr);

    const val = parseInt(valStr, 10);
    if (!val || val <= 0) return;

    if (settings.maintainAspectRatio && settings.aspectRatio > 0) {
      const newWidth = Math.max(1, Math.round(val * settings.aspectRatio));
      setWidthInput(String(newWidth));
      scheduleChange({
        ...settings,
        width: newWidth,
        height: val,
      });
    } else {
      scheduleChange({
        ...settings,
        height: val,
      });
    }
  };

  const toggleAspectRatio = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const newMaintain = !settings.maintainAspectRatio;
    if (newMaintain) {
      const currentRatio = originalWidth / originalHeight;
      const curW = parseInt(widthInput, 10) || settings.width;
      const newHeight = Math.max(1, Math.round(curW / currentRatio));
      setHeightInput(String(newHeight));
      onChange({
        ...settings,
        maintainAspectRatio: true,
        aspectRatio: currentRatio,
        width: curW,
        height: newHeight,
      });
    } else {
      onChange({
        ...settings,
        maintainAspectRatio: false,
      });
    }
  };

  const applyScalePreset = (percentage: number) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const scale = percentage / 100;
    const newW = Math.max(1, Math.round(originalWidth * scale));
    const newH = Math.max(1, Math.round(originalHeight * scale));

    setWidthInput(String(newW));
    setHeightInput(String(newH));

    onChange({
      ...settings,
      width: newW,
      height: newH,
    });
  };

  const resetOriginal = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    setWidthInput(String(originalWidth));
    setHeightInput(String(originalHeight));

    onChange({
      width: originalWidth,
      height: originalHeight,
      maintainAspectRatio: true,
      aspectRatio: originalWidth / originalHeight,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Resize Dimensions</h3>
        <p className="text-xs text-gray-400">Set output pixel dimensions or select a percentage preset scale.</p>
      </div>

      {/* Original vs Target Badge */}
      <div className="p-3.5 rounded-xl bg-dark-900/80 border border-gray-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-400 block font-medium">Original Size</span>
          <span className="text-gray-200 font-mono font-semibold">{originalWidth} × {originalHeight} px</span>
        </div>
        <button
          onClick={resetOriginal}
          className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium transition-colors"
          title="Reset to original dimensions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Width & Height Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Width (px)</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={widthInput}
            onChange={handleWidthChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-gray-700 text-white font-mono text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Height (px)</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={heightInput}
            onChange={handleHeightChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-gray-700 text-white font-mono text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Lock Aspect Ratio Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-800/60 border border-gray-800">
        <div className="flex items-center gap-2.5">
          {settings.maintainAspectRatio ? (
            <Lock className="w-4 h-4 text-cyan-400" />
          ) : (
            <Unlock className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs font-medium text-gray-200">Maintain Aspect Ratio</span>
        </div>
        <button
          onClick={toggleAspectRatio}
          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
            settings.maintainAspectRatio ? 'bg-brand-600' : 'bg-gray-700'
          }`}
          aria-label="Toggle Maintain Aspect Ratio"
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              settings.maintainAspectRatio ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Scale Presets */}
      <div>
        <span className="block text-xs font-semibold text-gray-400 mb-2">Preset Scaling</span>
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 200].map((preset) => (
            <button
              key={preset}
              onClick={() => applyScalePreset(preset)}
              className="py-2 px-3 rounded-lg bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-mono font-medium text-gray-300 hover:text-white transition-all active:scale-95"
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

ResizeTool.displayName = 'ResizeTool';
