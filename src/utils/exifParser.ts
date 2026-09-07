import { ExifData, GpsLocation } from '../types/image';

/**
 * Parses binary JPEG files to extract supported EXIF metadata fields:
 * Camera Make, Camera Model, Date/Time, Software, Orientation, Lens Model, and GPS Coordinates.
 */
export async function parseExifMetadata(file: File): Promise<ExifData> {
  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || /\.jpe?g$/i.test(file.name);

  if (!isJpeg) {
    return {
      supportedFormat: false,
      hasExif: false,
      sensitiveDetected: false,
      detectedFieldsCount: 0,
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // Verify JPEG SOI marker 0xFFD8
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
      return {
        supportedFormat: true,
        hasExif: false,
        sensitiveDetected: false,
        detectedFieldsCount: 0,
      };
    }

    let offset = 2;
    let app1Offset = -1;

    // Scan JPEG markers for APP1 (0xFFE1) containing "Exif\0\0"
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset);
      if (marker === 0xffe1) {
        const length = view.getUint16(offset + 2);
        // Check for "Exif\0\0" (0x457869660000)
        if (
          view.getUint32(offset + 4) === 0x45786966 &&
          view.getUint16(offset + 8) === 0x0000
        ) {
          app1Offset = offset + 10; // Start of TIFF header
          break;
        }
        offset += 2 + length;
      } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8) {
        const length = view.getUint16(offset + 2);
        offset += 2 + length;
      } else {
        break;
      }
    }

    if (app1Offset === -1) {
      return {
        supportedFormat: true,
        hasExif: false,
        sensitiveDetected: false,
        detectedFieldsCount: 0,
      };
    }

    // TIFF Header parsing
    const tiffHeader = app1Offset;
    const byteOrderMarker = view.getUint16(tiffHeader);
    const littleEndian = byteOrderMarker === 0x4949; // 'II'

    if (!littleEndian && byteOrderMarker !== 0x4d4d) {
      // Invalid byte order
      return {
        supportedFormat: true,
        hasExif: false,
        sensitiveDetected: false,
        detectedFieldsCount: 0,
      };
    }

    const firstIfdOffset = view.getUint32(tiffHeader + 4, littleEndian);
    if (firstIfdOffset < 8) {
      return {
        supportedFormat: true,
        hasExif: false,
        sensitiveDetected: false,
        detectedFieldsCount: 0,
      };
    }

    let make: string | undefined;
    let model: string | undefined;
    let dateTime: string | undefined;
    let software: string | undefined;
    let orientation: string | undefined;
    let lensModel: string | undefined;
    let gps: GpsLocation | undefined;

    let exifSubIfdOffset = -1;
    let gpsIfdOffset = -1;

    // Helper functions for reading TIFF fields safely
    const getString = (start: number, length: number): string => {
      let str = '';
      for (let i = 0; i < length; i++) {
        const charCode = view.getUint8(start + i);
        if (charCode === 0) break;
        str += String.fromCharCode(charCode);
      }
      return str.trim();
    };

    const getRational = (start: number): number => {
      const num = view.getUint32(start, littleEndian);
      const den = view.getUint32(start + 4, littleEndian);
      return den === 0 ? 0 : num / den;
    };

    const readIfd = (ifdPos: number) => {
      if (ifdPos + 2 > view.byteLength) return;
      const numEntries = view.getUint16(ifdPos, littleEndian);
      let entryPos = ifdPos + 2;

      for (let i = 0; i < numEntries; i++) {
        if (entryPos + 12 > view.byteLength) break;
        const tag = view.getUint16(entryPos, littleEndian);
        const type = view.getUint16(entryPos + 2, littleEndian);
        const count = view.getUint32(entryPos + 4, littleEndian);
        const valueOffset = entryPos + 8;

        let dataPos = valueOffset;
        if (
          (type === 2 && count > 4) ||
          (type === 5 && count > 0) ||
          (type === 10 && count > 0)
        ) {
          dataPos = tiffHeader + view.getUint32(valueOffset, littleEndian);
        }

        if (dataPos < view.byteLength) {
          if (tag === 0x010f) {
            make = getString(dataPos, count);
          } else if (tag === 0x0110) {
            model = getString(dataPos, count);
          } else if (tag === 0x0131) {
            software = getString(dataPos, count);
          } else if (tag === 0x0132) {
            dateTime = getString(dataPos, count);
          } else if (tag === 0x0112) {
            const orientVal = view.getUint16(valueOffset, littleEndian);
            const orientMap: Record<number, string> = {
              1: 'Top-Left (Normal)',
              3: 'Bottom-Right (180°)',
              6: 'Right-Top (Rotated 90° CW)',
              8: 'Left-Bottom (Rotated 270° CW)',
            };
            orientation = orientMap[orientVal] || `Orientation ${orientVal}`;
          } else if (tag === 0x8769) {
            exifSubIfdOffset = tiffHeader + view.getUint32(valueOffset, littleEndian);
          } else if (tag === 0x8825) {
            gpsIfdOffset = tiffHeader + view.getUint32(valueOffset, littleEndian);
          }
        }
        entryPos += 12;
      }
    };

    // Read 0th IFD
    readIfd(tiffHeader + firstIfdOffset);

    // Read Exif SubIFD if present (for DateTimeOriginal & LensModel)
    if (exifSubIfdOffset > 0 && exifSubIfdOffset + 2 < view.byteLength) {
      const numEntries = view.getUint16(exifSubIfdOffset, littleEndian);
      let entryPos = exifSubIfdOffset + 2;
      for (let i = 0; i < numEntries; i++) {
        if (entryPos + 12 > view.byteLength) break;
        const tag = view.getUint16(entryPos, littleEndian);
        const type = view.getUint16(entryPos + 2, littleEndian);
        const count = view.getUint32(entryPos + 4, littleEndian);
        const valueOffset = entryPos + 8;

        let dataPos = valueOffset;
        if (type === 2 && count > 4) {
          dataPos = tiffHeader + view.getUint32(valueOffset, littleEndian);
        }

        if (dataPos < view.byteLength) {
          if (tag === 0x9003 && !dateTime) {
            dateTime = getString(dataPos, count);
          } else if (tag === 0xa434) {
            lensModel = getString(dataPos, count);
          }
        }
        entryPos += 12;
      }
    }

    // Read GPS IFD if present
    if (gpsIfdOffset > 0 && gpsIfdOffset + 2 < view.byteLength) {
      let latRef = 'N';
      let longRef = 'E';
      let latDeg = 0, latMin = 0, latSec = 0;
      let longDeg = 0, longMin = 0, longSec = 0;
      let hasLat = false, hasLong = false;

      const numEntries = view.getUint16(gpsIfdOffset, littleEndian);
      let entryPos = gpsIfdOffset + 2;

      for (let i = 0; i < numEntries; i++) {
        if (entryPos + 12 > view.byteLength) break;
        const tag = view.getUint16(entryPos, littleEndian);
        const valueOffset = entryPos + 8;

        if (tag === 0x0001) {
          // GPSLatitudeRef ('N' or 'S')
          const char = String.fromCharCode(view.getUint8(valueOffset));
          if (char === 'N' || char === 'S') latRef = char;
        } else if (tag === 0x0003) {
          // GPSLongitudeRef ('E' or 'W')
          const char = String.fromCharCode(view.getUint8(valueOffset));
          if (char === 'E' || char === 'W') longRef = char;
        } else if (tag === 0x0002) {
          // GPSLatitude (3 Rationals)
          const dataPos = tiffHeader + view.getUint32(valueOffset, littleEndian);
          if (dataPos + 24 <= view.byteLength) {
            latDeg = getRational(dataPos);
            latMin = getRational(dataPos + 8);
            latSec = getRational(dataPos + 16);
            hasLat = true;
          }
        } else if (tag === 0x0004) {
          // GPSLongitude (3 Rationals)
          const dataPos = tiffHeader + view.getUint32(valueOffset, littleEndian);
          if (dataPos + 24 <= view.byteLength) {
            longDeg = getRational(dataPos);
            longMin = getRational(dataPos + 8);
            longSec = getRational(dataPos + 16);
            hasLong = true;
          }
        }
        entryPos += 12;
      }

      if (hasLat && hasLong) {
        let latitude = latDeg + latMin / 60 + latSec / 3600;
        if (latRef === 'S') latitude = -latitude;
        let longitude = longDeg + longMin / 60 + longSec / 3600;
        if (longRef === 'W') longitude = -longitude;

        gps = {
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          formatted: `${latitude.toFixed(4)}° ${latRef}, ${longitude.toFixed(4)}° ${longRef}`,
        };
      }
    }

    const detectedFieldsCount = [make, model, dateTime, software, orientation, lensModel, gps].filter(Boolean).length;
    const sensitiveDetected = Boolean(make || model || dateTime || software || gps);

    return {
      supportedFormat: true,
      hasExif: detectedFieldsCount > 0,
      make,
      model,
      dateTime,
      software,
      orientation,
      lensModel,
      gps,
      sensitiveDetected,
      detectedFieldsCount,
    };
  } catch (e) {
    return {
      supportedFormat: true,
      hasExif: false,
      sensitiveDetected: false,
      detectedFieldsCount: 0,
    };
  }
}
