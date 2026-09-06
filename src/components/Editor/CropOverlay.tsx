'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { CropRect } from '../../types/image';

interface CropOverlayProps {
  imageElement: HTMLImageElement | null;
  cropRect: CropRect;
  onChange: (newRect: CropRect) => void;
  imageWidth: number;
  imageHeight: number;
}

type HandleType = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

export const CropOverlay: React.FC<CropOverlayProps> = memo(({
  imageElement,
  cropRect,
  onChange,
  imageWidth,
  imageHeight,
}) => {
  const [activeHandle, setActiveHandle] = useState<HandleType>(null);
  const [bounds, setBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const startPosRef = useRef<{ pageX: number; pageY: number; rect: CropRect } | null>(null);

  const updateBounds = useCallback(() => {
    if (!imageElement || !imageElement.parentElement) return;
    const parentRect = imageElement.parentElement.getBoundingClientRect();
    const imgRect = imageElement.getBoundingClientRect();

    if (imgRect.width > 0 && imgRect.height > 0) {
      setBounds({
        left: imgRect.left - parentRect.left,
        top: imgRect.top - parentRect.top,
        width: imgRect.width,
        height: imgRect.height,
      });
    }
  }, [imageElement]);

  useEffect(() => {
    updateBounds();

    if (!imageElement) return;

    // 1. Recalculate bounds when image src finishes loading
    imageElement.addEventListener('load', updateBounds);

    // 2. Use ResizeObserver to detect DOM size updates of the img element
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateBounds();
      });
      resizeObserver.observe(imageElement);
      if (imageElement.parentElement) {
        resizeObserver.observe(imageElement.parentElement);
      }
    }

    window.addEventListener('resize', updateBounds);

    return () => {
      imageElement.removeEventListener('load', updateBounds);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateBounds);
    };
  }, [imageElement, updateBounds]);

  const handlePointerDown = (handle: HandleType, pageX: number, pageY: number) => {
    setActiveHandle(handle);
    startPosRef.current = {
      pageX,
      pageY,
      rect: { ...cropRect },
    };
  };

  const handleMouseDown = (handle: HandleType) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handlePointerDown(handle, e.pageX, e.pageY);
  };

  const handleTouchStart = (handle: HandleType) => (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      const t = e.touches[0];
      handlePointerDown(handle, t.pageX, t.pageY);
    }
  };

  useEffect(() => {
    if (!activeHandle || !imageElement) return;

    const handlePointerMove = (pageX: number, pageY: number) => {
      if (!startPosRef.current || !imageElement) return;

      const imgRect = imageElement.getBoundingClientRect();
      if (imgRect.width <= 0 || imgRect.height <= 0) return;

      const deltaX = (pageX - startPosRef.current.pageX) / imgRect.width;
      const deltaY = (pageY - startPosRef.current.pageY) / imgRect.height;
      const initial = startPosRef.current.rect;

      const MIN_SIZE = 0.02; // 2% minimum crop dimension

      let x = initial.x;
      let y = initial.y;
      let width = initial.width;
      let height = initial.height;

      if (activeHandle === 'move') {
        x = Math.max(0, Math.min(1 - width, initial.x + deltaX));
        y = Math.max(0, Math.min(1 - height, initial.y + deltaY));
      } else {
        let newX = initial.x;
        let newY = initial.y;
        let newW = initial.width;
        let newH = initial.height;

        if (activeHandle.includes('w')) {
          const maxDeltaX = initial.width - MIN_SIZE;
          const clampedDeltaX = Math.min(initial.x, Math.max(-maxDeltaX, deltaX));
          newX = initial.x + clampedDeltaX;
          newW = initial.width - clampedDeltaX;
        }
        if (activeHandle.includes('e')) {
          const maxW = 1 - initial.x;
          newW = Math.max(MIN_SIZE, Math.min(maxW, initial.width + deltaX));
        }
        if (activeHandle.includes('n')) {
          const maxDeltaY = initial.height - MIN_SIZE;
          const clampedDeltaY = Math.min(initial.y, Math.max(-maxDeltaY, deltaY));
          newY = initial.y + clampedDeltaY;
          newH = initial.height - clampedDeltaY;
        }
        if (activeHandle.includes('s')) {
          const maxH = 1 - initial.y;
          newH = Math.max(MIN_SIZE, Math.min(maxH, initial.height + deltaY));
        }

        x = Math.max(0, Math.min(1 - MIN_SIZE, newX));
        y = Math.max(0, Math.min(1 - MIN_SIZE, newY));
        width = Math.max(MIN_SIZE, Math.min(1 - x, newW));
        height = Math.max(MIN_SIZE, Math.min(1 - y, newH));
      }

      onChange({ x, y, width, height });
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handlePointerMove(e.pageX, e.pageY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].pageX, e.touches[0].pageY);
      }
    };

    const onPointerUp = () => {
      setActiveHandle(null);
      startPosRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [activeHandle, imageElement, onChange]);

  if (!imageElement || !bounds) return null;

  const leftPct = `${cropRect.x * 100}%`;
  const topPct = `${cropRect.y * 100}%`;
  const widthPct = `${cropRect.width * 100}%`;
  const heightPct = `${cropRect.height * 100}%`;

  const pixelCropW = Math.max(1, Math.round(cropRect.width * imageWidth));
  const pixelCropH = Math.max(1, Math.round(cropRect.height * imageHeight));

  return (
    <div
      className="absolute pointer-events-auto select-none z-20 overflow-visible"
      style={{
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
      }}
    >
      {/* SVG Mask overlay outside crop rectangle */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible rounded-xl">
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={`${cropRect.x * 100}%`}
              y={`${cropRect.y * 100}%`}
              width={`${cropRect.width * 100}%`}
              height={`${cropRect.height * 100}%`}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.65)" mask="url(#crop-mask)" />
      </svg>

      {/* Crop Selection Box */}
      <div
        style={{
          left: leftPct,
          top: topPct,
          width: widthPct,
          height: heightPct,
        }}
        onMouseDown={handleMouseDown('move')}
        onTouchStart={handleTouchStart('move')}
        className="absolute border-2 border-cyan-400 bg-transparent shadow-2xl cursor-move flex flex-col justify-between group overflow-visible"
      >
        {/* Rule of Thirds Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
          <div className="border-r border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-r border-b border-white/60" />
          <div className="border-b border-white/60" />
          <div className="border-r border-white/60" />
          <div className="border-r border-white/60" />
          <div />
        </div>

        {/* Pixel Dimensions Badge */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-dark-900/95 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 shadow-lg whitespace-nowrap pointer-events-none z-30">
          {pixelCropW} × {pixelCropH} px
        </div>

        {/* 8 Resize Handles (Fully unclipped with z-30 & touch padding) */}
        {/* NW */}
        <div
          onMouseDown={handleMouseDown('nw')}
          onTouchStart={handleTouchStart('nw')}
          className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-nwse-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize North-West"
        />
        {/* N */}
        <div
          onMouseDown={handleMouseDown('n')}
          onTouchStart={handleTouchStart('n')}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-ns-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize North"
        />
        {/* NE */}
        <div
          onMouseDown={handleMouseDown('ne')}
          onTouchStart={handleTouchStart('ne')}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-nesw-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize North-East"
        />
        {/* E */}
        <div
          onMouseDown={handleMouseDown('e')}
          onTouchStart={handleTouchStart('e')}
          className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-ew-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize East"
        />
        {/* SE */}
        <div
          onMouseDown={handleMouseDown('se')}
          onTouchStart={handleTouchStart('se')}
          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-nwse-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize South-East"
        />
        {/* S */}
        <div
          onMouseDown={handleMouseDown('s')}
          onTouchStart={handleTouchStart('s')}
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-ns-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize South"
        />
        {/* SW */}
        <div
          onMouseDown={handleMouseDown('sw')}
          onTouchStart={handleTouchStart('sw')}
          className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-nesw-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize South-West"
        />
        {/* W */}
        <div
          onMouseDown={handleMouseDown('w')}
          onTouchStart={handleTouchStart('w')}
          className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-cyan-400 border-2 border-white rounded-full cursor-ew-resize shadow-lg hover:scale-125 transition-transform z-30"
          title="Resize West"
        />
      </div>
    </div>
  );
});

CropOverlay.displayName = 'CropOverlay';
