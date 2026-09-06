'use client';

import React, { useState, useEffect, useRef, ChangeEvent, memo } from 'react';
import { CompressSettings, ProcessedImageResult } from '../../../types/image';
import { Sparkles, Sliders, Zap } from 'lucide-react';

interface CompressToolProps {
  originalSizeBytes: number;
  formattedOriginalSize: string;
  settings: CompressSettings;
  processedResult: ProcessedImageResult | null;
  onChange: (newSettings: CompressSettings) => void;
}

export const CompressTool: React.FC<CompressToolProps> = memo(({
  originalSizeBytes,
  formattedOriginalSize,
  settings,
  processedResult,
  onChange,
}) => {
  const [localQuality, setLocalQuality] = useState<number>(settings.quality);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalQuality(settings.quality);
  }, [settings.quality]);

  const qualityPercentage = Math.round(localQuality * 100);

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const floatQuality = Math.max(0.01, Math.min(1.0, val / 100));
    setLocalQuality(floatQuality);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange({ quality: floatQuality });
    }, 150);
  };

  const applyPresetQuality = (percent: number) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const floatQuality = percent / 100;
    setLocalQuality(floatQuality);
    onChange({ quality: floatQuality });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Image Compression</h3>
        <p className="text-xs text-gray-400">Adjust compression quality to balance file size and visual fidelity.</p>
      </div>

      {/* Stats Comparison Card */}
      <div className="p-4 rounded-2xl bg-dark-900/90 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Original File Size</span>
          <span className="text-gray-200 font-mono font-bold">{formattedOriginalSize}</span>
        </div>

        {processedResult && (
          <>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800/80">
              <span className="text-gray-400 font-medium">Processed Output Size</span>
              <span className="text-cyan-400 font-mono font-bold">{processedResult.formattedSize}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
              <span className="text-xs text-gray-400 font-medium">Savings</span>
              {processedResult.reductionPercentage > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Saved {processedResult.reductionPercentage}%
                </span>
              ) : (
                <span className="text-xs text-gray-400 font-mono">Original quality preserved</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quality Slider Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <label className="text-xs font-bold text-gray-200">Compression Quality</label>
          </div>
          <span className="text-sm font-mono font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-lg">
            {qualityPercentage}%
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={qualityPercentage}
          onChange={handleSliderChange}
          className="w-full h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />

        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>Max Compression (Smaller File)</span>
          <span>Max Quality (Crisp)</span>
        </div>
      </div>

      {/* Preset Quality Buttons */}
      <div>
        <span className="block text-xs font-semibold text-gray-400 mb-2">Quality Presets</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyPresetQuality(50)}
            className="py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
            <span>High Compression (50%)</span>
          </button>
          <button
            onClick={() => applyPresetQuality(80)}
            className="py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
            <span>Balanced (80%)</span>
          </button>
          <button
            onClick={() => applyPresetQuality(95)}
            className="py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-700 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            <Sliders className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
            <span>Best Quality (95%)</span>
          </button>
        </div>
      </div>
    </div>
  );
});

CompressTool.displayName = 'CompressTool';
