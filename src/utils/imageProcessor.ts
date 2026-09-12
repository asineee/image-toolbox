import { ProcessingSettings, ProcessedImageResult, TargetFormat } from '../types/image';
import { formatBytes, mimeToExtension } from './formatters';
import UPNG from 'upng-js';

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
      (img as any)._originalFile = file;
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

      // Helper to export canvas to Blob asynchronously
      const exportCanvasBlob = (
        canvas: HTMLCanvasElement,
        mimeType: string,
        q: number
      ): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((b) => res(b), mimeType, q);
        });
      };

      // 4. Compress & Export format
      const initialQuality = Math.max(0.01, Math.min(1.0, compress.quality));

      (async () => {
        try {
          let initialBlob: Blob | null = null;

          if (convert.format === 'image/png') {
            // PNG encoding: the native canvas.toBlob('image/png') encoder is
            // browser-native (fast, correct RGBA/alpha handling) but cannot
            // do color quantization. UPNG.encode's quantizer is a pure-JS,
            // synchronous, single-threaded routine — for large images it can
            // block the main thread for several seconds, and it was
            // previously being invoked even when no quantization was
            // actually wanted (e.g. quality = 100%), which produced no
            // benefit and cost the most (a full 32-bit re-encode is the most
            // expensive case for a JS-based encoder).
            //
            // Quantization only matters when the user has explicitly asked
            // for a smaller/lower-quality PNG. So: default to the fast
            // native encoder, and only fall through to UPNG's quantizer when
            // quality < 100% — checking transparency (which also disables
            // quantization, to protect alpha blending from palette
            // artifacts) only in that case, since it's the only case where
            // it can change the outcome.
            if (initialQuality >= 1.0) {
              initialBlob = await exportCanvasBlob(outCanvas, 'image/png', 1.0);
            } else {
              const imageData = outCtx.getImageData(0, 0, targetWidth, targetHeight);

              let hasTransparency = false;
              const data = imageData.data;
              for (let i = 3; i < data.length; i += 4) {
                if (data[i] !== 255) {
                  hasTransparency = true;
                  break;
                }
              }

              if (hasTransparency) {
                // Quantizing RGB-under-alpha can misrepresent blended colors,
                // and transparent PNGs (logos, cutouts, UI assets) are the
                // case users most need pixel-perfect — always keep these
                // lossless, via the fast native encoder.
                initialBlob = await exportCanvasBlob(outCanvas, 'image/png', 1.0);
              } else {
                // User explicitly wants a smaller/quantized PNG, and the
                // image is fully opaque — safe to quantize. Yield to the
                // browser first so the "Updating..." state actually paints
                // before the (still synchronous, third-party) quantizer
                // blocks the main thread.
                await new Promise((r) => setTimeout(r, 0));

                const pixelData = new Uint8ClampedArray(data);
                const cnum = Math.max(2, Math.min(256, Math.round(initialQuality * 256)));
                const pngArrayBuffer = UPNG.encode([pixelData.buffer], targetWidth, targetHeight, cnum);
                initialBlob = new Blob([pngArrayBuffer], { type: 'image/png' });
              }
            }
          } else {
            initialBlob = await exportCanvasBlob(outCanvas, convert.format, initialQuality);
          }

          if (!initialBlob) {
            return reject(new Error('Failed to generate image blob in browser.'));
          }

          let finalBlob: Blob = initialBlob;

          // If exported blob is larger than original, try a lower JPEG/WebP
          // quality to shrink it. This retry is intentionally NOT applied to
          // PNG: comparing a re-encoded PNG's size against an unrelated
          // original (e.g. a much smaller JPEG being converted to PNG, which
          // is the normal case) previously caused the output to be quantized
          // down — sometimes to just a handful of colors — purely to chase an
          // unrelated size target, which is what produced severely incorrect
          // colors. PNG output now always honors the quality/transparency
          // logic above and nothing else.
          if (
            originalSizeBytes > 0 &&
            finalBlob.size > originalSizeBytes &&
            (convert.format === 'image/jpeg' || convert.format === 'image/webp')
          ) {
            let currentQuality = initialQuality;
            while (currentQuality > 0.01 && finalBlob.size > originalSizeBytes) {
              currentQuality = Math.max(0.01, Number((currentQuality - 0.05).toFixed(2)));
              const nextBlob = await exportCanvasBlob(outCanvas, convert.format, currentQuality);
              if (nextBlob) {
                if (nextBlob.size < finalBlob.size) {
                  finalBlob = nextBlob;
                }
                if (finalBlob.size <= originalSizeBytes) {
                  break;
                }
              }
            }

            // If no lower quality produces a smaller file, return the original file/blob
            if (finalBlob.size > originalSizeBytes && (sourceImg as any)._originalFile) {
              finalBlob = (sourceImg as any)._originalFile;
            }
          }

          const dataUrl = URL.createObjectURL(finalBlob);
          const newSize = finalBlob.size;
          const reduction = originalSizeBytes > 0
            ? Math.round(((originalSizeBytes - newSize) / originalSizeBytes) * 100)
            : 0;

          resolve({
            blob: finalBlob,
            dataUrl,
            fileSizeBytes: newSize,
            formattedSize: formatBytes(newSize),
            width: targetWidth,
            height: targetHeight,
            format: convert.format,
            reductionPercentage: reduction,
          });
        } catch (err: any) {
          reject(err instanceof Error ? err : new Error('Failed to compress image.'));
        }
      })();
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
