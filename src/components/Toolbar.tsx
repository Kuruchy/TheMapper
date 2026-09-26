import React from 'react';
import { 
  Hand, 
  Move, 
  Columns, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ActiveTool } from '../types';

interface ToolbarProps {
  activeTool: ActiveTool;
  onChangeTool: (tool: ActiveTool) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoom100: () => void;
  onResetView: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onChangeTool,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoom100,
  onResetView,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 bg-stone-900/90 border border-stone-800 rounded-xl backdrop-blur-md shadow-2xl text-stone-200">
      {/* Tool Selection */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-stone-800">
        <button
          onClick={() => onChangeTool('pan')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'pan'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
              : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title="Pan / Navigate Map (Hold Spacebar or drag)"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Pan</span>
        </button>

        <button
          onClick={() => onChangeTool('align-grid')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'align-grid'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
              : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title="Drag to Align Grid: Click and drag anywhere on the canvas to nudge grid X/Y position"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Align Grid</span>
        </button>

        <button
          onClick={() => onChangeTool('split-compare')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'split-compare'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
              : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title="Split View: Drag divider to compare original map vs gridded overlay"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split View</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 pl-1">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Zoom out (Mouse wheel down)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onZoom100}
          className="px-2 py-1 text-xs font-mono rounded hover:bg-stone-800 text-stone-300 font-medium min-w-[50px] text-center"
          title="Click for 100% 1:1 pixel view"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Zoom in (Mouse wheel up)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onZoomFit}
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Fit map to viewport"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetView}
          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Reset pan & zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
