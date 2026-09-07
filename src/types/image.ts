export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type ToolType = 'resize' | 'compress' | 'convert' | 'rotate' | 'flip' | 'info' | 'crop' | 'clean' | 'batch';

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

export interface GpsLocation {
  latitude: number;
  longitude: number;
  formatted: string;
}

export interface ExifData {
  supportedFormat: boolean;
  hasExif: boolean;
  make?: string;
  model?: string;
  dateTime?: string;
  software?: string;
  orientation?: string;
  lensModel?: string;
  gps?: GpsLocation;
  sensitiveDetected: boolean;
  detectedFieldsCount: number;
}

export type BatchItemStatus = 'idle' | 'processing' | 'success' | 'error';
export type BatchOperationType = 'resize' | 'compress' | 'convert';

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  imageElement: HTMLImageElement | null;
  filename: string;
  formattedSize: string;
  width: number;
  height: number;
  status: BatchItemStatus;
  error?: string;
  result?: ProcessedImageResult;
}

export interface BatchSettings {
  operation: BatchOperationType;
  resize: ResizeSettings;
  compress: CompressSettings;
  convert: ConvertSettings;
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

export interface CropRect {
  x: number;      // 0.0 to 1.0 (normalized X relative to rotated image width)
  y: number;      // 0.0 to 1.0 (normalized Y relative to rotated image height)
  width: number;  // 0.0 to 1.0 (normalized width)
  height: number; // 0.0 to 1.0 (normalized height)
}

export interface CropSettings {
  active: boolean;
  rect: CropRect | null;
}

export interface CleanSettings {
  active: boolean;
  isCleaned: boolean;
}

export interface ProcessingSettings {
  resize: ResizeSettings;
  compress: CompressSettings;
  convert: ConvertSettings;
  rotateFlip: RotateFlipSettings;
  crop: CropSettings;
  clean: CleanSettings;
  batch: BatchSettings;
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
