'use client';

import React, { useState, useEffect, useRef, ChangeEvent, memo } from 'react';
import { CompressSettings, ProcessedImageResult } from '../../../types/image';
import { Sliders, Zap, Gauge } from 'lucide-react';

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
  // Tracks the live slider value outside React state so the release handler
  // can commit it immediately without waiting for a re-render.
  const liveQualityRef = useRef<number>(settings.quality);

  useEffect(() => {
    setLocalQuality(settings.quality);
    liveQualityRef.current = settings.quality;
  }, [settings.quality]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const qualityPercentage = Math.round(localQuality * 100);

  // Tier label + color matching the three presets below, so the live badge
  // gives the same at-a-glance signal as the preset buttons.
  const qualityTier =
    qualityPercentage < 65
      ? { label: 'Highly Compressed', text: 'text-signal-red', bg: 'bg-signal-red/10', border: 'border-signal-red/30' }
      : qualityPercentage < 90
      ? { label: 'Balanced', text: 'text-signal-amber', bg: 'bg-signal-amber/10', border: 'border-signal-amber/30' }
      : { label: 'Best Quality', text: 'text-signal-green', bg: 'bg-signal-green/10', border: 'border-signal-green/30' };

  // Only updates the visible thumb/label while actively dragging — never
  // triggers processing itself, so intermediate values passed through
  // mid-drag (e.g. 0 -> 100 -> 50 in one continuous gesture) are never sent
  // for encoding, only the value the user actually lands on.
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const floatQuality = Math.max(0.01, Math.min(1.0, val / 100));
    setLocalQuality(floatQuality);
    liveQualityRef.current = floatQuality;

    // Fallback safety net in case a release event is somehow missed (e.g.
    // pointer captured elsewhere): still commits eventually, but the
    // pointer/mouse/touch-up handlers below normally win by firing first.
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange({ quality: liveQualityRef.current });
    }, 400);
  };

  // Commits immediately when the user releases the slider — this is the
  // decisive "the user is done adjusting" signal, so there's no need to wait
  // out a debounce window once we have it. Mirrors the native <input
  // type="range"> "change" event, which (unlike React's onChange/"input")
  // only fires on release.
  const commitOnRelease = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChange({ quality: liveQualityRef.current });
  };

  const applyPresetQuality = (percent: number) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const floatQuality = percent / 100;
    setLocalQuality(floatQuality);
    liveQualityRef.current = floatQuality;
    onChange({ quality: floatQuality });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1">Compression</h3>
        <p className="text-xs text-paper-500">Balance file size against visual quality.</p>
      </div>

      {/* Stats Comparison Card */}
      <div className="rounded-lg bg-ink-950 border border-line-800 divide-y divide-line-800 glass-shine">
        <div className="flex items-center justify-between text-xs p-3.5">
          <span className="text-paper-400">Original size</span>
          <span className="text-paper-100 font-mono font-medium">{formattedOriginalSize}</span>
        </div>

        {processedResult && (
          <>
            <div className="flex items-center justify-between text-xs p-3.5">
              <span className="text-paper-400">Output size</span>
              <span className="text-paper-100 font-mono font-medium">{processedResult.formattedSize}</span>
            </div>

            <div className="flex items-center justify-between p-3.5">
              <span className="text-xs text-paper-400">Savings</span>
              {processedResult.reductionPercentage > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  Saved {processedResult.reductionPercentage}%
                </span>
              ) : (
                <span className="text-xs text-paper-500 font-mono">Original quality preserved</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quality Slider Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-paper-400" />
            <label className="text-xs font-medium text-paper-300">Quality</label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${qualityTier.bg} ${qualityTier.border} ${qualityTier.text}`}>
              {qualityTier.label}
            </span>
            <span className="text-sm font-mono font-semibold text-accent bg-accent/10 border border-accent/30 px-2.5 py-0.5 rounded-md">
              {qualityPercentage}%
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={qualityPercentage}
          onChange={handleSliderChange}
          onMouseUp={commitOnRelease}
          onTouchEnd={commitOnRelease}
          onPointerUp={commitOnRelease}
          onKeyUp={commitOnRelease}
          className="w-full h-1.5 bg-ink-700 rounded-full appearance-none cursor-pointer accent-accent"
        />

        <div className="flex justify-between text-[10px] text-paper-500 font-mono">
          <span>Smaller file</span>
          <span>Higher quality</span>
        </div>
      </div>

      {/* Preset Quality Buttons */}
      <div>
        <span className="block text-xs font-medium text-paper-500 mb-2">Presets</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyPresetQuality(50)}
            className="py-2.5 px-2 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 hover:border-signal-red/40 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-signal-red" strokeWidth={1.75} />
            <span>High compression</span>
          </button>
          <button
            onClick={() => applyPresetQuality(80)}
            className="py-2.5 px-2 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 hover:border-signal-amber/40 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <Gauge className="w-3.5 h-3.5 mx-auto mb-1 text-signal-amber" strokeWidth={1.75} />
            <span>Balanced</span>
          </button>
          <button
            onClick={() => applyPresetQuality(95)}
            className="py-2.5 px-2 rounded-md bg-ink-950 hover:bg-ink-800 border border-line-800 hover:border-signal-green/40 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors glass-shine"
          >
            <Sliders className="w-3.5 h-3.5 mx-auto mb-1 text-signal-green" strokeWidth={1.75} />
            <span>Best quality</span>
          </button>
        </div>
      </div>
    </div>
  );
});

CompressTool.displayName = 'CompressTool';
