# Image Toolbox 🛠️📸

> **Powerful image tools. Right in your browser.**
> 
> Resize, compress, convert, rotate, and inspect your images without uploading them to any server.

---

## 🔒 Privacy First

**Privacy is built into the core architecture of Image Toolbox.**

> **All image processing is performed locally in the user's browser using client-side browser APIs. Images are never uploaded to or stored on our server.**

### Why Local Processing?
- **100% Client-Side**: All operations (Resize, Compress, Convert, Rotate, Flip, Metadata Extraction) run locally via HTML5 Canvas 2D API.
- **Zero Server Storage**: Your media files never touch any external filesystem, cloud bucket, or database.
- **Instant Processing**: No network latency or cloud processing queues.

---

## ✨ Features (Version 1)

- ⚡ **Upload / Drag & Drop**: Smooth visual drag-and-drop zone with instant file validation, browse button, and 1-click sample demo images.
- 📐 **Resize**: Change pixel width and height with locked aspect ratio calculation and preset scale shortcuts (25%, 50%, 75%, 200%).
- 🗜️ **Compress**: Quality slider (1% – 100%) with real-time estimated output file size and percentage reduction badge.
- 🔄 **Format Conversion**: Convert seamlessly between **JPG**, **PNG**, and **WebP** formats.
- 🔁 **Rotate & Flip**: 90° left/right rotation and horizontal/vertical flipping.
- ℹ️ **Image Information**: Detailed metadata inspector (Filename, Format, File size, Width × Height pixel dimensions, Aspect ratio).
- 👁️ **Live Preview**: Interactive output view with press-and-hold original image comparison.
- 💾 **Local Download**: Local browser download trigger generating clean filenames (`photo-resized.jpg`, `photo-compressed.webp`).
- 🎨 **Modern Dark UI**: Creative dark-first interface with glassmorphism touches, responsive desktop/mobile layout, and micro-interactions.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14.2.15](https://nextjs.org/) (App Router)
- **Library**: [React 18.3.1](https://react.dev/)
- **Language**: [TypeScript 5.5.4](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js `v18.17` or higher (Tested on Node `v24.x`)
- npm `v10.x` or higher

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/image-toolbox.git
   cd image-toolbox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Production Build & Verification

To verify TypeScript types and create a production build:

```bash
# Type check and build static artifacts
npm run build

# Start production server
npm start
```

---

## 🚢 Deployment

Image Toolbox is 100% serverless compatible and can be deployed with zero backend infrastructure.

### Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Vercel automatically detects Next.js. Click **Deploy**.

### Netlify / Cloudflare Pages / Static Hosting
1. Set build command: `npm run build`
2. Set publish directory: `.next` (or export as static site).

---

## 📄 License

MIT License. Free to use, modify, and distribute for personal or commercial projects.
