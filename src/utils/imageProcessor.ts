import { ProcessingSettings, ProcessedImageResult, TargetFormat } from '../types/image';
import { formatBytes, mimeToExtension } from './formatters';

const SUPPORTED_EXT_REGEX = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i;

/**
 * Loads an HTMLImageElement safely from a File object.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageExt = SUPPORTED_EXT_REGEX.test(file.name);

    if (!isImageMime && !isImageExt) {
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
 * performs rotation, flipping, cropping, resizing, format conversion, and quality compression in HTML5 Canvas.
 */
export async function processImagePipeline(
  sourceImg: HTMLImageElement,
  settings: ProcessingSettings,
  originalSizeBytes: number
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    try {
      const { resize, compress, convert, rotateFlip, crop } = settings;

      const normRotation = ((rotateFlip.rotation % 360) + 360) % 360;
      const is90or270 = normRotation === 90 || normRotation === 270;

      // 1. Rotate & Flip canvas
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

      if (convert.format === 'image/jpeg') {
        rotCtx.fillStyle = '#ffffff';
        rotCtx.fillRect(0, 0, rotCanvas.width, rotCanvas.height);
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

      // 2. Crop processing (if crop is active and rect is valid)
      let sourceForOutput: HTMLCanvasElement = rotCanvas;

      if (crop && crop.active && crop.rect) {
        const cropX = Math.max(0, Math.min(rotCanvas.width - 1, Math.round(crop.rect.x * rotCanvas.width)));
        const cropY = Math.max(0, Math.min(rotCanvas.height - 1, Math.round(crop.rect.y * rotCanvas.height)));
        const cropW = Math.max(1, Math.min(rotCanvas.width - cropX, Math.round(crop.rect.width * rotCanvas.width)));
        const cropH = Math.max(1, Math.min(rotCanvas.height - cropY, Math.round(crop.rect.height * rotCanvas.height)));

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;

        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          if (convert.format === 'image/jpeg') {
            cropCtx.fillStyle = '#ffffff';
            cropCtx.fillRect(0, 0, cropW, cropH);
          }
          cropCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          sourceForOutput = cropCanvas;
        }
      }

      // 3. Final Resize & Output Canvas
      const targetWidth = Math.max(1, Math.round(resize.width || sourceForOutput.width));
      const targetHeight = Math.max(1, Math.round(resize.height || sourceForOutput.height));

      const outCanvas = document.createElement('canvas');
      outCanvas.width = targetWidth;
      outCanvas.height = targetHeight;

      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        return reject(new Error('Browser 2D context failed for final output.'));
      }

      if (convert.format === 'image/jpeg') {
        outCtx.fillStyle = '#ffffff';
        outCtx.fillRect(0, 0, targetWidth, targetHeight);
      }

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';

      outCtx.drawImage(sourceForOutput, 0, 0, targetWidth, targetHeight);

      // 4. Compress & Export format
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
 * Clean filename generator: e.g. "photo-cropped.webp" or "photo-resized.png"
 */
export function generateOutputFilename(
  originalName: string,
  toolType: string,
  format: TargetFormat
): string {
  const safeName = originalName || 'image';
  const lastDotIndex = safeName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? safeName.substring(0, lastDotIndex) : safeName;
  const ext = mimeToExtension(format);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  let suffix = 'edited';
  if (toolType === 'crop') suffix = 'cropped';
  else if (toolType === 'resize') suffix = 'resized';
  else if (toolType === 'compress') suffix = 'compressed';
  else if (toolType === 'convert') suffix = 'converted';
  else if (toolType === 'rotate' || toolType === 'flip') suffix = 'rotated';
  else if (toolType === 'clean') suffix = 'cleaned';

  return `${cleanBase || 'image'}-${suffix}.${ext}`;
}
