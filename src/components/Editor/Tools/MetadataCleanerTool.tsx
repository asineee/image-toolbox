'use client';

import React from 'react';
import { ImageMetadata, ExifData, CleanSettings } from '../../../types/image';
import { ShieldCheck, ShieldAlert, Sparkles, Download, RefreshCw, Info, MapPin, Camera, Calendar, Cpu, Compass, HardDrive } from 'lucide-react';

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
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Metadata Cleaner</span>
        </h3>
        <p className="text-xs text-gray-400">
          Inspect EXIF privacy details and strip sensitive camera, timestamp, and location metadata.
        </p>
      </div>

      {/* Clean Status Banner */}
      {cleanSettings.isCleaned ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-sm text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Image Metadata Cleaned</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Protected
            </span>
          </div>
          <p className="text-xs text-emerald-300/90 leading-relaxed">
            EXIF and location metadata have been stripped via client-side canvas re-rendering. Original visual dimensions, quality, and transparency were preserved.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Cleaned Image</span>
            </button>
            <button
              onClick={onResetClean}
              className="py-2.5 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-700/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      ) : sensitiveFound ? (
        /* Sensitive Metadata Detected Warning */
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
          <div className="flex items-center gap-2.5 font-bold text-sm text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Sensitive Metadata Detected</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            This image contains camera, software, or timestamp information that could reveal device details or creation time. You can strip this data using the clean tool below.
          </p>
        </div>
      ) : null}

      {/* GPS Location Section (Only shown if GPS is successfully parsed and not yet cleaned) */}
      {hasGps && !cleanSettings.isCleaned && exifData?.gps && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>GPS Location Coordinates</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
              GPS Tag
            </span>
          </div>
          <p className="font-mono text-sm text-white bg-dark-900/80 p-2.5 rounded-xl border border-rose-500/20 text-center">
            {exifData.gps.formatted}
          </p>
        </div>
      )}

      {/* Inspected Metadata Fields Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-300">EXIF Metadata Inspection</span>
          <span className="text-gray-500 font-mono">
            {isJpeg
              ? exifData?.hasExif
                ? `${exifData.detectedFieldsCount} EXIF Field(s) Detected`
                : 'No EXIF Detected'
              : 'PNG / WebP / Non-JPEG'}
          </span>
        </div>

        <div className="rounded-2xl bg-dark-900/90 border border-gray-800 divide-y divide-gray-800/80 overflow-hidden">
          {/* File Basics */}
          <div className="p-3.5 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400 font-medium">Format & Size</span>
            <span className="text-xs text-white font-mono">
              {metadata.fileType.toUpperCase()} ({metadata.formattedSize})
            </span>
          </div>

          {/* Format capability note for non-JPEGs */}
          {!isJpeg && (
            <div className="p-3.5 text-xs text-gray-400 flex items-start gap-2.5 bg-dark-950/40">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Extended binary EXIF parsing is specific to JPEG files. For {metadata.fileType.toUpperCase()} files, cleaning will re-render pixels onto a fresh Canvas 2D, removing text/chunk metadata while preserving image transparency and dimensions.
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
                    <Icon className={`w-4 h-4 ${isDetected ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-semibold text-gray-300">{f.label}</span>
                  </div>
                  <span
                    className={`text-xs font-mono truncate max-w-[200px] sm:max-w-[240px] ${
                      isDetected ? 'text-white font-bold' : 'text-gray-500 italic'
                    }`}
                  >
                    {cleanSettings.isCleaned
                      ? 'Stripped'
                      : f.value || 'Not Detected'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tool Capability & Limitations Clarification */}
      <div className="p-3.5 rounded-xl bg-dark-900/70 border border-gray-800/90 text-xs text-gray-400 space-y-1.5">
        <p className="font-bold text-gray-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Format Cleaning Capabilities</span>
        </p>
        <p className="text-[11px] leading-relaxed text-gray-400">
          Cleaning re-draws image pixels onto an HTML5 Canvas 2D and re-exports in your original format ({metadata.fileType.toUpperCase()}). This removes standard EXIF, camera, timestamp, and location tags without altering visual appearance or dimensions. Canvas re-encoding strips standard metadata chunks, but does not guarantee stripping every arbitrary custom vendor chunk.
        </p>
      </div>

      {/* Action Controls */}
      <div className="pt-2">
        {!cleanSettings.isCleaned ? (
          <button
            onClick={onApplyClean}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Remove Metadata / Clean Image</span>
          </button>
        ) : (
          <button
            onClick={onDownload}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Cleaned Image</span>
          </button>
        )}
      </div>
    </div>
  );
};
