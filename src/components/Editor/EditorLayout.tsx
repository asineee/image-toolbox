'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { ImageState, ToolType, ProcessingSettings, CropRect, ExifData, BatchItem } from '../../types/image';
import { processImagePipeline, generateOutputFilename } from '../../utils/imageProcessor';
import { parseExifMetadata } from '../../utils/exifParser';
import { BeforeAfterPreview } from './BeforeAfterPreview';
import { ResizeTool } from './Tools/ResizeTool';
import { CompressTool } from './Tools/CompressTool';
import { ConvertTool } from './Tools/ConvertTool';
import { RotateFlipTool } from './Tools/RotateFlipTool';
import { ImageInfoTool } from './Tools/ImageInfoTool';
import { CropTool } from './Tools/CropTool';
import { MetadataCleanerTool } from './Tools/MetadataCleanerTool';
import { BatchProcessingTool } from './Tools/BatchProcessingTool';
import { 
  Maximize2, 
  FileArchive, 
  FileType, 
  RotateCw, 
  Info, 
  Download,
  RotateCcw,
  Crop,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface EditorLayoutProps {
  imageState: ImageState;
  onUpdateSettings: (newSettings: ProcessingSettings) => void;
  onUpdateState: (partial: Partial<ImageState>) => void;
  onResetEdits: () => void;
  initialBatchFiles?: File[];
}

export const EditorLayout: React.FC<EditorLayoutProps> = memo(({
  imageState,
  onUpdateSettings,
  onUpdateState,
  onResetEdits,
  initialBatchFiles,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>(imageState.activeTool || 'crop');
  const [originalObjUrl, setOriginalObjUrl] = useState<string>('');
  const [exifData, setExifData] = useState<ExifData | null>(null);

  // Sync activeTool state when imageState.activeTool changes externally
  useEffect(() => {
    if (imageState.activeTool === 'batch') {
      setActiveTool('batch');
      setActiveCategory('BATCH');
    }
  }, [imageState.activeTool]);

  // Parse EXIF metadata when originalFile is loaded
  useEffect(() => {
    if (imageState.originalFile) {
      parseExifMetadata(imageState.originalFile)
        .then((data) => setExifData(data))
        .catch(() => setExifData(null));
    } else {
      setExifData(null);
    }
  }, [imageState.originalFile]);

  // Local state for interactive crop selection box (0..1 normalized coordinates)
  const [cropRect, setCropRect] = useState<CropRect>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  // Track request IDs to discard out-of-order stale async processing results
  const requestIdRef = useRef<number>(0);
  const prevDataUrlRef = useRef<string | null>(null);

  // Guards against overlapping pipeline runs. Some encodes (large PNGs in
  // particular) are slow, synchronous, third-party work that can't be
  // cancelled mid-flight. Without this, dragging a slider repeatedly could
  // queue up several of these expensive runs back-to-back, each blocking the
  // main thread in turn — which is what made "the entire site" feel frozen.
  // Instead: if a run is already in progress, just remember that another one
  // is needed once it finishes, so at most one expensive run is ever active.
  const isRunningRef = useRef(false);
  const rerunNeededRef = useRef(false);
  const runPipelineRef = useRef<() => Promise<void>>();

  // Sync cropRect when crop is reset or external state resets
  useEffect(() => {
    if (!imageState.settings.crop.active && !imageState.settings.crop.rect) {
      setCropRect({ x: 0, y: 0, width: 1, height: 1 });
    }
  }, [imageState.settings.crop.active, imageState.settings.crop.rect]);

  // Create local Object URL for original image preview
  useEffect(() => {
    if (imageState.originalFile) {
      const url = URL.createObjectURL(imageState.originalFile);
      setOriginalObjUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageState.originalFile]);

  // Clean up previous blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (prevDataUrlRef.current) {
        URL.revokeObjectURL(prevDataUrlRef.current);
        prevDataUrlRef.current = null;
      }
    };
  }, []);

  // Run image processing pipeline with race-condition check & memory cleanup
  const runPipeline = useCallback(async () => {
    if (!imageState.originalImage || !imageState.metadata) return;

    if (isRunningRef.current) {
      // A run is already in flight — coalesce into a single follow-up run
      // with the latest settings instead of starting another one now.
      rerunNeededRef.current = true;
      return;
    }

    isRunningRef.current = true;
    const currentReqId = ++requestIdRef.current;
    onUpdateState({ isProcessing: true, error: null });

    try {
      const result = await processImagePipeline(
        imageState.originalImage,
        imageState.settings,
        imageState.metadata.fileSizeBytes
      );

      // Verify this is still the latest request before applying state update
      if (currentReqId === requestIdRef.current) {
        if (prevDataUrlRef.current && prevDataUrlRef.current !== result.dataUrl) {
          URL.revokeObjectURL(prevDataUrlRef.current);
        }
        prevDataUrlRef.current = result.dataUrl;

        onUpdateState({ processedResult: result, isProcessing: false });
      } else {
        URL.revokeObjectURL(result.dataUrl);
      }
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        onUpdateState({
          isProcessing: false,
          error: err?.message || 'Failed to process image locally.',
        });
      }
    } finally {
      isRunningRef.current = false;
      if (rerunNeededRef.current) {
        rerunNeededRef.current = false;
        // Call via the ref so this always resolves to the latest closure
        // (freshest imageState.settings), not this invocation's own one.
        runPipelineRef.current?.();
      }
    }
  }, [imageState.originalImage, imageState.settings, imageState.metadata, onUpdateState]);

  useEffect(() => {
    runPipelineRef.current = runPipeline;
  }, [runPipeline]);

  useEffect(() => {
    // Debounce pipeline execution: rapid successive settings changes (e.g.
    // dragging the compress quality slider, or typing resize dimensions)
    // previously triggered a full reprocess on every single tick, which
    // could stack up expensive synchronous work and made the "Updating..."
    // indicator flicker on and off for each intermediate value. Waiting for
    // the settings to settle for a short moment coalesces bursts of changes
    // into a single run.
    const timer = setTimeout(() => {
      runPipeline();
    }, 120);
    return () => clearTimeout(timer);
  }, [runPipeline]);

  const handleDownload = useCallback(() => {
    if (!imageState.processedResult || !imageState.metadata) return;

    const filename = generateOutputFilename(
      imageState.metadata.filename,
      activeTool,
      imageState.settings.convert.format
    );

    const a = document.createElement('a');
    a.href = imageState.processedResult.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [imageState.processedResult, imageState.metadata, activeTool, imageState.settings.convert.format]);

  // Crop Action Handlers
  const handleCropRectChange = useCallback((newRect: CropRect) => {
    setCropRect(newRect);
  }, []);

  const handleApplyCrop = useCallback(() => {
    if (!imageState.metadata) return;
    const currentW = imageState.processedResult ? imageState.processedResult.width : imageState.metadata.width;
    const currentH = imageState.processedResult ? imageState.processedResult.height : imageState.metadata.height;

    const newPixelW = Math.max(1, Math.round(cropRect.width * currentW));
    const newPixelH = Math.max(1, Math.round(cropRect.height * currentH));

    const prevRect = imageState.settings.crop.rect;
    const combinedRect: CropRect = (imageState.settings.crop.active && prevRect)
      ? {
          x: prevRect.x + cropRect.x * prevRect.width,
          y: prevRect.y + cropRect.y * prevRect.height,
          width: cropRect.width * prevRect.width,
          height: cropRect.height * prevRect.height,
        }
      : cropRect;

    onUpdateSettings({
      ...imageState.settings,
      resize: {
        ...imageState.settings.resize,
        width: newPixelW,
        height: newPixelH,
        aspectRatio: newPixelW / newPixelH,
      },
      crop: {
        active: true,
        rect: combinedRect,
      },
    });

    // Reset crop selection rectangle to full 100% bounds for the newly cropped image
    setCropRect({ x: 0, y: 0, width: 1, height: 1 });
  }, [cropRect, imageState.metadata, imageState.processedResult, imageState.settings, onUpdateSettings]);

  const handleResetCropRect = useCallback(() => {
    setCropRect({ x: 0, y: 0, width: 1, height: 1 });
  }, []);

  const handleCancelCrop = useCallback(() => {
    if (!imageState.metadata) return;

    setCropRect({ x: 0, y: 0, width: 1, height: 1 });

    const origW = imageState.metadata.width;
    const origH = imageState.metadata.height;

    onUpdateSettings({
      ...imageState.settings,
      resize: {
        ...imageState.settings.resize,
        width: origW,
        height: origH,
        aspectRatio: origW / origH,
      },
      crop: {
        active: false,
        rect: null,
      },
    });
  }, [imageState.metadata, imageState.settings, onUpdateSettings]);

  const handleApplyClean = useCallback(() => {
    onUpdateSettings({
      ...imageState.settings,
      clean: {
        active: true,
        isCleaned: true,
      },
    });
  }, [imageState.settings, onUpdateSettings]);

  const handleResetClean = useCallback(() => {
    onUpdateSettings({
      ...imageState.settings,
      clean: {
        active: false,
        isCleaned: false,
      },
    });
  }, [imageState.settings, onUpdateSettings]);

  type NavCategory = 'EDIT' | 'OPTIMIZE' | 'INSPECT' | 'BATCH';

  const [activeCategory, setActiveCategory] = useState<NavCategory>('EDIT');

  interface ToolDef {
    id: ToolType;
    label: string;
    icon: any;
    category: NavCategory;
  }

  const toolsByCategory: Record<NavCategory, ToolDef[]> = {
    EDIT: [
      { id: 'crop', label: 'Crop', icon: Crop, category: 'EDIT' },
      { id: 'resize', label: 'Resize', icon: Maximize2, category: 'EDIT' },
      { id: 'rotate', label: 'Rotate & Flip', icon: RotateCw, category: 'EDIT' },
    ],
    OPTIMIZE: [
      { id: 'compress', label: 'Compress', icon: FileArchive, category: 'OPTIMIZE' },
      { id: 'convert', label: 'Convert', icon: FileType, category: 'OPTIMIZE' },
    ],
    INSPECT: [
      { id: 'info', label: 'Image Info', icon: Info, category: 'INSPECT' },
      { id: 'clean', label: 'Metadata Cleaner', icon: ShieldCheck, category: 'INSPECT' },
    ],
    BATCH: [
      { id: 'batch', label: 'Batch Processing', icon: Layers, category: 'BATCH' },
    ],
  };

  const handleSelectCategory = useCallback((cat: NavCategory) => {
    setActiveCategory(cat);
    const catTools = toolsByCategory[cat];
    const isCurrentToolInCat = catTools.some((t) => t.id === activeTool);
    if (!isCurrentToolInCat && catTools.length > 0) {
      setActiveTool(catTools[0].id);
    }
  }, [activeTool]);

  const [selectedBatchItem, setSelectedBatchItem] = useState<BatchItem | null>(null);

  if (!imageState.metadata && activeTool !== 'batch') return null;

  const currentW = imageState.processedResult
    ? imageState.processedResult.width
    : (imageState.metadata ? imageState.metadata.width : 1920);
  const currentH = imageState.processedResult
    ? imageState.processedResult.height
    : (imageState.metadata ? imageState.metadata.height : 1080);

  const previewOriginalUrl = activeTool === 'batch'
    ? (selectedBatchItem?.previewUrl || '')
    : originalObjUrl;

  const previewProcessedResult = activeTool === 'batch'
    ? (selectedBatchItem?.result || null)
    : imageState.processedResult;

  const previewMetadata = activeTool === 'batch'
    ? (selectedBatchItem
        ? {
            filename: selectedBatchItem.filename,
            fileType: selectedBatchItem.file.type || 'IMAGE',
            fileSizeBytes: selectedBatchItem.file.size,
            formattedSize: selectedBatchItem.formattedSize,
            width: selectedBatchItem.width,
            height: selectedBatchItem.height,
            aspectRatio: selectedBatchItem.width && selectedBatchItem.height
              ? `${selectedBatchItem.width}:${selectedBatchItem.height}`
              : '1:1',
            lastModified: selectedBatchItem.file.lastModified,
          }
        : null)
    : imageState.metadata;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-8">

      {/* Error Banner */}
      {imageState.error && (
        <div className="mb-6 p-4 rounded-lg bg-signal-red/10 border border-signal-red/30 text-signal-red text-sm flex items-center justify-between gap-3">
          <span>{imageState.error}</span>
          <button
            onClick={runPipeline}
            className="px-3 py-1.5 bg-signal-red/15 hover:bg-signal-red/25 rounded-md text-xs font-semibold transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Workspace Split — preview is the dominant element on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Preview Panel: comes first in DOM on mobile, right column on desktop */}
        <div className="lg:col-span-7 lg:order-2">
          <BeforeAfterPreview
            originalUrl={previewOriginalUrl}
            processedResult={previewProcessedResult}
            metadata={previewMetadata}
            isProcessing={selectedBatchItem ? selectedBatchItem.status === 'processing' : imageState.isProcessing}
            onDownload={handleDownload}
            activeTool={activeTool}
            cropRect={cropRect}
            onCropRectChange={handleCropRectChange}
          />
        </div>

        {/* Left Sidebar: Tool Navigation + Controls */}
        <div className="lg:col-span-5 lg:order-1 space-y-5">

          {/* Category Tabs + Sub-tool Row */}
          <div className="p-3 rounded-2xl surface space-y-3">
            {/* Top Category Tabs Row: EDIT | OPTIMIZE | INSPECT | BATCH */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-line-800 overflow-x-auto no-scrollbar">
              {(['EDIT', 'OPTIMIZE', 'INSPECT', 'BATCH'] as NavCategory[]).map((cat) => {
                const isActiveCat = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`flex-1 py-2 px-2.5 rounded-md text-[11px] font-semibold tracking-wide transition-all uppercase text-center whitespace-nowrap glass-shine ${
                      isActiveCat
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-glow-sm'
                        : 'text-paper-400 hover:text-paper-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sub-tools of Selected Category */}
            <div className="flex flex-wrap gap-2">
              {toolsByCategory[activeCategory].map((t) => {
                const IconComp = t.icon;
                const isActive = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all border glass-shine ${
                      isActive
                        ? 'bg-accent/10 border-accent text-paper-100 shadow-glow-sm'
                        : 'bg-black/30 hover:bg-white/[0.04] text-paper-300 border-line-800'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-soft' : 'text-paper-500'}`} strokeWidth={1.75} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tool Settings Box */}
          <div className="p-5 sm:p-6 rounded-2xl surface min-h-[340px]">
            {activeTool === 'crop' && (
              <CropTool
                cropSettings={imageState.settings.crop}
                imageWidth={currentW}
                imageHeight={currentH}
                onApplyCrop={handleApplyCrop}
                onResetCropRect={handleResetCropRect}
                onCancelCrop={handleCancelCrop}
              />
            )}

            {activeTool === 'clean' && imageState.metadata && (
              <MetadataCleanerTool
                metadata={imageState.metadata}
                exifData={exifData}
                cleanSettings={imageState.settings.clean}
                onApplyClean={handleApplyClean}
                onResetClean={handleResetClean}
                onDownload={handleDownload}
                isProcessing={imageState.isProcessing}
              />
            )}

            {activeTool === 'batch' && (
              <BatchProcessingTool
                settings={imageState.settings.batch}
                onChangeSettings={(newBatch) =>
                  onUpdateSettings({ ...imageState.settings, batch: newBatch })
                }
                selectedItemId={selectedBatchItem?.id}
                onSelectItem={setSelectedBatchItem}
                initialFiles={initialBatchFiles}
              />
            )}

            {activeTool === 'resize' && imageState.metadata && (
              <ResizeTool
                originalWidth={imageState.metadata.width}
                originalHeight={imageState.metadata.height}
                settings={imageState.settings.resize}
                onChange={(newResize) =>
                  onUpdateSettings({ ...imageState.settings, resize: newResize })
                }
              />
            )}

            {activeTool === 'compress' && imageState.metadata && (
              <CompressTool
                originalSizeBytes={imageState.metadata.fileSizeBytes}
                formattedOriginalSize={imageState.metadata.formattedSize}
                settings={imageState.settings.compress}
                processedResult={imageState.processedResult}
                onChange={(newCompress) =>
                  onUpdateSettings({ ...imageState.settings, compress: newCompress })
                }
              />
            )}

            {activeTool === 'convert' && (
              <ConvertTool
                currentFormat={imageState.settings.convert.format}
                settings={imageState.settings.convert}
                onChange={(newConvert) =>
                  onUpdateSettings({ ...imageState.settings, convert: newConvert })
                }
              />
            )}

            {activeTool === 'rotate' && (
              <RotateFlipTool
                settings={imageState.settings.rotateFlip}
                onChange={(newRotateFlip) =>
                  onUpdateSettings({ ...imageState.settings, rotateFlip: newRotateFlip })
                }
              />
            )}

            {activeTool === 'info' && imageState.metadata && (
              <ImageInfoTool metadata={imageState.metadata} />
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center gap-3">
            <button
              onClick={onResetEdits}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg surface hover:border-line-600 text-xs font-medium text-paper-300 hover:text-paper-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all edits</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!imageState.processedResult}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs transition-all shadow-glow-sm hover:shadow-glow disabled:opacity-40 disabled:shadow-none glass-shine"
            >
              <Download className="w-4 h-4" strokeWidth={2.5} />
              <span>Download image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EditorLayout.displayName = 'EditorLayout';
