'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { ImageState, ToolType, ProcessingSettings } from '../../types/image';
import { processImagePipeline, generateOutputFilename } from '../../utils/imageProcessor';
import { BeforeAfterPreview } from './BeforeAfterPreview';
import { ResizeTool } from './Tools/ResizeTool';
import { CompressTool } from './Tools/CompressTool';
import { ConvertTool } from './Tools/ConvertTool';
import { RotateFlipTool } from './Tools/RotateFlipTool';
import { ImageInfoTool } from './Tools/ImageInfoTool';
import { 
  Maximize2, 
  FileArchive, 
  FileType, 
  RotateCw, 
  Info, 
  Download,
  RotateCcw
} from 'lucide-react';

interface EditorLayoutProps {
  imageState: ImageState;
  onUpdateSettings: (newSettings: ProcessingSettings) => void;
  onUpdateState: (partial: Partial<ImageState>) => void;
  onResetEdits: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = memo(({
  imageState,
  onUpdateSettings,
  onUpdateState,
  onResetEdits,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('resize');
  const [originalObjUrl, setOriginalObjUrl] = useState<string>('');
  
  // Track request IDs to discard out-of-order stale async processing results
  const requestIdRef = useRef<number>(0);

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

  // Run image processing pipeline with race-condition check
  const runPipeline = useCallback(async () => {
    if (!imageState.originalImage || !imageState.metadata) return;

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
        onUpdateState({ processedResult: result, isProcessing: false });
      }
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        onUpdateState({
          isProcessing: false,
          error: err?.message || 'Failed to process image locally.',
        });
      }
    }
  }, [imageState.originalImage, imageState.settings, imageState.metadata, onUpdateState]);

  useEffect(() => {
    runPipeline();
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

  const tools: { id: ToolType; label: string; icon: any }[] = [
    { id: 'resize', label: 'Resize', icon: Maximize2 },
    { id: 'compress', label: 'Compress', icon: FileArchive },
    { id: 'convert', label: 'Convert', icon: FileType },
    { id: 'rotate', label: 'Rotate & Flip', icon: RotateCw },
    { id: 'info', label: 'Image Info', icon: Info },
  ];

  if (!imageState.metadata) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* Error Banner */}
      {imageState.error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{imageState.error}</span>
          <button
            onClick={runPipeline}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Tool Navigation + Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tool Navigation Bar */}
          <div className="p-1.5 rounded-2xl bg-dark-900 border border-gray-800 flex overflow-x-auto gap-1 no-scrollbar">
            {tools.map((t) => {
              const IconComp = t.icon;
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-cyan-300' : ''}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tool Settings Box */}
          <div className="p-6 rounded-3xl bg-dark-800/80 border border-gray-800/80 shadow-xl min-h-[340px]">
            {activeTool === 'resize' && (
              <ResizeTool
                originalWidth={imageState.metadata.width}
                originalHeight={imageState.metadata.height}
                settings={imageState.settings.resize}
                onChange={(newResize) =>
                  onUpdateSettings({ ...imageState.settings, resize: newResize })
                }
              />
            )}

            {activeTool === 'compress' && (
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

            {activeTool === 'info' && (
              <ImageInfoTool metadata={imageState.metadata} />
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onResetEdits}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-700 border border-gray-700/60 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Edits</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!imageState.processedResult}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>
        </div>

        {/* Right Area: Interactive Preview Panel */}
        <div className="lg:col-span-7">
          <BeforeAfterPreview
            originalUrl={originalObjUrl}
            processedResult={imageState.processedResult}
            metadata={imageState.metadata}
            isProcessing={imageState.isProcessing}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
});

EditorLayout.displayName = 'EditorLayout';
