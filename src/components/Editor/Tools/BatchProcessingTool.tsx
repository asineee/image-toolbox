'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  BatchItem, 
  BatchSettings, 
  BatchOperationType, 
  TargetFormat, 
  ProcessingSettings 
} from '../../../types/image';
import { loadImageFromFile, processImagePipeline, generateOutputFilename } from '../../../utils/imageProcessor';
import { formatBytes } from '../../../utils/formatters';
import {
  Layers,
  Upload,
  X,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Maximize2,
  FileArchive,
  FileType,
  ShieldCheck,
  Archive,
  ChevronDown
} from 'lucide-react';

interface BatchProcessingToolProps {
  settings: BatchSettings;
  onChangeSettings: (newBatchSettings: BatchSettings) => void;
  selectedItemId?: string | null;
  onSelectItem?: (item: BatchItem | null) => void;
  initialFiles?: File[];
}

export const BatchProcessingTool: React.FC<BatchProcessingToolProps> = ({
  settings,
  onChangeSettings,
  selectedItemId,
  onSelectItem,
  initialFiles,
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedInitialFilesRef = useRef<Set<File>>(new Set());

  // Local, instantly-updating quality value for smooth slider dragging; the
  // actual settings commit (which also triggers the single-image preview
  // pipeline elsewhere in the app, since it shares the same top-level
  // settings object) only happens on release, or as a debounced fallback —
  // never per intermediate tick — so dragging doesn't spam reprocessing.
  const [localBatchQuality, setLocalBatchQuality] = useState<number>(settings.compress.quality);
  const batchQualityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBatchSettingsRef = useRef<BatchSettings>(settings);
  const liveBatchQualityRef = useRef<number>(settings.compress.quality);

  useEffect(() => {
    setLocalBatchQuality(settings.compress.quality);
    latestBatchSettingsRef.current = settings;
    liveBatchQualityRef.current = settings.compress.quality;
  }, [settings]);

  useEffect(() => {
    return () => {
      if (batchQualityDebounceRef.current) {
        clearTimeout(batchQualityDebounceRef.current);
      }
    };
  }, []);

  const itemsRef = useRef<BatchItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
        if (item.result?.dataUrl) {
          URL.revokeObjectURL(item.result.dataUrl);
        }
      });
    };
  }, []);

  const addFilesToBatch = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: BatchItem[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/') && !/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(file.name)) {
        continue;
      }

      // Duplicate check based on filename, size, and lastModified
      const isDuplicate = itemsRef.current.some(
        (existing) =>
          existing.file.name === file.name &&
          existing.file.size === file.size &&
          existing.file.lastModified === file.lastModified
      ) || newItems.some(
        (existing) =>
          existing.file.name === file.name &&
          existing.file.size === file.size &&
          existing.file.lastModified === file.lastModified
      );

      if (isDuplicate) continue;

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      try {
        const img = await loadImageFromFile(file);
        newItems.push({
          id,
          file,
          previewUrl,
          imageElement: img,
          filename: file.name,
          formattedSize: formatBytes(file.size),
          width: img.width,
          height: img.height,
          status: 'idle',
        });
      } catch (err: any) {
        newItems.push({
          id,
          file,
          previewUrl,
          imageElement: null,
          filename: file.name,
          formattedSize: formatBytes(file.size),
          width: 0,
          height: 0,
          status: 'error',
          error: err?.message || 'Failed to decode image file.',
        });
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  }, []);

  // Process initial files passed from home page landing drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const unprocessed = initialFiles.filter((f) => !processedInitialFilesRef.current.has(f));
      if (unprocessed.length > 0) {
        unprocessed.forEach((f) => processedInitialFilesRef.current.add(f));
        addFilesToBatch(unprocessed);
      }
    }
  }, [initialFiles, addFilesToBatch]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToBatch(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToBatch(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) {
        if (itemToRemove.previewUrl) {
          URL.revokeObjectURL(itemToRemove.previewUrl);
        }
        if (itemToRemove.result?.dataUrl) {
          URL.revokeObjectURL(itemToRemove.result.dataUrl);
        }
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (item.result?.dataUrl) {
        URL.revokeObjectURL(item.result.dataUrl);
      }
    });
    setItems([]);
  };

  const handleOperationChange = (op: BatchOperationType) => {
    onChangeSettings({ ...settings, operation: op });
  };

  const handleProcessAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    const snapshotItems = [...itemsRef.current];
    const activeSettings = { ...settings };

    for (let i = 0; i < snapshotItems.length; i++) {
      const item = snapshotItems[i];
      if (item.status === 'error' && !item.imageElement) continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', error: undefined } : it))
      );

      let imgEl = item.imageElement;
      if (!imgEl) {
        try {
          imgEl = await loadImageFromFile(item.file);
        } catch (err: any) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: 'error', error: err?.message || 'Failed to decode image file.' }
                : it
            )
          );
          continue;
        }
      }

      try {
        const targetFormat: TargetFormat =
          activeSettings.operation === 'convert'
            ? activeSettings.convert.format
            : (item.file.type as TargetFormat) || 'image/jpeg';

        const targetW =
          activeSettings.operation === 'resize' && activeSettings.resize.width > 0
            ? activeSettings.resize.width
            : (imgEl.width || item.width);
        const targetH =
          activeSettings.operation === 'resize' && activeSettings.resize.height > 0
            ? activeSettings.resize.height
            : (imgEl.height || item.height);

        const itemSettings: ProcessingSettings = {
          resize: {
            width: targetW,
            height: targetH,
            maintainAspectRatio: activeSettings.resize.maintainAspectRatio,
            aspectRatio: targetW / (targetH || 1),
          },
          compress: {
            quality: activeSettings.operation === 'compress' ? activeSettings.compress.quality : 0.8,
          },
          convert: {
            format: targetFormat,
          },
          rotateFlip: { rotation: 0, flipHorizontal: false, flipVertical: false },
          crop: { active: false, rect: null },
          clean: { active: false, isCleaned: false },
          batch: activeSettings,
        };

        const result = await processImagePipeline(imgEl, itemSettings, item.file.size);

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'success', result, imageElement: imgEl } : it
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'error', error: err?.message || 'Processing failed.' }
              : it
          )
        );
      }
    }

    setIsProcessingAll(false);
  };

  const handleDownloadItem = (item: BatchItem) => {
    if (!item.result) return;
    const format = settings.operation === 'convert' ? settings.convert.format : item.result.format;
    const filename = generateOutputFilename(item.filename, `batch-${settings.operation}`, format);

    const a = document.createElement('a');
    a.href = item.result.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const successItems = items.filter((i) => i.status === 'success' && i.result);
    successItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadItem(item);
      }, index * 250);
    });
  };

  const handleDownloadZip = async () => {
    const successItems = items.filter((i) => i.status === 'success' && i.result?.blob);
    if (successItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      successItems.forEach((item) => {
        if (item.result?.blob) {
          const format = settings.operation === 'convert' ? settings.convert.format : item.result.format;
          const filename = generateOutputFilename(item.filename, `batch-${settings.operation}`, format);
          zip.file(filename, item.result.blob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'imagetoolbox-batch.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('ZIP generation failed:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const successCount = items.filter((i) => i.status === 'success').length;
  const canProcess = items.some((i) => i.status !== 'processing' && i.status !== 'error');
  const isAllComplete = items.length > 0 && successCount > 0 && items.every((i) => i.status === 'success' || i.status === 'error');

  // Sync selected item reference with latest item state in list
  useEffect(() => {
    if (items.length > 0 && onSelectItem) {
      const currentlySelected = items.find((i) => i.id === selectedItemId);
      if (currentlySelected) {
        onSelectItem(currentlySelected);
      } else {
        const firstValid = items.find((i) => i.status !== 'error') || items[0];
        if (firstValid) {
          onSelectItem(firstValid);
        }
      }
    } else if (items.length === 0 && onSelectItem) {
      onSelectItem(null);
    }
  }, [items, selectedItemId, onSelectItem]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1 flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-accent" strokeWidth={1.75} />
          <span>Batch processing</span>
        </h3>
        <p className="text-xs text-paper-500">
          Process multiple photos at once. Click a queued image to preview it.
        </p>
      </div>

      {/* Operation Selection Tabs */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-paper-500 block">Operation</label>
        <div className="grid grid-cols-3 gap-2">
          {(['resize', 'compress', 'convert'] as BatchOperationType[]).map((op) => {
            const isActive = settings.operation === op;
            const labelMap: Record<BatchOperationType, { title: string; icon: any }> = {
              resize: { title: 'Resize', icon: Maximize2 },
              compress: { title: 'Compress', icon: FileArchive },
              convert: { title: 'Convert', icon: FileType },
            };
            const Icon = labelMap[op].icon;

            return (
              <button
                key={op}
                onClick={() => handleOperationChange(op)}
                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-md text-xs font-medium transition-colors border glass-shine ${
                  isActive
                    ? 'bg-accent/5 text-paper-100 border-accent'
                    : 'bg-ink-950 border-line-800 text-paper-400 hover:text-paper-100 hover:bg-ink-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : ''}`} strokeWidth={1.75} />
                <span>{labelMap[op].title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Settings Card */}
      <div className="p-4 rounded-lg bg-ink-950 border border-line-800 space-y-4">
        {settings.operation === 'resize' && (
          <div className="space-y-3">
            <span className="text-xs font-medium text-paper-400 block">Target dimensions</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-paper-500 block mb-1">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.resize.width || ''}
                  onChange={(e) => {
                    const w = parseInt(e.target.value) || 0;
                    onChangeSettings({
                      ...settings,
                      resize: { ...settings.resize, width: w },
                    });
                  }}
                  className="w-full bg-ink-900 border border-line-800 rounded-md px-3 py-2 text-xs font-mono text-paper-100 focus:outline-none focus:border-accent"
                  placeholder="e.g. 1920"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-paper-500 block mb-1">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.resize.height || ''}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    onChangeSettings({
                      ...settings,
                      resize: { ...settings.resize, height: h },
                    });
                  }}
                  className="w-full bg-ink-900 border border-line-800 rounded-md px-3 py-2 text-xs font-mono text-paper-100 focus:outline-none focus:border-accent"
                  placeholder="e.g. 1080"
                />
              </div>
            </div>
          </div>
        )}

        {settings.operation === 'compress' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-paper-400">Quality</span>
              <span className="font-mono text-paper-100 font-medium">{Math.round(localBatchQuality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={localBatchQuality}
              onChange={(e) => {
                const q = parseFloat(e.target.value);
                setLocalBatchQuality(q);
                liveBatchQualityRef.current = q;

                // Fallback only — the up/release handlers below normally
                // commit immediately once the user stops dragging.
                if (batchQualityDebounceRef.current) {
                  clearTimeout(batchQualityDebounceRef.current);
                }
                batchQualityDebounceRef.current = setTimeout(() => {
                  onChangeSettings({
                    ...latestBatchSettingsRef.current,
                    compress: { quality: liveBatchQualityRef.current },
                  });
                }, 400);
              }}
              onMouseUp={() => {
                if (batchQualityDebounceRef.current) {
                  clearTimeout(batchQualityDebounceRef.current);
                  batchQualityDebounceRef.current = null;
                }
                onChangeSettings({
                  ...latestBatchSettingsRef.current,
                  compress: { quality: liveBatchQualityRef.current },
                });
              }}
              onTouchEnd={() => {
                if (batchQualityDebounceRef.current) {
                  clearTimeout(batchQualityDebounceRef.current);
                  batchQualityDebounceRef.current = null;
                }
                onChangeSettings({
                  ...latestBatchSettingsRef.current,
                  compress: { quality: liveBatchQualityRef.current },
                });
              }}
              className="w-full accent-accent h-1.5 bg-ink-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        )}

        {settings.operation === 'convert' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-paper-400 block">Target format</label>
            <div className="relative">
              <select
                value={settings.convert.format}
                onChange={(e) => {
                  const fmt = e.target.value as TargetFormat;
                  onChangeSettings({
                    ...settings,
                    convert: { format: fmt },
                  });
                }}
                className="w-full appearance-none bg-ink-900 border border-line-800 rounded-md pl-3 pr-9 py-2.5 text-xs font-medium text-paper-100 focus:outline-none focus:border-accent cursor-pointer"
              >
                <option className="bg-ink-900 text-paper-100" value="image/jpeg">JPEG (.jpg)</option>
                <option className="bg-ink-900 text-paper-100" value="image/png">PNG (.png)</option>
                <option className="bg-ink-900 text-paper-100" value="image/webp">WebP (.webp)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Multi-File Drop Area (Isolated) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-lg border border-dashed transition-colors cursor-pointer text-center space-y-2 glass-shine ${
          isDragOver
            ? 'border-accent bg-accent/5'
            : 'border-line-800 hover:border-ink-500 bg-ink-950'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          className="hidden"
        />
        <div className="w-9 h-9 mx-auto rounded-md bg-ink-800 border border-line-800 flex items-center justify-center text-paper-400">
          <Upload className="w-4.5 h-4.5" strokeWidth={1.75} />
        </div>
        <p className="text-xs font-medium text-paper-300">Drag & drop multiple images, or click to browse</p>
        <p className="text-[11px] text-paper-500">Supports JPEG, PNG, WebP, GIF, BMP</p>
      </div>

      {/* Batch Action Bar */}
      {items.length > 0 && (
        <div className="p-3.5 rounded-lg bg-ink-950 border border-line-800 space-y-3 glass-shine">
          {/* Completion Banner */}
          {isAllComplete && (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-accent/5 border border-accent/30 text-xs font-medium text-paper-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                <span>Batch complete — {successCount}/{items.length} images processed</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-paper-400">
              <span className="font-medium text-paper-100">{items.length}</span> image(s) in queue
              {successCount > 0 && <span className="text-accent ml-2">({successCount} done)</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleClearAll}
                disabled={isProcessingAll}
                className="px-3 py-2 rounded-md bg-ink-800 hover:bg-ink-700 text-signal-red text-xs font-medium flex items-center gap-1.5 transition-colors border border-line-800 disabled:opacity-50 glass-shine"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>

              {successCount > 0 && (
                <>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-3.5 py-2 rounded-md bg-ink-800 hover:bg-ink-700 border border-line-800 text-paper-100 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 glass-shine"
                    title="Package all processed images into imagetoolbox-batch.zip"
                  >
                    {isZipping ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    <span>Download as ZIP</span>
                  </button>

                  <button
                    onClick={handleDownloadAll}
                    className="px-3 py-2 rounded-md bg-ink-800 hover:bg-ink-700 border border-line-800 text-paper-100 text-xs font-medium flex items-center gap-1.5 transition-colors glass-shine"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download all</span>
                  </button>
                </>
              )}

              <button
                onClick={handleProcessAll}
                disabled={!canProcess || isProcessingAll}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-sm hover:shadow-glow disabled:opacity-50 disabled:shadow-none glass-shine"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>{isAllComplete ? 'Re-process all' : 'Process all'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Items List */}
      {items.length > 0 && (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
          {items.map((item) => {
            const isSelected = item.id === selectedItemId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem && onSelectItem(item)}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors glass-shine ${
                  isSelected
                    ? 'bg-accent/5 border-accent'
                    : 'bg-ink-950 border-line-800 hover:border-ink-500'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail indicator */}
                  <div className="w-10 h-10 rounded-md bg-ink-900 border border-line-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.status === 'error' && !item.imageElement ? (
                      <AlertCircle className="w-4 h-4 text-signal-red" />
                    ) : item.result?.dataUrl || item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.result?.dataUrl || item.previewUrl}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-paper-500 uppercase">
                        {item.filename.split('.').pop() || 'IMG'}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className={`font-medium truncate max-w-[160px] sm:max-w-[220px] ${isSelected ? 'text-paper-100' : 'text-paper-200'}`}>
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-paper-500 font-mono">
                      {item.width && item.height ? `${item.width}×${item.height}px · ` : ''}
                      {item.result ? item.result.formattedSize : item.formattedSize}
                    </p>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {item.status === 'idle' && (
                    <span className="px-2 py-1 rounded-md bg-ink-800 text-paper-400 text-[10px] font-medium">
                      Ready
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processing</span>
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="px-2 py-1 rounded-md bg-signal-green/10 text-signal-green text-[10px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Done</span>
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="px-2 py-1 rounded-md bg-signal-red/10 text-signal-red text-[10px] font-medium flex items-center gap-1" title={item.error}>
                      <AlertCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )}

                  {item.status === 'success' && (
                    <button
                      onClick={() => handleDownloadItem(item)}
                      className="p-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-paper-300 hover:text-paper-100 transition-colors border border-line-800"
                      title="Download item"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isProcessingAll}
                    className="p-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-paper-400 hover:text-signal-red transition-colors border border-line-800 disabled:opacity-50"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Privacy Guarantee Card */}
      <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/20 text-xs text-paper-400 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
        <span>All batch images are processed locally in your browser. Nothing is uploaded.</span>
      </div>
    </div>
  );
};
