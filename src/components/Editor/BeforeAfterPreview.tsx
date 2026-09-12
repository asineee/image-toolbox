'use client';

import React, { useState, useRef, memo } from 'react';
import { ProcessedImageResult, ImageMetadata, ToolType, CropRect } from '../../types/image';
import { Eye, EyeOff, Layers, Download, Loader2 } from 'lucide-react';
import { CropOverlay } from './CropOverlay';

interface BeforeAfterPreviewProps {
  originalUrl: string;
  processedResult: ProcessedImageResult | null;
  metadata: ImageMetadata | null;
  isProcessing: boolean;
  onDownload: () => void;
  activeTool?: ToolType;
  cropRect?: CropRect;
  onCropRectChange?: (newRect: CropRect) => void;
}

export const BeforeAfterPreview: React.FC<BeforeAfterPreviewProps> = memo(({
  originalUrl,
  processedResult,
  metadata,
  isProcessing,
  onDownload,
  activeTool,
  cropRect,
  onCropRectChange,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preserve previous preview or fallback to original URL; never disappear
  const activeSrc = showOriginal || !processedResult ? originalUrl : processedResult.dataUrl;

  const currentW = processedResult ? processedResult.width : (metadata?.width || 0);
  const currentH = processedResult ? processedResult.height : (metadata?.height || 0);

  if (!metadata || !activeSrc) {
    return (
      <div className="flex flex-col h-full rounded-2xl surface overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line-800 flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-paper-500" />
          <h4 className="text-sm font-medium text-paper-300">Batch preview</h4>
        </div>

        <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] flex items-center justify-center p-6 bg-black/40 text-center">
          <div className="space-y-2 text-paper-500">
            <Layers className="w-8 h-8 mx-auto text-paper-500/60 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-paper-300">No image selected</p>
            <p className="text-xs text-paper-500 max-w-[240px]">Add images to the queue, then click one to preview it here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl surface overflow-hidden">

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-line-800 flex flex-wrap items-center justify-between gap-3">

        <div className="min-w-0">
          <h4 className="text-sm font-medium text-paper-100 truncate max-w-[200px] sm:max-w-[320px]">
            {metadata.filename}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-paper-500 font-mono mt-0.5">
            <span className="uppercase text-paper-400">
              {processedResult ? processedResult.format.replace('image/', '') : metadata.fileType}
            </span>
            <span className="text-line-800">/</span>
            <span>{processedResult ? processedResult.formattedSize : metadata.formattedSize}</span>
            <span className="text-line-800">/</span>
            <span>{currentW}×{currentH}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {processedResult && (
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onMouseLeave={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors glass-shine ${
                showOriginal
                  ? 'bg-signal-amber/10 border-signal-amber/40 text-signal-amber'
                  : 'bg-black/30 border-line-800 text-paper-400 hover:text-paper-100'
              }`}
              title="Press and hold to view original image"
            >
              {showOriginal ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Original</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hold for original</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onDownload}
            disabled={!processedResult}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs transition-all shadow-glow-sm hover:shadow-glow disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed glass-shine"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Image View Container */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] flex items-center justify-center p-6 bg-black/40 overflow-hidden">

        {isProcessing && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full surface text-paper-300 text-xs font-medium flex items-center gap-2 shadow-glow-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            <span>Updating</span>
          </div>
        )}

        <div className="relative max-w-full max-h-full flex items-center justify-center overflow-visible">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={activeSrc}
            alt={metadata.filename}
            width={currentW || undefined}
            height={currentH || undefined}
            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          />

          {showOriginal && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-signal-amber text-white font-semibold text-[11px]">
              Original
            </div>
          )}

          {activeTool === 'crop' && cropRect && onCropRectChange && !showOriginal && (
            <CropOverlay
              key={activeSrc}
              imageElement={imgRef.current}
              cropRect={cropRect}
              onChange={onCropRectChange}
              imageWidth={currentW}
              imageHeight={currentH}
            />
          )}
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 py-2.5 border-t border-line-800 flex items-center justify-between text-[11px] text-paper-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-accent animate-pulse' : 'bg-signal-green'}`} />
          <span>{isProcessing ? 'Processing locally' : 'Rendered locally'}</span>
        </span>
        {processedResult && processedResult.reductionPercentage !== 0 && (
          <span className="font-mono text-paper-300">
            {processedResult.reductionPercentage > 0
              ? `−${processedResult.reductionPercentage}% size`
              : `Size adjusted (${processedResult.formattedSize})`}
          </span>
        )}
      </div>
    </div>
  );
});

BeforeAfterPreview.displayName = 'BeforeAfterPreview';
