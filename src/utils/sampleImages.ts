export interface SampleImage {
  id: string;
  name: string;
  category: string;
  description: string;
  createFile: () => Promise<File>;
}

function svgToBlob(svgString: string, filename: string): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        const file = new File([pngBlob!], filename, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    };

    img.src = url;
  });
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-landscape',
    name: 'Neon Horizon.png',
    category: 'Landscape',
    description: '1200 × 800 Vibrant Gradient Sample',
    createFile: async () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f172a" />
              <stop offset="50%" stop-color="#312e81" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e" />
              <stop offset="100%" stop-color="#fbbf24" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#bg)" />
          <circle cx="600" cy="450" r="220" fill="url(#sun)" />
          <path d="M 0 550 Q 300 480 600 550 T 1200 550 L 1200 800 L 0 800 Z" fill="#090d16" opacity="0.95" />
          <path d="M 0 620 Q 400 580 800 640 T 1200 620 L 1200 800 L 0 800 Z" fill="#04070d" />
          <text x="600" y="240" font-family="system-ui, sans-serif" font-size="48" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">IMAGE TOOLBOX</text>
          <text x="600" y="290" font-family="system-ui, sans-serif" font-size="22" font-weight="500" fill="#a5b4fc" text-anchor="middle">Private • In-Browser Demo Sample</text>
        </svg>
      `;
      return svgToBlob(svg, 'Neon_Horizon.png');
    },
  },
  {
    id: 'sample-portrait',
    name: 'Cyberpunk Portrait.png',
    category: 'Abstract',
    description: '1200 × 800 Modern Graphic Art Sample',
    createFile: async () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#18181b" />
              <stop offset="100%" stop-color="#4c0519" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#bg2)" />
          <rect x="200" y="150" width="800" height="500" rx="30" fill="none" stroke="#6366f1" stroke-width="4" opacity="0.6" />
          <circle cx="600" cy="400" r="180" fill="none" stroke="#22d3ee" stroke-width="12" />
          <polygon points="600,240 740,480 460,480" fill="#e11d48" opacity="0.8" />
          <text x="600" y="600" font-family="system-ui, sans-serif" font-size="32" font-weight="700" fill="#f43f5e" text-anchor="middle">SAMPLE DEMO IMAGE</text>
        </svg>
      `;
      return svgToBlob(svg, 'Cyberpunk_Portrait.png');
    },
  },
];
