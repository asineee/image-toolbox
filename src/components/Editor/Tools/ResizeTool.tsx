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

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  const handleWidthBlur = () => {
    const val = parseInt(widthInput, 10);
    if (!val || val <= 0) {
      setWidthInput(String(settings.width));
    }
  };

  const handleHeightBlur = () => {
    const val = parseInt(heightInput, 10);
    if (!val || val <= 0) {
      setHeightInput(String(settings.height));
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
        <h3 className="text-base font-semibold text-paper-100 mb-1">Resize dimensions</h3>
        <p className="text-xs text-paper-500">Set exact pixel dimensions or pick a percentage scale.</p>
      </div>

      {/* Original vs Target Badge */}
      <div className="p-3.5 rounded-lg bg-ink-950 border border-line-800 flex items-center justify-between text-xs glass-shine">
        <div>
          <span className="text-paper-500 block">Original size</span>
          <span className="text-paper-100 font-mono font-medium">{originalWidth} × {originalHeight} px</span>
        </div>
        <button
          onClick={resetOriginal}
          className="flex items-center gap-1 text-paper-400 hover:text-paper-100 font-medium transition-colors"
          title="Reset to original dimensions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Width & Height Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-paper-400 mb-1.5">Width (px)</label>
          <input
            type="number"
            min="1"
            max="50000"
            value={widthInput}
            onChange={handleWidthChange}
            onBlur={handleWidthBlur}
            className="w-full px-3.5 py-2.5 rounded-md bg-ink-950 border border-line-800 text-paper-100 font-mono text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-paper-400 mb-1.5">Height (px)</label>
          <input
            type="number"
            min="1"
            max="50000"
            value={heightInput}
            onChange={handleHeightChange}
            onBlur={handleHeightBlur}
            className="w-full px-3.5 py-2.5 rounded-md bg-ink-950 border border-line-800 text-paper-100 font-mono text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
        </div>
      </div>

      {/* Lock Aspect Ratio Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-ink-950 border border-line-800 glass-shine">
        <div className="flex items-center gap-2.5">
          {settings.maintainAspectRatio ? (
            <Lock className="w-4 h-4 text-accent" />
          ) : (
            <Unlock className="w-4 h-4 text-paper-500" />
          )}
          <span className="text-xs font-medium text-paper-300">Maintain aspect ratio</span>
        </div>
        <button
          onClick={toggleAspectRatio}
          className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${
            settings.maintainAspectRatio ? 'bg-accent' : 'bg-ink-700'
          }`}
          style={{ width: '2.5rem', height: '1.375rem' }}
          aria-label="Toggle Maintain Aspect Ratio"
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-ink-950 transform transition-transform ${
              settings.maintainAspectRatio ? 'translate-x-[1.125rem]' : 'translate-x-0'
            }`}
            style={{ width: '1.125rem', height: '1.125rem' }}
          />
        </button>
      </div>

      {/* Scale Presets */}
      <div>
        <span className="block text-xs font-medium text-paper-500 mb-2">Preset scaling</span>
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 200].map((preset) => (
            <button
              key={preset}
              onClick={() => applyScalePreset(preset)}
              className="py-2 px-3 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 text-xs font-mono font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
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
