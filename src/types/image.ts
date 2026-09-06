export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type ToolType = 'resize' | 'compress' | 'convert' | 'rotate' | 'flip' | 'info';

export interface ImageMetadata {
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  formattedSize: string;
  width: number;
  height: number;
  aspectRatio: string;
  lastModified: number;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  aspectRatio: number; // width / height ratio
}

export interface CompressSettings {
  quality: number; // 0.01 to 1.0
}

export interface ConvertSettings {
  format: TargetFormat;
}

export interface RotateFlipSettings {
  rotation: number; // 0, 90, 180, 270 degrees
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ProcessingSettings {
  resize: ResizeSettings;
  compress: CompressSettings;
  convert: ConvertSettings;
  rotateFlip: RotateFlipSettings;
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  fileSizeBytes: number;
  formattedSize: string;
  width: number;
  height: number;
  format: TargetFormat;
  reductionPercentage: number; // e.g. 45% reduction (or negative if grew)
}

export interface ImageState {
  originalFile: File | null;
  originalImage: HTMLImageElement | null;
  metadata: ImageMetadata | null;
  activeTool: ToolType;
  settings: ProcessingSettings;
  processedResult: ProcessedImageResult | null;
  isProcessing: boolean;
  error: string | null;
}
