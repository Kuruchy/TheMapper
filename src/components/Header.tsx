import React, { useRef } from 'react';
import { Download, Upload, Map, Sliders, Eye, EyeOff, Sparkles, Layers } from 'lucide-react';
import { ImageMetadata, GridSettings } from '../types';

interface HeaderProps {
  imageMeta: ImageMetadata | null;
  gridSettings: GridSettings;
  isGridVisible: boolean;
  onToggleGridVisibility: () => void;
  onOpenExportModal: () => void;
  onOpenSampleMaps: () => void;
  onImageSelected: (file: File) => void;
  zoomLevel: number;
}

export const Header: React.FC<HeaderProps> = ({
  imageMeta,
  gridSettings,
  isGridVisible,
  onToggleGridVisibility,
  onOpenExportModal,
  onOpenSampleMaps,
  onImageSelected,
  zoomLevel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const getGridLabel = () => {
    switch (gridSettings.gridType) {
      case 'hex-pointy':
        return 'Pointy Hex';
      case 'hex-flat':
        return 'Flat Hex';
      case 'square':
        return 'Square Grid';
    }
  };

  return (
    <header className="h-14 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none text-stone-200">
      {/* Brand & Active Image Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-stone-100">HexGrid Studio</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Battlemap & image grid layer overlay
            </p>
          </div>
        </div>

        {/* Image metadata tag */}
        {imageMeta && (
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-stone-800 text-xs text-stone-400">
            <span className="truncate max-w-[140px] text-stone-300 font-medium">{imageMeta.name}</span>
            <span className="text-stone-600">·</span>
            <span className="font-mono text-stone-400">{imageMeta.width}×{imageMeta.height}</span>
            <span className="text-stone-600">·</span>
            <span className="font-mono text-amber-400/90">{getGridLabel()} ({gridSettings.cellSize}px)</span>
            <span className="text-stone-600">·</span>
            <span className="font-mono text-stone-500">{Math.round(zoomLevel * 100)}%</span>
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Toggle Grid Visibility */}
        <button
          onClick={onToggleGridVisibility}
          title={isGridVisible ? 'Hide grid overlay' : 'Show grid overlay'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            isGridVisible
              ? 'bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-800'
              : 'bg-stone-900 border-dashed border-stone-700 text-stone-500 hover:text-stone-300'
          }`}
        >
          {isGridVisible ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isGridVisible ? 'Grid On' : 'Grid Off'}</span>
        </button>

        {/* Sample Maps Modal Button */}
        <button
          onClick={onOpenSampleMaps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 transition-colors"
          title="Choose a battlemap preset"
        >
          <Map className="w-3.5 h-3.5 text-stone-400" />
          <span>Sample Maps</span>
        </button>

        {/* Upload Custom Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white transition-colors"
          title="Upload an image from your computer (or drag & drop anywhere)"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Image</span>
        </button>

        {/* Export High-Res Gridded Image Button */}
        <button
          onClick={onOpenExportModal}
          disabled={!imageMeta}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export image with grid baked in at full resolution"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Image</span>
        </button>
      </div>
    </header>
  );
};
