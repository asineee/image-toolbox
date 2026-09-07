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

export default function HomePage() {
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
    } catch (err: any) {
      setImageState((prev) => ({
        ...prev,
        isProcessing: false,
        error: err?.message || 'Could not load image. Please select a valid photo.',
      }));
    }
  }, []);

  const handleUpdateSettings = useCallback((newSettings: ProcessingSettings) => {
    setImageState((prev) => ({ ...prev, settings: newSettings }));
  }, []);

  const handleUpdateState = useCallback((partial: Partial<ImageState>) => {
    setImageState((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleResetEdits = useCallback(() => {
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
  }, []);

  const handleNewImage = useCallback(() => {
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

  const hasActiveImage = !!imageState.originalImage && !!imageState.metadata;
  const isBatchMode = imageState.activeTool === 'batch';
  const showWorkspace = hasActiveImage || isBatchMode;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-gray-100">
      
      {/* Global Navbar */}
      <Navbar
        hasImage={hasActiveImage}
        onReset={handleResetEdits}
        onNewImage={handleNewImage}
        onOpenBatch={handleOpenBatchMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {showWorkspace ? (
          <EditorLayout
            imageState={imageState}
            onUpdateSettings={handleUpdateSettings}
            onUpdateState={handleUpdateState}
            onResetEdits={handleResetEdits}
          />
        ) : (
          <>
            <LandingHero
              onImageSelected={handleImageSelected}
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
