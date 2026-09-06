'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, ShieldAlert, Sparkles, FileImage, CheckCircle2 } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  isProcessing?: boolean;
}

const SUPPORTED_EXT_REGEX = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i;

export const DropZone: React.FC<DropZoneProps> = ({ onImageSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageExt = SUPPORTED_EXT_REGEX.test(file.name);

    if (!isImageMime && !isImageExt) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, GIF, or BMP).');
      return;
    }
    // Warn if file is over 50MB
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size is over 50MB. Processing large files depends on browser memory.');
    }
    onImageSelected(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
      // Reset input value so selecting the exact same file again triggers onChange
      e.target.value = '';
    }
  };

  const handleSampleClick = async (sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId);
    if (sample) {
      const file = await sample.createFile();
      onImageSelected(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-cyan-400 bg-brand-950/60 shadow-2xl shadow-cyan-500/20 scale-[1.01]'
            : 'border-gray-700/70 hover:border-brand-500/80 bg-dark-800/60 hover:bg-dark-800/90 shadow-xl'
        }`}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl -z-10 ${
            isDragOver ? 'opacity-30' : ''
          }`}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />

        {/* Upload Icon Circle */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-900/80 to-dark-700 border border-brand-500/30 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-brand-400 transition-transform duration-300">
          <Upload
            className={`w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors ${
              isDragOver ? 'animate-bounce' : ''
            }`}
          />
        </div>

        {/* Headline */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {isDragOver ? 'Drop your image here!' : 'Drop your image here'}
        </h3>
        
        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
          or click anywhere to browse from your device
        </p>

        {/* Primary Browse Button */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all">
          <FileImage className="w-4 h-4" />
          <span>Browse Files</span>
        </div>

        {/* Supported Formats Pill */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-gray-400">
          <span className="px-2.5 py-1 rounded-md bg-dark-900/80 border border-gray-800 font-mono text-gray-300">JPG</span>
          <span>•</span>
          <span className="px-2.5 py-1 rounded-md bg-dark-900/80 border border-gray-800 font-mono text-gray-300">PNG</span>
          <span>•</span>
          <span className="px-2.5 py-1 rounded-md bg-dark-900/80 border border-gray-800 font-mono text-gray-300">WebP</span>
        </div>
      </div>

      {/* Error Toast / Alert */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Demo Section */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>No image on hand? Try a 1-click sample:</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-gray-700/80 text-xs font-medium text-gray-200 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
