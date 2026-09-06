import { ProcessingSettings, ProcessedImageResult, TargetFormat } from '../types/image';
import { formatBytes, mimeToExtension } from './formatters';

/**
 * Loads an HTMLImageElement safely from a File object.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a valid image.'));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width === 0 || img.height === 0) {
        return reject(new Error('Image has invalid dimensions or failed to decode.'));
      }
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image. File may be corrupted or unsupported by your browser.'));
    };

    img.src = url;
  });
}

/**
 * Core image processing pipeline:
 * Takes an original HTMLImageElement and ProcessingSettings,
 * performs rotation, flipping, resizing, format conversion, and quality compression in HTML5 Canvas.
 */
export async function processImagePipeline(
  sourceImg: HTMLImageElement,
  settings: ProcessingSettings,
  originalSizeBytes: number
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    try {
      const { resize, compress, convert, rotateFlip } = settings;
      const targetWidth = Math.max(1, Math.round(resize.width));
      const targetHeight = Math.max(1, Math.round(resize.height));

      const normRotation = ((rotateFlip.rotation % 360) + 360) % 360;
      const is90or270 = normRotation === 90 || normRotation === 270;

      // 1. First canvas for rotation & flipping
      const rotCanvas = document.createElement('canvas');
      const rotCtx = rotCanvas.getContext('2d');

      if (!rotCtx) {
        return reject(new Error('Browser 2D context could not be initialized.'));
      }

      if (is90or270) {
        rotCanvas.width = sourceImg.height;
        rotCanvas.height = sourceImg.width;
      } else {
        rotCanvas.width = sourceImg.width;
        rotCanvas.height = sourceImg.height;
      }

      rotCtx.save();
      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rotCtx.rotate((normRotation * Math.PI) / 180);
      rotCtx.scale(
        rotateFlip.flipHorizontal ? -1 : 1,
        rotateFlip.flipVertical ? -1 : 1
      );

      rotCtx.drawImage(
        sourceImg,
        -sourceImg.width / 2,
        -sourceImg.height / 2
      );
      rotCtx.restore();

      // 2. Main target canvas for final resize output
      const outCanvas = document.createElement('canvas');
      outCanvas.width = targetWidth;
      outCanvas.height = targetHeight;

      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        return reject(new Error('Browser 2D context failed for final output.'));
      }

      // Fill background white if converting PNG with transparency to JPEG
      if (convert.format === 'image/jpeg') {
        outCtx.fillStyle = '#ffffff';
        outCtx.fillRect(0, 0, targetWidth, targetHeight);
      }

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';

      outCtx.drawImage(rotCanvas, 0, 0, targetWidth, targetHeight);

      // 3. Compress & Export format
      const quality = Math.max(0.01, Math.min(1.0, compress.quality));

      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to generate image blob in browser.'));
          }

          const dataUrl = URL.createObjectURL(blob);
          const newSize = blob.size;
          const reduction = originalSizeBytes > 0
            ? Math.round(((originalSizeBytes - newSize) / originalSizeBytes) * 100)
            : 0;

          resolve({
            blob,
            dataUrl,
            fileSizeBytes: newSize,
            formattedSize: formatBytes(newSize),
            width: targetWidth,
            height: targetHeight,
            format: convert.format,
            reductionPercentage: reduction,
          });
        },
        convert.format,
        quality
      );
    } catch (err: any) {
      reject(new Error(err?.message || 'An error occurred during local image processing.'));
    }
  });
}

/**
 * Clean filename generator: e.g. "photo-resized.webp" or "photo-edited.png"
 */
export function generateOutputFilename(
  originalName: string,
  toolType: string,
  format: TargetFormat
): string {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const ext = mimeToExtension(format);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  let suffix = 'edited';
  if (toolType === 'resize') suffix = 'resized';
  else if (toolType === 'compress') suffix = 'compressed';
  else if (toolType === 'convert') suffix = 'converted';
  else if (toolType === 'rotate' || toolType === 'flip') suffix = 'rotated';

  return `${cleanBase}-${suffix}.${ext}`;
}
