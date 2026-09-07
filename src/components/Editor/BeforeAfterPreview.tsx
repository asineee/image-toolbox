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
      <div className="flex flex-col h-full bg-dark-900/60 rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-dark-800/90 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-950/80 border border-brand-800/50 flex items-center justify-center text-cyan-400">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-sm font-bold text-white">Batch Preview Workspace</h4>
          </div>
        </div>

        <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] flex items-center justify-center p-6 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] bg-dark-950 text-center">
          <div className="space-y-2 text-gray-500">
            <Layers className="w-10 h-10 mx-auto text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-300">Batch Preview Area</p>
            <p className="text-xs text-gray-500">Add or click images in the batch queue to view their preview here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-900/60 rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl">
      
      {/* Top Header Bar */}
      <div className="px-5 py-4 bg-dark-800/90 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
        
        {/* File info badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-950/80 border border-brand-800/50 flex items-center justify-center text-cyan-400 shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
              {metadata.filename}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span className="uppercase text-cyan-400 font-semibold">
                {processedResult ? processedResult.format.replace('image/', '') : metadata.fileType}
              </span>
              <span>•</span>
              <span>{processedResult ? processedResult.formattedSize : metadata.formattedSize}</span>
              <span>•</span>
              <span>
                {currentW}×{currentH}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Toggle View Original vs Processed */}
          {processedResult && (
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onMouseLeave={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showOriginal
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-dark-700/80 hover:bg-dark-700 border-gray-700 text-gray-300'
              }`}
              title="Press and hold to view original image"
            >
              {showOriginal ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Showing Original</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  <span>Hold for Original</span>
                </>
              )}
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={onDownload}
            disabled={!processedResult}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download Image</span>
          </button>
        </div>
      </div>

      {/* Main Image View Container */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] flex items-center justify-center p-6 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] bg-dark-950 overflow-hidden">
        
        {/* Subtle non-blocking updating badge */}
        {isProcessing && (
          <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-dark-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 shadow-xl animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Updating...</span>
          </div>
        )}

        {/* Stable image preview container */}
        <div className="relative max-w-full max-h-full flex items-center justify-center group overflow-visible">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={activeSrc}
            alt={metadata.filename}
            className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border border-gray-800 transition-all duration-200"
          />
          
          {showOriginal && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-amber-500 text-black font-extrabold text-xs shadow-lg uppercase tracking-wider">
              ORIGINAL VIEW
            </div>
          )}

          {/* Interactive Crop Selection Overlay (Keyed by image src for clean state sync) */}
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
      <div className="px-5 py-3 bg-dark-900 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span>{isProcessing ? 'Processing canvas in background' : 'Local memory rendering'}</span>
        </span>
        {processedResult && processedResult.reductionPercentage !== 0 && (
          <span className="font-mono text-cyan-400 font-semibold">
            {processedResult.reductionPercentage > 0
              ? `Compressed by ${processedResult.reductionPercentage}%`
              : `Size adjusted (${processedResult.formattedSize})`}
          </span>
        )}
      </div>
    </div>
  );
});

BeforeAfterPreview.displayName = 'BeforeAfterPreview';
