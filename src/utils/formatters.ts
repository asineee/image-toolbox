export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function calculateAspectRatioStr(width: number, height: number): string {
  if (!width || !height) return 'N/A';
  
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;

  // Standard ratio labels
  const ratioFloat = width / height;
  if (Math.abs(ratioFloat - 16 / 9) < 0.03) return '16:9';
  if (Math.abs(ratioFloat - 4 / 3) < 0.03) return '4:3';
  if (Math.abs(ratioFloat - 1) < 0.03) return '1:1 (Square)';
  if (Math.abs(ratioFloat - 9 / 16) < 0.03) return '9:16 (Story)';
  if (Math.abs(ratioFloat - 3 / 2) < 0.03) return '3:2';

  if (w <= 30 && h <= 30) {
    return `${w}:${h}`;
  }
  return `${ratioFloat.toFixed(2)}:1`;
}

export function mimeToExtension(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export function extensionToMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}
