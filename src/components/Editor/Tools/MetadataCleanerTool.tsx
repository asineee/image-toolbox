'use client';

import React from 'react';
import { ImageMetadata, ExifData, CleanSettings } from '../../../types/image';
import { ShieldCheck, ShieldAlert, Sparkles, Download, RefreshCw, Info, MapPin, Camera, Calendar, Cpu, Compass } from 'lucide-react';

interface MetadataCleanerToolProps {
  metadata: ImageMetadata;
  exifData: ExifData | null;
  cleanSettings: CleanSettings;
  onApplyClean: () => void;
  onResetClean: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

export const MetadataCleanerTool: React.FC<MetadataCleanerToolProps> = ({
  metadata,
  exifData,
  cleanSettings,
  onApplyClean,
  onResetClean,
  onDownload,
  isProcessing,
}) => {
  const isJpeg = metadata.fileType.toLowerCase().includes('jpeg') || metadata.fileType.toLowerCase().includes('jpg');

  const fieldsList = [
    {
      label: 'Camera Make',
      value: exifData?.make,
      icon: Camera,
      sensitive: true,
    },
    {
      label: 'Camera Model',
      value: exifData?.model,
      icon: Camera,
      sensitive: true,
    },
    {
      label: 'Date & Time',
      value: exifData?.dateTime,
      icon: Calendar,
      sensitive: true,
    },
    {
      label: 'Software / Device',
      value: exifData?.software,
      icon: Cpu,
      sensitive: true,
    },
    {
      label: 'Orientation',
      value: exifData?.orientation,
      icon: Compass,
      sensitive: false,
    },
    {
      label: 'Lens Model',
      value: exifData?.lensModel,
      icon: Camera,
      sensitive: false,
    },
  ];

  const hasGps = Boolean(exifData?.gps);
  const sensitiveFound = exifData?.sensitiveDetected && !cleanSettings.isCleaned;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-paper-100 mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-accent" strokeWidth={1.75} />
          <span>Metadata cleaner</span>
        </h3>
        <p className="text-xs text-paper-500">
          Inspect EXIF details and strip camera, timestamp, and location metadata.
        </p>
      </div>

      {/* Clean Status Banner */}
      {cleanSettings.isCleaned ? (
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-medium text-sm text-paper-100">
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
              <span>Metadata cleaned</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-medium">
              Protected
            </span>
          </div>
          <p className="text-xs text-paper-400 leading-relaxed">
            EXIF and location metadata were stripped via canvas re-rendering. Dimensions, quality, and transparency were preserved.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onDownload}
              className="flex-1 py-2.5 px-4 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-sm hover:shadow-glow glass-shine"
            >
              <Download className="w-4 h-4" strokeWidth={2.5} />
              <span>Download cleaned image</span>
            </button>
            <button
              onClick={onResetClean}
              className="py-2.5 px-3 rounded-md bg-ink-800 hover:bg-ink-700 text-paper-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-line-800 glass-shine"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      ) : sensitiveFound ? (
        <div className="p-4 rounded-lg bg-signal-amber/10 border border-signal-amber/30 space-y-2">
          <div className="flex items-center gap-2.5 font-medium text-sm text-signal-amber">
            <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Sensitive metadata detected</span>
          </div>
          <p className="text-xs text-paper-300 leading-relaxed">
            This image contains camera, software, or timestamp information that could reveal device details or creation time. Strip it with the clean tool below.
          </p>
        </div>
      ) : null}

      {/* GPS Location Section (Only shown if GPS is successfully parsed and not yet cleaned) */}
      {hasGps && !cleanSettings.isCleaned && exifData?.gps && (
        <div className="p-4 rounded-lg bg-signal-red/10 border border-signal-red/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-xs text-signal-red">
              <MapPin className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>GPS location coordinates</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-signal-red/15 text-signal-red font-mono text-[10px] font-medium">
              GPS tag
            </span>
          </div>
          <p className="font-mono text-sm text-paper-100 bg-ink-950 p-2.5 rounded-md border border-signal-red/20 text-center">
            {exifData.gps.formatted}
          </p>
        </div>
      )}

      {/* Inspected Metadata Fields Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-paper-400">EXIF inspection</span>
          <span className="text-paper-500 font-mono text-[11px]">
            {isJpeg
              ? exifData?.hasExif
                ? `${exifData.detectedFieldsCount} field(s) detected`
                : 'No EXIF detected'
              : 'PNG / WebP / non-JPEG'}
          </span>
        </div>

        <div className="rounded-lg bg-ink-950 border border-line-800 divide-y divide-line-800 overflow-hidden glass-shine">
          {/* File Basics */}
          <div className="p-3.5 flex items-center justify-between gap-4">
            <span className="text-xs text-paper-400">Format & size</span>
            <span className="text-xs text-paper-100 font-mono">
              {metadata.fileType.toUpperCase()} ({metadata.formattedSize})
            </span>
          </div>

          {/* Format capability note for non-JPEGs */}
          {!isJpeg && (
            <div className="p-3.5 text-xs text-paper-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-paper-500 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>
                Detailed EXIF parsing applies to JPEG files. For {metadata.fileType.toUpperCase()} files, cleaning re-renders pixels onto a fresh canvas, removing chunk metadata while preserving transparency and dimensions.
              </span>
            </div>
          )}

          {/* Supported JPEG Fields */}
          {isJpeg &&
            fieldsList.map((f) => {
              const Icon = f.icon;
              const isDetected = Boolean(f.value) && !cleanSettings.isCleaned;
              return (
                <div key={f.label} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isDetected ? 'text-signal-amber' : 'text-paper-500'}`} strokeWidth={1.75} />
                    <span className="text-xs font-medium text-paper-400">{f.label}</span>
                  </div>
                  <span
                    className={`text-xs font-mono truncate max-w-[200px] sm:max-w-[240px] ${
                      isDetected ? 'text-paper-100' : 'text-paper-500 italic'
                    }`}
                  >
                    {cleanSettings.isCleaned
                      ? 'Stripped'
                      : f.value || 'Not detected'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tool Capability & Limitations Clarification */}
      <div className="p-3.5 rounded-lg bg-ink-950 border border-line-800 text-xs text-paper-500 space-y-1.5 glass-shine">
        <p className="font-medium text-paper-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-paper-500" strokeWidth={1.75} />
          <span>Cleaning capabilities</span>
        </p>
        <p className="text-[11px] leading-relaxed">
          Cleaning re-draws pixels onto a canvas and re-exports in your original format ({metadata.fileType.toUpperCase()}). This removes standard EXIF, camera, timestamp, and location tags without altering appearance or dimensions — though it doesn't guarantee stripping every custom vendor chunk.
        </p>
      </div>

      {/* Action Controls */}
      <div className="pt-1">
        {!cleanSettings.isCleaned ? (
          <button
            onClick={onApplyClean}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:shadow-none transition-all shadow-glow-sm hover:shadow-glow glass-shine"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2} />
            <span>Remove metadata</span>
          </button>
        ) : (
          <button
            onClick={onDownload}
            className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-glow-sm hover:shadow-glow glass-shine"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            <span>Download cleaned image</span>
          </button>
        )}
      </div>
    </div>
  );
};
