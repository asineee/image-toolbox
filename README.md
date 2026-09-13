# ImageToolBox 🛠️📸

**Powerful image tools. Right in your browser.**

Resize, compress, convert, crop, rotate, flip, inspect, clean metadata, and process multiple images without uploading them to any server.

## 🔒 Privacy First

Privacy is built into the core architecture of ImageToolBox.

All image processing happens locally in the user's browser. Images are never uploaded to a server, cloud storage, or external image-processing service.

### Why Local Processing?

* **100% Client-Side:** Image processing runs directly in the browser using browser APIs such as Canvas, Blob, File, and `createImageBitmap`.
* **Zero Server Uploads:** Your images stay on your device.
* **No Cloud Processing:** Images are not sent to external APIs or storage services.
* **Fast Processing:** No upload or network-processing delay.

## ✨ Features

### EDIT

* 📐 **Resize** — Resize images with aspect-ratio control and preset scaling options.
* ✂️ **Crop** — Crop images using an interactive crop selection with support for desktop and mobile.
* 🔄 **Rotate & Flip** — Rotate images and flip them horizontally or vertically.

### OPTIMIZE

* 🗜️ **Compress** — Adjust image quality and reduce file size.
* 🔁 **Convert** — Convert between supported image formats.

### INSPECT

* ℹ️ **Image Info** — View filename, format, file size, dimensions, and aspect ratio.
* 🧹 **Metadata Cleaner** — Inspect available image metadata and create a cleaned copy where supported.
* ✏️ **Filename Rename** — Rename the image directly from Image Info while preserving the file extension.

### BATCH

* 📦 **Batch Processing** — Select multiple images and process them together.
* Supports **Resize, Compress, and Convert**.
* Individual processing status and downloads.
* Download completed results individually or together.
* Duplicate files are prevented from being added unnecessarily.

### EDITOR FEATURES

* ↩️ **Undo / Redo** — Restore previous or next editing states.
* 👁️ **Live Preview** — Preview processed images before downloading.
* 🔀 **Before / After Preview** — Compare the original and edited result.
* 💾 **Local Download** — Download processed images directly to your device.
* 🔄 **Reset** — Return the editor to its initial state.
* 🖱️ **Drag & Drop** — Easily add images using drag and drop.
* 📱 **Responsive UI** — Designed for desktop and mobile devices.

## 🛠️ Tech Stack

* **Framework:** Next.js 14.2.15 (App Router)
* **Library:** React 18.3.1
* **Language:** TypeScript 5.5.4
* **Styling:** Tailwind CSS 3.4.12
* **Icons:** Lucide React
* **Image Processing:** Browser Canvas API, Blob, File, and related client-side browser APIs
* **Metadata:** Browser-compatible metadata parsing

## 🏗️ Local Development

### Prerequisites

* Node.js 18.17 or higher
* npm 10.x or higher

### Installation

Clone the repository:

```bash
git clone https://github.com/asineee/image-toolbox.git
cd image-toolbox
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🏗️ Production Build

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

On Windows PowerShell, if `npm run` is blocked by PowerShell execution policy, use:

```powershell
npm.cmd run build
```

## 🚢 Deployment

ImageToolBox is designed as a privacy-first client-side application and can be deployed without a dedicated image-processing backend.

The project is currently deployed using **Cloudflare Pages**.

The application does not require a server to receive or process user images.

## 📁 Project Structure

```text
src/
├── app/
├── components/
│   ├── Editor/
│   │   ├── Tools/
│   │   └── ...
│   ├── Navbar.tsx
│   ├── LandingHero.tsx
│   └── ...
├── hooks/
├── utils/
└── types/
```

## 🔐 Privacy

ImageToolBox is designed so that image processing happens locally in the browser.

Your images are not intentionally uploaded to ImageToolBox servers or external image-processing services.

Always verify the behavior of third-party browser extensions, network tools, or other software installed on your device when handling sensitive images.

## 📄 License

MIT License.

Free to use, modify, and distribute for personal or commercial projects.
