'use client';

import React, { useState, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { LandingHero } from '../components/LandingHero';
import { EditorLayout } from '../components/Editor/EditorLayout';
import { PrivacySection } from '../components/LandingSections/PrivacySection';
import { HowItWorksSection } from '../components/LandingSections/HowItWorksSection';
import { FaqSection } from '../components/LandingSections/FaqSection';
import { Footer } from '../components/LandingSections/Footer';
import { ImageState, ProcessingSettings, TargetFormat } from '../types/image';
import { loadImageFromFile } from '../utils/imageProcessor';
import { formatBytes, calculateAspectRatioStr, extensionToMime } from '../utils/formatters';
import { useEditorHistory } from '../hooks/useEditorHistory';

export default function HomePage() {
  const history = useEditorHistory({ maxHistoryLength: 30 });
  const [initialBatchFiles, setInitialBatchFiles] = useState<File[]>([]);
  const [imageState, setImageState] = useState<ImageState>({
    originalFile: null,
    originalImage: null,
    metadata: null,
    activeTool: 'crop',
    settings: {
      resize: {
        width: 0,
        height: 0,
        maintainAspectRatio: true,
        aspectRatio: 1,
      },
      compress: {
        quality: 0.8,
      },
      convert: {
        format: 'image/jpeg',
      },
      rotateFlip: {
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
      },
      crop: {
        active: false,
        rect: null,
      },
      clean: {
        active: false,
        isCleaned: false,
      },
      batch: {
        operation: 'resize',
        resize: { width: 1920, height: 1080, maintainAspectRatio: true, aspectRatio: 16 / 9 },
        compress: { quality: 0.8 },
        convert: { format: 'image/jpeg' },
      },
    },
    processedResult: null,
    isProcessing: false,
    error: null,
  });

  const handleImageSelected = useCallback(async (file: File) => {
    setImageState((prev) => ({ ...prev, isProcessing: true, error: null }));

    try {
      const img = await loadImageFromFile(file);
      const aspectVal = img.width / img.height;
      const formattedSizeStr = formatBytes(file.size);
      const ratioStr = calculateAspectRatioStr(img.width, img.height);
      const formatMime: TargetFormat = (extensionToMime(file.name) as TargetFormat) || 'image/jpeg';

      const initialSettings: ProcessingSettings = {
        resize: {
          width: img.width,
          height: img.height,
          maintainAspectRatio: true,
          aspectRatio: aspectVal,
        },
        compress: {
          quality: 0.8,
        },
        convert: {
          format: formatMime,
        },
        rotateFlip: {
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
        },
        crop: {
          active: false,
          rect: null,
        },
        clean: {
          active: false,
          isCleaned: false,
        },
        batch: {
          operation: 'resize',
          resize: { width: img.width, height: img.height, maintainAspectRatio: true, aspectRatio: aspectVal },
          compress: { quality: 0.8 },
          convert: { format: formatMime },
        },
      };

      setImageState({
        originalFile: file,
        originalImage: img,
        metadata: {
          filename: file.name,
          fileType: file.type || formatMime,
          fileSizeBytes: file.size,
          formattedSize: formattedSizeStr,
          width: img.width,
          height: img.height,
          aspectRatio: ratioStr,
          lastModified: file.lastModified,
        },
        activeTool: 'crop',
        settings: initialSettings,
        processedResult: null,
        isProcessing: false,
        error: null,
      });
      history.clearHistory();
    } catch (err: any) {
      setImageState((prev) => ({
        ...prev,
        isProcessing: false,
        error: err?.message || 'Could not load image. Please select a valid photo.',
      }));
    }
  }, [history]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 1) {
      handleImageSelected(files[0]);
    } else if (files.length >= 2) {
      setInitialBatchFiles(files);
      setImageState((prev) => ({
        ...prev,
        activeTool: 'batch',
      }));
    }
  }, [handleImageSelected]);

  const handleUpdateSettings = useCallback((newSettings: ProcessingSettings) => {
    history.pushState(imageState.settings, imageState.activeTool);
    setImageState((prev) => ({ ...prev, settings: newSettings }));
  }, [history, imageState.settings, imageState.activeTool]);

  const handleUpdateState = useCallback((partial: Partial<ImageState>) => {
    setImageState((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleResetEdits = useCallback(() => {
    history.pushState(imageState.settings, imageState.activeTool);
    setImageState((prev) => {
      if (!prev.originalImage || !prev.metadata) return prev;
      const img = prev.originalImage;
      const aspectVal = img.width / img.height;

      return {
        ...prev,
        settings: {
          resize: {
            width: img.width,
            height: img.height,
            maintainAspectRatio: true,
            aspectRatio: aspectVal,
          },
          compress: {
            quality: 0.8,
          },
          convert: {
            format: (extensionToMime(prev.metadata.filename) as TargetFormat) || 'image/jpeg',
          },
          rotateFlip: {
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
          },
          crop: {
            active: false,
            rect: null,
          },
          clean: {
            active: false,
            isCleaned: false,
          },
          batch: {
            operation: 'resize',
            resize: { width: img.width, height: img.height, maintainAspectRatio: true, aspectRatio: aspectVal },
            compress: { quality: 0.8 },
            convert: { format: 'image/jpeg' },
          },
        },
      };
    });
  }, [history, imageState.settings, imageState.activeTool]);

  const handleNewImage = useCallback(() => {
    history.clearHistory();
    setInitialBatchFiles([]);
    setImageState({
      originalFile: null,
      originalImage: null,
      metadata: null,
      activeTool: 'crop',
      settings: {
        resize: { width: 0, height: 0, maintainAspectRatio: true, aspectRatio: 1 },
        compress: { quality: 0.8 },
        convert: { format: 'image/jpeg' },
        rotateFlip: { rotation: 0, flipHorizontal: false, flipVertical: false },
        crop: { active: false, rect: null },
        clean: { active: false, isCleaned: false },
        batch: {
          operation: 'resize',
          resize: { width: 0, height: 0, maintainAspectRatio: true, aspectRatio: 1 },
          compress: { quality: 0.8 },
          convert: { format: 'image/jpeg' },
        },
      },
      processedResult: null,
      isProcessing: false,
      error: null,
    });
  }, []);

  const handleOpenBatchMode = useCallback(() => {
    setImageState((prev) => ({
      ...prev,
      activeTool: 'batch',
    }));
  }, []);

  const handleUndo = useCallback(() => {
    const restoredEntry = history.undo(imageState.settings, imageState.activeTool);
    if (restoredEntry) {
      setImageState((prev) => ({
        ...prev,
        settings: restoredEntry.settings,
        activeTool: restoredEntry.activeTool || prev.activeTool,
      }));
    }
  }, [history, imageState.settings, imageState.activeTool]);

  const handleRedo = useCallback(() => {
    const restoredEntry = history.redo(imageState.settings, imageState.activeTool);
    if (restoredEntry) {
      setImageState((prev) => ({
        ...prev,
        settings: restoredEntry.settings,
        activeTool: restoredEntry.activeTool || prev.activeTool,
      }));
    }
  }, [history, imageState.settings, imageState.activeTool]);

  const hasActiveImage = !!imageState.originalImage && !!imageState.metadata;
  const isBatchMode = imageState.activeTool === 'batch';
  const showWorkspace = hasActiveImage || isBatchMode;

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Global Navbar */}
      <Navbar
        hasImage={hasActiveImage}
        onReset={handleResetEdits}
        onNewImage={handleNewImage}
        onOpenBatch={handleOpenBatchMode}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {showWorkspace ? (
          <EditorLayout
            imageState={imageState}
            onUpdateSettings={handleUpdateSettings}
            onUpdateState={handleUpdateState}
            onResetEdits={handleResetEdits}
            initialBatchFiles={initialBatchFiles}
            onImageSelected={handleImageSelected}
            onFilesSelected={handleFilesSelected}
          />
        ) : (
          <>
            <LandingHero
              onImageSelected={handleImageSelected}
              onFilesSelected={handleFilesSelected}
              onOpenBatch={handleOpenBatchMode}
            />
            <PrivacySection />
            <HowItWorksSection />
            <FaqSection />
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
