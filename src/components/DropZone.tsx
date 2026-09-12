'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, ShieldAlert, FileImage } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  isProcessing?: boolean;
}

const SUPPORTED_EXT_REGEX = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i;

export const DropZone: React.FC<DropZoneProps> = ({ onImageSelected, onFilesSelected }) => {
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

  const processSelectedFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList).filter((f) => {
      const isImageMime = f.type && f.type.startsWith('image/');
      const isImageExt = SUPPORTED_EXT_REGEX.test(f.name);
      return isImageMime || isImageExt;
    });

    if (files.length === 0) {
      setErrorMessage('Please select valid image file(s) (JPG, PNG, WebP, GIF, or BMP).');
      return;
    }

    if (files.length > 1 && onFilesSelected) {
      onFilesSelected(files);
    } else {
      if (files[0].size > 50 * 1024 * 1024) {
        setErrorMessage('File size is over 50MB. Processing large files depends on browser memory.');
      }
      onImageSelected(files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
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
    <div className="w-full max-w-2xl">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 border surface ${
          isDragOver
            ? 'border-accent shadow-glow bg-accent/[0.06]'
            : 'border-line-800 hover:border-line-600 hover:shadow-glow-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />

        <div className={`mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-all ${
          isDragOver
            ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-blue-500 shadow-glow'
            : 'bg-ink-800 border border-line-800'
        }`}>
          <Upload className={`w-7 h-7 ${isDragOver ? 'text-white' : 'text-paper-400'}`} strokeWidth={1.75} />
        </div>

        <h3 className="text-lg font-semibold text-paper-100 mb-1.5">
          {isDragOver ? 'Drop to upload' : 'Drop an image here'}
        </h3>

        <p className="text-sm text-paper-400 mb-6">
          or <span className="text-paper-100 underline underline-offset-2">browse your files</span>
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm transition-all shadow-glow-sm hover:shadow-glow glass-shine">
          <FileImage className="w-4 h-4" strokeWidth={2} />
          <span>Choose a file</span>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2.5 text-[11px] text-paper-500 font-mono uppercase tracking-wide">
          <span>JPG</span>
          <span className="text-line-700">/</span>
          <span>PNG</span>
          <span className="text-line-700">/</span>
          <span>WebP</span>
          <span className="text-line-700">/</span>
          <span>GIF</span>
          <span className="text-line-700">/</span>
          <span>BMP</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3.5 rounded-lg bg-signal-red/10 border border-signal-red/30 text-signal-red text-sm flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-paper-500">
        <span>No image handy? Try a sample —</span>
        {SAMPLE_IMAGES.map((sample, idx) => (
          <React.Fragment key={sample.id}>
            <button
              onClick={() => handleSampleClick(sample.id)}
              className="text-paper-300 hover:text-accent-soft underline underline-offset-2 transition-colors"
            >
              {sample.name}
            </button>
            {idx < SAMPLE_IMAGES.length - 1 && <span className="text-line-700">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
