import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ActiveTool, GridSettings, ImageMetadata } from '../types';
import { renderGridLayer } from '../utils/gridRenderer';
import { Upload, Move, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CanvasViewportProps {
  imageMeta: ImageMetadata | null;
  baseImage: HTMLImageElement | null;
  gridSettings: GridSettings;
  isGridVisible: boolean;
  activeTool: ActiveTool;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onUpdateZoom: (zoom: number | ((prev: number) => number)) => void;
  onUpdatePan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  onUpdateGridOffset: (dx: number, dy: number) => void;
  onImageSelected: (file: File) => void;
  onOpenSampleMaps: () => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  imageMeta,
  baseImage,
  gridSettings,
  isGridVisible,
  activeTool,
  zoomLevel,
  panOffset,
  onUpdateZoom,
  onUpdatePan,
  onUpdateGridOffset,
  onImageSelected,
  onOpenSampleMaps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [splitPosition, setSplitPosition] = useState(0.5); // 0 to 1
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Keyboard shortcut for spacebar pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Clipboard paste listener (Cmd/Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            onImageSelected(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected]);

  // Main canvas render loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Set display buffer resolution for sharp rendering
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (!baseImage || !imageMeta) {
      ctx.restore();
      return;
    }

    // Apply viewport transform (pan & zoom)
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    const imgW = imageMeta.width;
    const imgH = imageMeta.height;

    if (activeTool === 'split-compare' && isGridVisible) {
      // Split view mode: Left side without grid, Right side with grid
      const splitX = imgW * splitPosition;

      // 1. Draw base image
      ctx.drawImage(baseImage, 0, 0, imgW, imgH);

      // 2. Draw grid only on right portion via clipping mask
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, imgW - splitX, imgH);
      ctx.clip();
      renderGridLayer(ctx, imgW, imgH, gridSettings);
      ctx.restore();

      // 3. Draw vertical split line indicator
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2 / zoomLevel;
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, imgH);
      ctx.stroke();

      // Small handle icon at split point
      const handleY = imgH / 2;
      const handleRadius = 14 / zoomLevel;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(splitX, handleY, handleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.font = `bold ${Math.round(10 / zoomLevel)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⬌', splitX, handleY);
      ctx.restore();
    } else {
      // Standard render: Base image + full grid layer
      ctx.drawImage(baseImage, 0, 0, imgW, imgH);

      if (isGridVisible) {
        renderGridLayer(ctx, imgW, imgH, gridSettings);
      }
    }

    ctx.restore();
  }, [baseImage, imageMeta, gridSettings, isGridVisible, activeTool, zoomLevel, panOffset, splitPosition]);

  useEffect(() => {
    let animId: number;
    const render = () => {
      drawCanvas();
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [drawCanvas]);

  // Handle Wheel Zoom (centered around cursor position)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!imageMeta) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.08, Math.min(8.0, zoomLevel * zoomFactor));

    // Shift pan offset to keep mouse point anchored in world coordinates
    const wx = (cursorX - panOffset.x) / zoomLevel;
    const wy = (cursorY - panOffset.y) / zoomLevel;

    const newPanX = cursorX - wx * newZoom;
    const newPanY = cursorY - wy * newZoom;

    onUpdateZoom(newZoom);
    onUpdatePan({ x: newPanX, y: newPanY });
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageMeta) return;

    // Check if clicking near split slider in split-compare mode
    if (activeTool === 'split-compare') {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const wx = (cursorX - panOffset.x) / zoomLevel;
        const splitX = imageMeta.width * splitPosition;
        if (Math.abs(wx - splitX) < 25 / zoomLevel) {
          setIsDraggingSplit(true);
          return;
        }
      }
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageMeta) return;

    if (isDraggingSplit) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const wx = (cursorX - panOffset.x) / zoomLevel;
      const newPos = Math.max(0.02, Math.min(0.98, wx / imageMeta.width));
      setSplitPosition(newPos);
      return;
    }

    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (activeTool === 'align-grid' && !isSpacePressed && e.buttons === 1) {
      // Direct grid alignment: move the grid offset in map pixel coordinates
      const mapDx = dx / zoomLevel;
      const mapDy = dy / zoomLevel;
      onUpdateGridOffset(mapDx, mapDy);
    } else {
      // Standard panning
      onUpdatePan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Mouse Up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingSplit(false);
  };

  // Drag and Drop Image File handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  // Cursor style calculation
  const getCursorClass = () => {
    if (isDraggingSplit) return 'cursor-ew-resize';
    if (isSpacePressed) return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    if (activeTool === 'pan') return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    if (activeTool === 'align-grid') return 'cursor-move';
    if (activeTool === 'split-compare') return 'cursor-col-resize';
    return 'cursor-default';
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 h-full bg-stone-950 overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Empty State / Welcome Dropzone */}
      {!imageMeta && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="max-w-md w-full p-8 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-stone-100 mb-2">Add Your Battlemap or Image</h2>
            <p className="text-sm text-stone-400 mb-6">
              Drag and drop any map or artwork here, paste from your clipboard (Ctrl+V), or test instantly with a pre-loaded sample.
            </p>

            <div className="space-y-3">
              <label className="block w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm cursor-pointer shadow-md transition-all text-center">
                Browse Image from Device
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onImageSelected(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <button
                onClick={onOpenSampleMaps}
                className="w-full py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm border border-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load a Ready-to-Use Battlemap</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800/80 text-[11px] text-stone-500 flex items-center justify-center gap-4">
              <span>Supports PNG, JPG, WebP, SVG</span>
              <span>·</span>
              <span>Full Lossless Export</span>
            </div>
          </div>
        </div>
      )}

      {/* Drag Over Overlay Highlight */}
      {isDragOver && (
        <div className="absolute inset-0 bg-amber-500/15 border-4 border-dashed border-amber-400 z-40 flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <div className="bg-stone-900 border border-stone-700 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <Upload className="w-6 h-6 text-amber-400 animate-bounce" />
            <span className="text-stone-100 font-semibold text-base">Drop image to load onto canvas</span>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full block ${getCursorClass()}`}
      />

      {/* Status Bar / Tool Hint Overlay */}
      {imageMeta && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
          <div className="bg-stone-900/85 backdrop-blur-md border border-stone-800/80 px-2.5 py-1 rounded-md text-[11px] text-stone-400 shadow-lg flex items-center gap-2">
            {activeTool === 'align-grid' ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Move className="w-3.5 h-3.5" />
                Click & drag to align grid with map landmarks
              </span>
            ) : activeTool === 'split-compare' ? (
              <span>Drag the amber divider handle to compare with & without grid</span>
            ) : (
              <span>Hold <kbd className="px-1 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]">Space</kbd> or drag to pan · Scroll to zoom</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
